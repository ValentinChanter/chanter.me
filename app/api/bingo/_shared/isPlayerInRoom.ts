import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Check if a player is in a room
 * @param uuid The player's public ID
 * @param code The room's code
 * @returns False if the player is not in the room, otherwise the player and the grid
 */
export async function isPlayerInRoom(uuid: string, code: string) {
    const player = await prisma.bingoPlayers.findFirst({
        where: {
            publicID: uuid
        }
    });

    if (!player) return false;

    const grid = await prisma.bingoGrids.findFirst({
        where: {
            code
        }
    });

    if (!grid) return false;

    if (grid.players.includes(player.id)) {
        return { player, grid };
    } else {
        return false;
    };
}