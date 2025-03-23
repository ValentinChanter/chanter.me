import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }

    let { code } = body as { code: string | null };

    if (!code) {
        return new Response("Missing code", { status: 400 });
    }

    code = code.toUpperCase();

    if (!/^[A-Z0-9]{4}$/.test(code)) {
        return new Response("Incorrect code", { status: 400 });
    }

    const grid = await prisma.bingoGrids.findFirst({
        where: {
            code
        }
    });

    if (!grid) {
        return new Response("Room doesn't exist", { status: 422 });
    }

    const owner = await prisma.bingoPlayers.findFirst({
        where: {
            roomCode: code,
            id: grid.owner
        }
    });

    if (!owner) {
        return new Response("Owner not found", { status: 422 });
    }

    return NextResponse.json({ owner: owner.username, playerCount: grid.players.length });
}