import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "node:http";

export function GET() {
    const headers = new Headers();
    headers.set('Connection', 'Upgrade');
    headers.set('Upgrade', 'websocket');
    return new Response('Upgrade Required', { status: 426, headers });
}

export function SOCKET(
    client: WebSocket,
    _request: IncomingMessage,
    server: WebSocketServer
) {
    client.on("message", (message) => {
        for (const otherClient of server.clients) {
            if (otherClient !== client && otherClient.readyState === otherClient.OPEN) {
                otherClient.send(message);
            }
        }
    });
  
    client.on("close", () => {
        console.log("A client disconnected");
    });
}