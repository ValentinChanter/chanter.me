import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import * as jwt from "jsonwebtoken";
import { Cell } from "../socket/bingo";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { token } = body;

    try {
        const secret = <jwt.Secret> process.env.JWT_SECRET;
        const decoded = <jwt.JwtPayload> jwt.verify(token, secret);

        if (decoded.username && decoded.code) {
            const user = await prisma.users.findFirst({
                where: {
                    username: decoded.username,
                    currentUUID: decoded.uuid
                }
            });

            if (!user) {
                return new Response("Invalid user", { status: 400 });
            }

            const grid = await prisma.bingoGrids.findFirst({
                where: {
                    code: decoded.code
                }
            });

            if (grid && grid.players.includes(user.id)) {
                const players = await prisma.users.findMany({
                    where: {
                        id: {
                            in: grid.players
                        }
                    }
                });

                const gridGrid = grid.grid as {"word": string, "checkedBy": string[]}[];

                const updatedGrid = gridGrid.map((cell) => ({
                    word: cell.word,
                    colors: cell.checkedBy.map((playerId) => {
                        const player = players.find((p) => p.id === playerId);
                        return player ? player.color : "";
                    })
                })) as Cell[];

                return NextResponse.json({ grid: updatedGrid, players });
            } else {
                return new Response("Invalid grid", { status: 400 });
            }
        } else {
            return new Response("Invalid token", { status: 400 });
        }
    } catch {
        return new Response("Invalid token", { status: 400 });
    }
}