import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";

import { extractCodeAndDecodedTokenFromBody } from "../_shared/extractCodeAndDecodedTokenFromBody";
import { createUserAndAddToGrid } from '../_shared/createUserAndAddToGrid';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const res = await extractCodeAndDecodedTokenFromBody(req);
    if (res instanceof Response) return res;
    const { code, decoded } = res;

    const grid = await prisma.bingoGrids.findFirst({
        where: {
            code
        }
    });

    if (!grid) {
        return new Response("Room doesn't exist", { status: 400 });
    }

    const player = await prisma.bingoPlayers.findUnique({
        where: {
            publicID: decoded.id,
            roomCode: code
        }
    });

    if (!player) {
        // Provided public ID doesn't match any player in the history of players in this room
        const newToken = await createUserAndAddToGrid(code, decoded.username);
        return NextResponse.json({ token: newToken });
    }

    if (grid.players.includes(player.id)) {
        // Player is already in that game (very unlikely unless he has connection issues or copied his token)
        return NextResponse.json({ success: true }); // TODO: Kick old player via WebSocket and let this one in
    } else {
        // Player is not currently in the game but already joined before
        await prisma.bingoGrids.update({
            where: {
                code
            },
            data: {
                players: {
                    push: player.id
                }
            }
        });

        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const newToken = jwt.sign({ username: player.username, id: player.publicID, code, owner: grid.owner === player.id, color: player.color }, secret);
        return NextResponse.json({ token: newToken });
    }
}