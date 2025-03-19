import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { GetObjectCommand } from '@aws-sdk/client-s3'

import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as path from "path";

import { CONFIG } from "@/config/bingo";

import { r2 } from '@/lib/r2';

const prisma = new PrismaClient();

let wordlist = [] as string[];

function genCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function initGrid(words: string[]) {
    const grid = [] as { word: string, checkedBy: string[] }[];
    for (const word of words) {
        grid.push({ word, checkedBy: [] });
    }

    return grid;
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { token } = body;

    try {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload> jwt.verify(token, secret);

        if (decoded.username && decoded.uuid) {
            const user = await prisma.users.findFirst({
                where: {
                    username: decoded.username,
                    currentUUID: decoded.uuid,
                },
            });

            if (user && user.username === "Admin") {

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

                // If there is a grid with the same code, regenerate the code
                let code = genCode();
                let found = false;
                do {
                    const prevGrid = await prisma.bingoGrids.findFirst({
                        where: {
                            code
                        }
                    });
                    if (prevGrid) {
                        code = genCode();
                        found = true;
                    } else {
                        found = false;
                    }
                } while (found);

                const grid = initGrid(words);
                await prisma.bingoGrids.create({
                    data: {
                        code,
                        owner: user.id,
                        grid,
                        players: [user.id]
                    }
                });

                // Write code in user's jwt
                const newToken = jwt.sign({ username: decoded.username, uuid: decoded.uuid, code }, secret);

                return NextResponse.json({ words, token: newToken });
            } else {
                return new Response("Not the admin", { status: 400 });
            }
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch(e) {
        console.error(e);
        return new Response("Invalid token", { status: 400 });
    }
}