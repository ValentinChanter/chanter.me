import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";

import { Cell } from "../../../bingo/types";
import { isPlayerInRoom } from "../_shared/isPlayerInRoom";

const prisma = new PrismaClient();

const rooms: Map<string, Set<WebSocket>> = new Map();

function addToRoom(roomCode: string, client: WebSocket) {
    if (!rooms.has(roomCode)) {
        rooms.set(roomCode, new Set());
    }
    rooms.get(roomCode)?.add(client);
}

function removeFromRoom(roomCode: string, client: WebSocket) {
    rooms.get(roomCode)?.delete(client);
    if (rooms.get(roomCode)?.size === 0) {
        rooms.delete(roomCode);
    }
}

function sendToAllInRoom(roomCode: string, message: object) {
    const clientsInRoom = rooms.get(roomCode);
    if (!clientsInRoom) return;

    const rawData: WebSocket.RawData = Buffer.from(JSON.stringify(message));
    for (const client of clientsInRoom) {
        if (client.readyState === client.OPEN) {
            client.send(rawData);
        }
    }
}

function sendToAllInRoomExcept(roomCode: string, message: object, except: WebSocket) {
    const clientsInRoom = rooms.get(roomCode);
    if (!clientsInRoom) return;

    const rawData: WebSocket.RawData = Buffer.from(JSON.stringify(message));
    for (const client of clientsInRoom) {
        if (client !== except && client.readyState === client.OPEN) {
            client.send(rawData);
        }
    }
}

export function GET() {
    const headers = new Headers();
    headers.set('Connection', 'Upgrade');
    headers.set('Upgrade', 'websocket');
    return new Response('Upgrade Required', { status: 426, headers });
}

export function SOCKET(
    client: WebSocket
) {
    client.on("message", async (message) => {
        let json;
        try {
            json = JSON.parse(message.toString());
        } catch {
            console.error("Invalid JSON received");
            return;
        }

        const { action, token }: { action: string; token: string } = json;

        if (!action || !token) {
            console.error("Invalid JSON received");
            return;
        }

        try {
            const secret = <jwt.Secret>process.env.JWT_SECRET;
            const decoded = <jwt.JwtPayload>jwt.verify(json.token, secret);
    
            if (!decoded.username || !decoded.id || !decoded.code || decoded.owner === undefined || !decoded.color) {
                console.error("Invalid token");
            }

            // Check if player is in room
            const res = await isPlayerInRoom(decoded.id, decoded.code);
            if (!res) {
                console.error("Player not in room");
                return;
            }

            const roomCode = decoded.code as string;
            addToRoom(roomCode, client);
            
            const { player, grid } = res;

            switch (action) {
                case "join":
                    sendToAllInRoomExcept(roomCode, { action: "addPlayer", player: { publicID: player.publicID, username: player.username, color: player.color } }, client);
                    break;

                case "setCell":
                    const gridGrid = grid.grid as { word: string, colors: string[] }[];
                    const cell = json.cell as Cell;

                    // Check if the word is in the grid
                    if (!gridGrid.some((c) => c.word === cell.word)) {
                        console.error("Word not in grid");
                        return;
                    }

                    const word = gridGrid.find((c) => c.word === cell.word) as Cell;

                    if (true && word.colors.length > 0 && decoded.color !== word.colors[0]) { // TODO: Check that mode is lockout // If it's lockout, cell is already checked and not by the player
                        console.error("Word already checked");
                        return;
                    }

                    // Add the player's color to the word, or remove it if it's already there
                    if (word.colors.includes(player.color)) {
                        word.colors = word.colors.filter((c) => c !== player.color);
                    } else {
                        word.colors.push(player.color);
                    }
                    
                    await prisma.bingoGrids.update({
                        where: {
                            code: roomCode
                        },
                        data: {
                            grid: gridGrid
                        }
                    });

                    // Send the updated grid to all clients
                    sendToAllInRoom(roomCode, { action: "setGrid", grid: gridGrid });
                    break;

                case "setGrid":
                    const newGrid = json.grid as Cell[];

                    // Check if the requestee is the owner
                    if (decoded.owner) {
                        sendToAllInRoomExcept(roomCode, { action: "setGrid", grid: newGrid }, client);
                    }
                    break;

                case "leave":
                    const gridAfterLeave = await prisma.bingoGrids.update({
                        where: {
                            code: roomCode
                        },
                        data: {
                            players: {
                                set: grid.players.filter((p) => p !== player.id)
                            }
                        }
                    });

                    // If nobody is left in the room, delete it and all users associated with it
                    if (gridAfterLeave.players.length === 0) {
                        await prisma.bingoGrids.delete({
                            where: {
                                code: roomCode
                            }
                        });

                        await prisma.bingoPlayers.deleteMany({
                            where: {
                                roomCode
                            }
                        });
                    }

                    // Send the updated player list to all clients
                    sendToAllInRoomExcept(roomCode, { action: "removePlayer", publicID: player.publicID }, client);
                    removeFromRoom(roomCode, client);
                    break;

                default:
                    console.error("Invalid action");
                    return;
            }
        } catch {
            console.error("Invalid token");
            return;
        }
    });
  
    client.on("close", () => {
        console.log("A client disconnected");
    });
}