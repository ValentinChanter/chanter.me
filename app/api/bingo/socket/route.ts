import { WebSocket, WebSocketServer } from "ws";

// Extend the WebSocket type to include the isAlive property
interface ExtendedWebSocket extends WebSocket {
    isAlive: boolean;
}
import { IncomingMessage } from "node:http";

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

                    const word = gridGrid.find((c) => c.word === cell.word) as { word: string, colors: string[] };

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
            }
        }
    });

    // Periodically check for inactive connections
    const interval = setInterval(() => {
        for (const otherClient of server.clients as Set<ExtendedWebSocket>) {
            if (!otherClient.isAlive) {
                console.log("Closing inactive connection");
                otherClient.terminate();
            } else {
                otherClient.isAlive = false;
                otherClient.ping();
            }
        }
    }, 30000); // Check every 30 seconds
  
    client.on("close", () => {
        clearInterval(interval);
        console.log("A client disconnected");
    });
}