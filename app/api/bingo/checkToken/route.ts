import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";
import { createUserAndAddToGrid } from '../_shared/createUserAndAddToGrid';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { code } = body;

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Authorization header missing or malformed", { status: 400 });
    }
    const token = authHeader.split(" ")[1];

    try {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload> jwt.verify(token, secret);

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
            return NextResponse.json({ success: true });
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