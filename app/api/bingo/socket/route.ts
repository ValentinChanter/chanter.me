import { WebSocket } from "ws";
import { Prisma, PrismaClient } from "@prisma/client";

import * as jwt from "jsonwebtoken";

import { Cell } from "../../../bingo/types";
import { isPlayerInRoom } from "../_shared/isPlayerInRoom";
import { checkForWin, findWinnersByMostCells } from "../_shared/gameLogic";

const prisma = new PrismaClient();

// Store active game timers
const gameTimers: Map<string, NodeJS.Timeout> = new Map();

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

        const { action, token, duration }: { action: string; token: string; duration?: number } = json;

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
                    client.send(JSON.stringify({ action: "pong" }));
                    break;

                case "join":
                    sendToAllInRoomExcept(roomCode, { action: "addPlayer", player: { publicID: player.publicID, username: player.username, color: player.color } }, client);
                    
                    // Send grid reveal status and timer to the joining player
                    client.send(JSON.stringify({ 
                        action: "gridStatus", 
                        gridRevealed: room.gridRevealed,
                        gameEndTime: room.gameEndTime
                    }));
                    break;

                case "setCell":
                    // Only allow cell marking if the grid has been revealed
                    if (!room.gridRevealed) {
                        console.error("Grid not revealed yet");
                        return;
                    }
                    
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

                    /*
                    // Add the player's color to the word, or remove it if it's already there
                    if (word.colors.includes(player.color)) {
                        word.colors = word.colors.filter((c) => c !== player.color);
                    } else {
                        word.colors.push(player.color);
                    }
                    */
                    word.colors.push(player.color);
                    
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
                    
                    // Check if this move resulted in a win
                    if (checkForWin(grid, player.color)) {
                        sendToAllInRoom(roomCode, { 
                            action: "playerWon", 
                            winner: {
                                username: player.username,
                                color: player.color,
                                publicID: player.publicID
                            }
                        });
                    }
                    break;

                case "setGridAndStartWord":
                    const newGrid = json.grid as Cell[];
                    const startWord = json.startWord as string;

                    // Check if the requestee is the owner
                    if (decoded.owner) {
                        // Clear any existing game timer for this room
                        if (gameTimers.has(roomCode)) {
                            clearTimeout(gameTimers.get(roomCode)!);
                            gameTimers.delete(roomCode);
                        }
                        
                        // Update the room with the new grid and reset gridRevealed and timer
                        await prisma.bingoRooms.update({
                            where: {
                                code: roomCode
                            },
                            data: {
                                grid: newGrid as unknown as Prisma.InputJsonValue[],
                                startWord: startWord,
                                gridRevealed: false,
                                gameEndTime: null
                            }
                        });
                        
                        sendToAllInRoom(roomCode, { 
                            action: "setGridAndStartWord", 
                            grid: newGrid, 
                            startWord 
                        });
                        
                        // Also inform all clients that the grid is hidden again and timer is reset
                        sendToAllInRoom(roomCode, { 
                            action: "gridStatus", 
                            gridRevealed: false,
                            gameEndTime: null
                        });
                    }
                    break;

                case "revealGrid":
                    // Only the room owner can reveal the grid
                    if (!decoded.owner) {
                        console.error("Only the owner can reveal the grid");
                        return;
                    }
                    
                    // Get game duration, default to 30 minutes if not specified
                    const gameDuration = duration || 30 * 60; // seconds
                    
                    // Calculate end time based on current time + duration
                    const gameEndTime = new Date();
                    gameEndTime.setSeconds(gameEndTime.getSeconds() + gameDuration);

                    // Update the room with revealed status and end time
                    await prisma.bingoRooms.update({
                        where: {
                            code: roomCode
                        },
                        data: {
                            gridRevealed: true,
                            gameEndTime: gameEndTime
                        }
                    });

                    // Inform all clients that the grid is now revealed with timer
                    sendToAllInRoom(roomCode, { 
                        action: "revealGrid",
                        gameEndTime: gameEndTime
                    });

                    // Set up server-side timer to determine winner when time expires
                    if (gameTimers.has(roomCode)) {
                        clearTimeout(gameTimers.get(roomCode)!);
                    }
                    
                    const timeoutId = setTimeout(async () => {
                        try {
                            // Get fresh room data
                            const currentRoom = await prisma.bingoRooms.findUnique({
                                where: {
                                    code: roomCode
                                }
                            });
                            
                            if (!currentRoom) return;
                            
                            // Get grid and players
                            const grid = JSON.parse(JSON.stringify(currentRoom.grid)) as Cell[];
                            const players = currentRoom.players;
                            
                            // Determine winner(s) based on most cells
                            const winners = await findWinnersByMostCells(grid, players);
                            
                            // No winners if no one has any cells
                            if (winners.length === 0) return;
                            
                            // Send game finished event with winner(s)
                            sendToAllInRoom(roomCode, {
                                action: "playerWon",
                                winner: winners.length === 1 ? winners[0] : winners
                            });
                            
                            gameTimers.delete(roomCode);
                            
                        } catch (error) {
                            console.error("Error determining winner at game end:", error);
                        }
                    }, gameDuration * 1000);
                    
                    gameTimers.set(roomCode, timeoutId);
                    break;

                default:
                    console.error("Invalid action");
                    return;
            }
        } catch (error) {
            console.error("Error processing message:", error);
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

        // Make sure to clear timer if no players left
        if (res) {
            const { roomCode } = res;
            // If no players left and there's an active timer, clear it
            if (gameTimers.has(roomCode) && !rooms.has(roomCode)) {
                clearTimeout(gameTimers.get(roomCode)!);
                gameTimers.delete(roomCode);
            }
        }
    });
}