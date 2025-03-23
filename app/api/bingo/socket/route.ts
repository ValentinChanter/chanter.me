import { WebSocket } from "ws";
import { PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";

import { Cell } from "../../../bingo/types";
import { isPlayerInRoom } from "../_shared/isPlayerInRoom";

const prisma = new PrismaClient();

const rooms: Map<string, Set<{client: WebSocket, publicID: string}>> = new Map();

function addToRoom(roomCode: string, client: WebSocket, publicID: string) {
    if (!rooms.has(roomCode)) {
        rooms.set(roomCode, new Set());
    }
    rooms.get(roomCode)?.add({ client, publicID });
}

function removeFromRoom(roomCode: string, uniqueIdentifier: WebSocket | string) {
    if (typeof uniqueIdentifier === "string") {
        const publicID = uniqueIdentifier;
        const client = Array.from(rooms.get(roomCode) || []).find((c) => c.publicID === publicID)?.client as WebSocket;
        rooms.get(roomCode)?.delete({ client, publicID });
    } else {
        const client = uniqueIdentifier;
        const publicID = Array.from(rooms.get(roomCode) || []).find((c) => c.client === client)?.publicID as string;
        rooms.get(roomCode)?.delete({ client, publicID });
    }

    if (rooms.get(roomCode)?.size === 0) {
        rooms.delete(roomCode);
    }
}

function sendToAllInRoom(roomCode: string, message: object) {
    const setsInRoom = rooms.get(roomCode);
    if (!setsInRoom) return;

    const rawData: WebSocket.RawData = Buffer.from(JSON.stringify(message));
    for (const set of setsInRoom) {
        if (set.client.readyState === set.client.OPEN) {
            set.client.send(rawData);
        }
    }
}

function sendToAllInRoomExcept(roomCode: string, message: object, except: WebSocket) {
    const setsInRoom = rooms.get(roomCode);
    if (!setsInRoom) return;

    const rawData: WebSocket.RawData = Buffer.from(JSON.stringify(message));
    for (const set of setsInRoom) {
        if (set.client !== except && set.client.readyState === set.client.OPEN) {
            set.client.send(rawData);
        }
    }
}

function getInfoFromClient(client: WebSocket) {
    for (const [roomCode, set] of rooms) {
        for (const entry of set) {
            if (entry.client === client) {
                return { publicID: entry.publicID, roomCode };
            }
        }
    }

    return null;
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
            const { player, room } = res;
            addToRoom(roomCode, client, player.publicID);

            switch (action) {
                case "ping":
                    console.log("server sending")
                    client.send(JSON.stringify({ action: "pong" }));
                    break;

                case "join":
                    sendToAllInRoomExcept(roomCode, { action: "addPlayer", player: { publicID: player.publicID, username: player.username, color: player.color } }, client);
                    break;

                case "setCell":
                    const grid = room.grid as { word: string, colors: string[], description: string }[];
                    const cell = json.cell as Cell;

                    // Check if the word is in the grid
                    if (!grid.some((c) => c.word === cell.word)) {
                        console.error("Word not in grid");
                        return;
                    }

                    const word = grid.find((c) => c.word === cell.word) as Cell;

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
                    
                    await prisma.bingoRooms.update({
                        where: {
                            code: roomCode
                        },
                        data: {
                            grid
                        }
                    });

                    // Send the updated grid to all clients
                    sendToAllInRoom(roomCode, { action: "setGrid", grid });
                    break;

                case "setGridAndStartWord":
                    const newGrid = json.grid as Cell[];
                    const startWord = json.startWord as string;

                    // Check if the requestee is the owner
                    if (decoded.owner) {
                        sendToAllInRoomExcept(roomCode, { action: "setGridAndStartWord", grid: newGrid, startWord }, client);
                    }
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
  
    client.on("close", async () => {
        const res = getInfoFromClient(client);
        if (!res) return console.error("Client not in room");
        const { publicID, roomCode } = res;

        const room = await prisma.bingoRooms.findUnique({
            where: {
                code: roomCode
            }
        });

        if (!room) return console.error("Room not found");

        const playerToRemove = await prisma.bingoPlayers.findUnique({
            where: {
                roomCode,
                publicID
            }
        });

        if (!playerToRemove) return console.error("Player to remove not found");

        const gridAfterLeave = await prisma.bingoRooms.update({
            where: {
                code: roomCode
            },
            data: {
                players: {
                    set: room.players.filter((p) => p !== playerToRemove.id)
                }
            }
        });

        // If nobody is left in the room, delete it and all users associated with it
        if (gridAfterLeave.players.length === 0) {
            await prisma.bingoRooms.delete({
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

        sendToAllInRoom(roomCode, { action: "removePlayer", publicID: publicID });
        removeFromRoom(roomCode, client);
    });
}