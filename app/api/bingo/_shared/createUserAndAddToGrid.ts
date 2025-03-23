import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { CONFIG } from "@/config/bingo";

const prisma = new PrismaClient();

export async function createUserAndAddToGrid(code: string, username: string) {
    const newID = uuidv4();

    const takenColors = await prisma.bingoPlayers.findMany({
        where: {
            roomCode: code
        },
        select: {
            color: true
        }
    });
    const nextColor = CONFIG.colors.find((c) => !takenColors.some((tc) => tc.color === c.hex))?.hex as string;

    const user = await prisma.bingoPlayers.create({
        data: {
            publicID: newID,
            username,
            roomCode: code,
            color: nextColor
        }
    });

    await prisma.bingoRooms.update({
        where: {
            code
        },
        data: {
            players: {
                push: user.id
            }
        }
    });

    const secret = <jwt.Secret> process.env.JWT_SECRET;
    const newToken = jwt.sign({ username, id: newID, code, owner: false, color: nextColor }, secret);

    return newToken;
}