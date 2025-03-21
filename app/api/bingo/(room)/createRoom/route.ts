import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { CONFIG } from "@/config/bingo";
import createGrid from '../../_shared/createGrid';

const prisma = new PrismaClient();

function genCode() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }
    
    const { username, token } = body;

    if (!username || !token) {
        return new Response("Missing parameters", { status: 400 });
    }

    if (token === process.env.BINGO_TOKEN) {
        let code = genCode();
        const publicID = uuidv4();

        const allRooms = await prisma.bingoGrids.findMany();

        while (allRooms.find((room) => room.code === code)) {
            code = genCode();
        }

        const ownerColor = CONFIG.colors.find((color) => color.name === "Violet")?.hex as string; // TODO: Add default color in options before creation
        const user = await prisma.bingoPlayers.create({
            data: {
                publicID,
                username,
                roomCode: code,
                color: ownerColor,
            }
        });

        const res = await createGrid();
        if (res instanceof Response) return res;
        const { grid, startWord } = res;

        await prisma.bingoGrids.create({
            data: {
                code,
                owner: user.id,
                players: [user.id],
                grid,
                startWord
            }
        });

        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const token = jwt.sign({ username, id: publicID, code, owner: true, color: ownerColor }, secret);

        return NextResponse.json({ token });
    } else {
        return new Response("Invalid token", { status: 401 });
    }
}