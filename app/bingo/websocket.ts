'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Cell, Player } from './types';
import { jwtDecode } from "jwt-decode";

export function useCells(url: () => string) {
    const ref = useRef<WebSocket>(null);
    const target = useRef(url);

    const [cells, setCells] = useState<Cell[]>([]);
    const [token, setToken] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [startWord, setStartWord] = useState("");

    useEffect(() => {
        if (!token) return;

        const socket = new WebSocket(target.current());
        ref.current = socket;

        const controller = new AbortController();
        let heartbeatInterval: NodeJS.Timeout;

        const sendHeartbeat = () => {
            if (ref.current && ref.current.readyState === WebSocket.OPEN) {
                ref.current.send(JSON.stringify({ action: 'ping', token }));
            }
        };

        socket.addEventListener('open', () => {
            // Start heartbeat
            heartbeatInterval = setInterval(sendHeartbeat, 30000); // Send heartbeat every 30 seconds

            // Tell the server I just joined for others
            if (ref.current && ref.current.readyState === ref.current.OPEN) {
                ref.current.send(JSON.stringify({ action: 'join', token }));
            }
        }, controller);

        socket.addEventListener('message', async (event) => {
            const payload = typeof event.data === 'string' ? event.data : await event.data.text();
            const res = JSON.parse(payload) as { action: string, grid?: Cell[], publicID?: string, player?: Player, startWord?: string };

            switch (res.action) {
                case 'addPlayer':
                    // Check if the player is already in the list
                    setPlayers((prev) => {
                        if (prev.some((p) => p.publicID === res.player!.publicID)) {
                            return prev;
                        }
                        return [...prev, res.player!];
                    });
                    break;

                case 'setGrid':
                    setCells(res.grid!);
                    break;

                case 'setGridAndStartWord':
                    setCells(res.grid!);
                    setStartWord(res.startWord!);
                    break;

                case 'removePlayer':
                    setPlayers((prev) => prev.filter((p) => p.publicID !== res.publicID));
                    break;

                case 'pong':
                    break;

                default:
                    console.error('Invalid action:', res.action);
                    break;
            }
        }, controller);

        socket.addEventListener('error', (err) => {
            console.error('WebSocket error:', err);
        }, controller);

        socket.addEventListener('close', (event) => {
            clearInterval(heartbeatInterval);
            if (event.wasClean) return;
            console.error('WebSocket closed and was not clean:', event);
        }, controller);

        return () => {
            clearInterval(heartbeatInterval);
            controller.abort();
            ref.current?.close();
        };
    }, [token]);

    const sendCell = useCallback((cell: Cell, token: string) => {
        if (true && cell.colors.length > 0 && jwtDecode<{ color: string }>(token).color !== cell.colors[0]) return; // TODO: Check that mode is lockout // If it's lockout, cell is already checked and not by the player

        if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;

        // Send the cell to the server
        ref.current.send(JSON.stringify({ action: 'setCell', cell, token }));

        // No local updates since the server will send the updated grid to everyone so we can set the updated grid only after checking if the user is actually allowed to check the cell
    }, []);

    const setGrid = useCallback((grid: Cell[]) => {
        setCells(grid);
    }, []);

    const setPlayerList = useCallback((players: Player[]) => {
        setPlayers(players);
    }, []);

    const sendGrid = useCallback((grid: Cell[], startWord: string, token: string) => {
        if (!jwtDecode<{ owner: boolean }>(token).owner) return;

        if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;

        ref.current.send(JSON.stringify({ action: 'setGridAndStartWord', grid, startWord, token }));

        // Send to others and set it locally (the owner will see the changes a few ms earlier but we save some bandwidth)
        setGrid(grid);
        setStartWord(startWord);
    }, [setGrid, setStartWord]);

    return [cells, setGrid, sendCell, setToken, players, setPlayerList, sendGrid, startWord, setStartWord, token] as const;
}