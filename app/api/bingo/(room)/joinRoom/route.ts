import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";

import { createUserAndAddToGrid } from "../../_shared/createUserAndAddToGrid";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    let body;
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }

    let { username, code } = body as { username: string | null, code: string | null };

    if (!username || !code) {
        return new Response("Missing username or code", { status: 400 });
    }

    username = username.trim();
    code = code.toUpperCase();

    if (!/^[A-Z0-9]{4}$/.test(code)) {
        return new Response("Incorrect code", { status: 400 });
    }

    const room = await prisma.bingoRooms.findFirst({
        where: {
            code
        }
    });

    if (!room) {
        return new Response("Room doesn't exist", { status: 422 });
    }

    // If player has a jwt and it matches a player in the history of players in this room, update that player and give the new username
    // If player has a jwt with no match, or doesn't have one, create it
    let invalidToken = true;

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];

        try {
            const secret = <jwt.Secret>process.env.JWT_SECRET;
            const decoded = <jwt.JwtPayload>jwt.verify(token, secret);
    
            if (decoded.username && decoded.id && decoded.code && decoded.owner !== undefined && decoded.color && decoded.code === code) {
                const player = await prisma.bingoPlayers.findUnique({
                    where: {
                        publicID: decoded.id,
                        roomCode: code
                    }
                });

                if (player) {
                    if (room.players.includes(player.id)) {
                        // Player is already in that game (very unlikely unless he has connection issues or copied his token)
                        // TODO: Kick old player via WebSocket and let this one in
                    } else {
                        // Player is not currently in the game but already joined before
                        await prisma.bingoRooms.update({
                            where: {
                                code
                            },
                            data: {
                                players: {
                                    push: player.id
                                }
                            }
                        });

                        await prisma.bingoPlayers.update({
                            where: {
                                publicID: decoded.id,
                                roomCode: code
                            },
                            data: {
                                username
                            }
                        });

                        invalidToken = false;

                        const newToken = jwt.sign({ username, id: decoded.id, code, owner: room.owner === player.id, color: player.color }, secret);
                        return NextResponse.json({ token: newToken });
                    }
                }
            }
        } catch {
            console.log("A token with the wrong signature has been provided");
        }
    }

    if (invalidToken) {
        const newToken = await createUserAndAddToGrid(code, username);
        return NextResponse.json({ token: newToken });
    }
}