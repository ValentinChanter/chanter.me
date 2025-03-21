import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import { CONFIG } from "@/config/bingo";
import { r2 } from '@/lib/r2';

import { GetObjectCommand } from '@aws-sdk/client-s3'

function initGrid(words: string[]) {
    const grid = [] as { word: string, colors: string[] }[];
    for (const word of words) {
        grid.push({ word, colors: [] });
    }

    return grid;
}

// We'll get 2n random words from the wordlist, and statiscally, we should get at least n words that are not in the blacklist (and by far)
async function getNWords(stream: fs.ReadStream | NodeJS.ReadableStream, n: number ) {
    const lines = new Set<number>(); // Set to avoid duplicates

    // Get 2n random lines
    while (lines.size < 2 * n) {
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
        if (i === maxLine || words.length === n) break;
        i++;
    }

    // Put the words in the order the lines were picked at the start (shuffling, in a way)
    // We could also do regular shuffling but would be a waste not to reuse the lines we picked
    return words.sort((a) => lines.has(a.line) ? -1 : 1).map(({ word }) => word);
}

export default async function createGrid() {
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


    const words = await getNWords(stream, 25 + 1);
    const startWord = words.pop();

    if (!startWord) return new Response("Start word not found", { status: 500 });

    return { grid: initGrid(words), startWord };
}