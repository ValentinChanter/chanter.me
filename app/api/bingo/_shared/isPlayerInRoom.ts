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

    const room = await prisma.bingoRooms.findFirst({
        where: {
            code
        }
    });

    if (!room) return false;

    if (room.players.includes(player.id)) {
        return { player, room };
    } else {
        return false;
    };
}