import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { Cell, Player } from "../../../../bingo/types";

import { extractCodeAndDecodedTokenFromBody } from "../../_shared/extractCodeAndDecodedTokenFromBody";
import { isPlayerInRoom } from "../../_shared/isPlayerInRoom";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const extracted = await extractCodeAndDecodedTokenFromBody(req);
    if (extracted instanceof Response) return extracted;
    const { code, decoded } = extracted;

    if (code === decoded.code) {
        const data = await isPlayerInRoom(decoded.id, code);
        if (!data) return new Response("Player not in room", { status: 400 });

        // Get grid
        const { room } = data;
        const grid = room.grid as { word: string, colors: string[], description: string }[];

        // Get players
        const allPlayersInRoom = await prisma.bingoPlayers.findMany({
            where: {
                roomCode: code
            },
            select: {
                id: true,
                publicID: true,
                username: true,
                color: true
            }
        });

        if (!allPlayersInRoom) return new Response("No players in room", { status: 400 });
        
        const players = room.players.map((p) => {
            // Remove the id from the player object
            const { id, ...rest } = allPlayersInRoom.find((ap) => ap.id === p)!;
            return rest;
        });

        return NextResponse.json({ grid: grid as Cell[], players: players as Player[], startWord: room.startWord });
    } else {
        return new Response("Invalid code", { status: 400 });
    }
}