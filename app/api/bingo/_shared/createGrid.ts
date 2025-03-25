import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import { CONFIG } from "@/config/bingo";
import { r2 } from '@/lib/r2';
import example from "./parseInfoExample";

import { GetObjectCommand } from '@aws-sdk/client-s3'

async function parseInfoFromWikipedia(words: string[]) {
    const url = process.env.WIKI_API_URL + words.map(word => encodeURIComponent(word)).join("|");
    const params = {
        headers: {
            'Accept-Encoding': 'gzip',
            'User-Agent': `WikiraceBingo/1.0 (${process.env.NEXT_PUBLIC_BASE_URL}/bingo; ${process.env.EMAIL}) Next.js/15.2.2`,
        },
    };

    const res = await fetch(url, params);
    const data = await res.json();

    /**
     * Example of data:
     *  {
     *      "continue": {
     *          "excontinue": NUMBER_TO_CONTINUE_FOR_THE_NEXT,
     *          "continue": "||"
     *      },
     *      "query": {
     *          "normalized": [
     *              {
     *                  "from": "WORD",
     *                  "to": "NORMALIZED_WORD"
     *              }
     *          "redirects": [
     *              {
     *                  "from": "WORD",
     *                  "to": "REDIRECTED_WORD"
     *              }
     *          ],
     *          "pages": {
     *              "PAGE_ID": {
     *                  "pageid": PAGE_ID,
     *                  "ns": 0,
     *                  "title": "REDIRECTED_WORD/WORD",
     *                  "extract": "DESCRIPTION"
     *              }
     *          }
     *      }
     *  }
     */

    let dataContinue = data.continue as { excontinue: number, continue: string } | undefined;
    const normalized = data.query.normalized as { from: string, to: string }[];
    const redirected = data.query.redirects as { from: string, to: string }[];
    const pages = data.query.pages as { [key: string]: { pageid: string, ns: number, title: string, extract: string } };

    while (dataContinue) {
        const continueUrl = url + `&excontinue=${dataContinue.excontinue}`;
        const continueRes = await fetch(continueUrl, params);
        const continueData = await continueRes.json();
        const continuePages = continueData.query.pages as { [key: string]: { pageid: string, ns: number, title: string, extract: string } };
        
        dataContinue = continueData.continue as { excontinue: number, continue: string } | undefined;
        for (const [key, page] of Object.entries(continuePages)) {
            if (page.extract && !pages[key]?.extract) {
                pages[key] = page;
            }
        }
    }

    return words
    .map((word) => {
        // Input word is like an_example, the normalized will be from "an_example" to "An Example" and the redirected will be from "An Example" to "The Example", so the final word is the redirected, from the normalized
        const normalizedWord = normalized.find(n => n.from === word);
        const redirectedWord = redirected.find(r => r.from === normalizedWord?.to || r.from === word);
        const finalWord = redirectedWord?.to || normalizedWord?.to || word;

        // Filter out words that, after normalization or redirection, are in the blacklist
        // Replace " " with "_" since the RegEx are made for the ns0 titles that use "_" instead of " "
        if (CONFIG.wordBlacklist.some(regex => regex.test(finalWord.replace(/ /g, "_")))) {
            return undefined;
        }

        const page = Object.values(pages).find(p => p.title === finalWord);

        return {
            word: finalWord,
            description: page?.extract,
        };
    })
    .filter((info) => {
        return info !== undefined
        && info.description
        && !info.description.includes("peut faire référence à")
    }) as { word: string, description: string }[];
}

function initGrid(info: { word: string, description: string }[]) {
    const grid = [] as { word: string, colors: string[], description: string }[]; // Can't use Cell type here because the database only accepts JsonValue[], which Cell is not but this is
    for (const { word, description } of info) {
        grid.push({ word, colors: [], description });
    }

    return grid;
}

// We'll get (the closest multiple of 20 above 1.5n) random words from the wordlist, and statiscally, we should get at least n words that are not in the blacklist (and by far)
async function getWords(stream: fs.ReadStream | NodeJS.ReadableStream, n: number) {
    const lines = new Set<number>(); // Set to avoid duplicates
    const upperBound = Math.ceil(1.5 * n / 20) * 20; // Get (the closest multiple of 20 above 1.5n) random lines. 20 because Wikipedia requests are 20 per continue

    while (lines.size < upperBound) {
        const line = Math.floor(Math.random() * CONFIG.linecount);

        lines.add(line);
    }

    const maxLine = Math.max(...Array.from(lines));

    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    const words = [] as { word: string, line: number }[];
    let i = 1;
    for await (const line of rl) {
        if (lines.has(i) && !CONFIG.wordBlacklist.some(regex => regex.test(line))) {
            words.push({ word: line, line: i });
        }

        // Stop early if we reach the max line or if we have enough words
        if (i === maxLine) break;
        i++;
    }

    // Put the words in the order the lines were picked at the start (shuffling, in a way)
    // We could also do regular shuffling but would be a waste not to reuse the lines we picked
    return words.sort((a) => lines.has(a.line) ? -1 : 1).map(({ word }) => word);
}

export default async function createGrid() {
    let info;

    if (process.env.NODE_ENV === "production") {
        let stream;

        const filePath = path.join(process.cwd(), "public", `frwiki-${CONFIG.date}-all-titles-in-ns-0`);
        if (fs.existsSync(filePath)) {
            stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
        } else {
            console.log("[WARN] Reading wordlist from S3 Bucket");

            const file = await r2.send(new GetObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: `frwiki-${CONFIG.date}-all-titles-in-ns-0`,
            }));

            if (!file || !file.Body) {
                return new Response("Wordlist not found", { status: 500 });
            }

            stream = file.Body as NodeJS.ReadableStream;
        }

        const rawWords = await getWords(stream, 25 + 1);
        info = await parseInfoFromWikipedia(rawWords)
    } else info = example;

    const firsts = info.slice(0, 25);
    const startWord = info[25].word;

    return { grid: initGrid(firsts), startWord };
}