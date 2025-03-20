import * as fs from "fs";
import * as path from "path";

import { CONFIG } from "@/config/bingo";

import { GetObjectCommand } from '@aws-sdk/client-s3'

import { r2 } from '@/lib/r2';

function initGrid(words: string[]) {
    const grid = [] as { word: string, colors: string[] }[];
    for (const word of words) {
        grid.push({ word, colors: [] });
    }

    return grid;
}

export default async function createGrid() {
    let wordlist: string[] = [];
    
    const data = fs.readFileSync(path.join(process.cwd(), "public",  `frwiki-${CONFIG.date}-all-titles-in-ns-0`), "utf8");

    if (!data) {
        const file = await r2.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: `frwiki-${CONFIG.date}-all-titles-in-ns-0`,
        }));

        if (!file || !file.Body) {
            return new Response("Wordlist not found", { status: 500 });
        }

        const data = await file.Body.transformToString();
        wordlist = data.split("\n").filter(word => !CONFIG.wordBlacklist.some((regex) => regex.test(word)));

        if (wordlist.length === 0) {
            return new Response("Wordlist empty", { status: 500 });
        }

        console.log("[WARN] Reading wordlist from R2 Bucket");
    }

    wordlist = data.split("\n").filter(word => !CONFIG.wordBlacklist.some((regex) => regex.test(word)));

    if (wordlist.length === 0) {
        return new Response("Wordlist empty", { status: 500 });
    }

    const words = [] as string[];

    if (wordlist.length <= 25) {
        words.push(...wordlist);
    } else {
        while (words.length < 25) {
            const word = wordlist[Math.floor(Math.random() * wordlist.length)];
            if (!words.includes(word)) {
                words.push(word);
            }
        }
    }

    return initGrid(words);
}