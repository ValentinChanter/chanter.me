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
    client: ExtendedWebSocket,
    _request: IncomingMessage,
    server: WebSocketServer
) {
    client.isAlive = true;

    client.on("pong", () => {
        client.isAlive = true; // Reset the heartbeat on receiving a pong
    });

    client.on("message", (message) => {
        for (const otherClient of server.clients) {
            if (otherClient !== client && otherClient.readyState === otherClient.OPEN) {
                otherClient.send(message);
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