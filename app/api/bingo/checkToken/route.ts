import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function createUserAndAddToGrid(code: string, decoded: jwt.JwtPayload) {
    console.log("creating user and adding to grid");

    const newID = uuidv4();

    const user = await prisma.bingoPlayers.create({
        data: {
            publicID: newID,
            username: decoded.username,
            roomCode: code,
            color: "#ba2f2f" // TODO: récupérer la prochaine couleur disponible
        }
    });

    console.log("added user to grid");

    await prisma.bingoGrids.update({
        where: {
            code
        },
        data: {
            players: {
                push: user.id
            }
        }
    });

    console.log("updated grid");

    const secret = <jwt.Secret> process.env.JWT_SECRET;
    const newToken = jwt.sign({ username: decoded.username, id: newID, code, owner: false }, secret);

    console.log("new token", newToken);

    return newToken;
}

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
            const newToken = await createUserAndAddToGrid(code, decoded);
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

            const newToken = jwt.sign({ username: player.username, id: player.publicID, code, owner: grid.owner === player.id }, secret);
            return NextResponse.json({ token: newToken });
        }
    } catch {
        return new Response("Invalid token", { status: 400 });
    }
}