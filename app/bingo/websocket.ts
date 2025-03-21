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

    useEffect(() => {
        if (!token) return;

        const socket = new WebSocket(target.current());
        ref.current = socket;

        const controller = new AbortController();

        socket.addEventListener('open', () => {
            // Tell the server I just joined for others
            if (ref.current && ref.current.readyState === ref.current.OPEN) {
                ref.current.send(JSON.stringify({ action: 'join', token }));
            }
        }, controller);

        socket.addEventListener('message', async (event) => {
            const payload = typeof event.data === 'string' ? event.data : await event.data.text();
            const res = JSON.parse(payload) as { action: string, grid?: Cell[], publicID?: string, player?: Player };

            switch (res.action) {
                case 'addPlayer':
                    setPlayers((prev) => [...prev, res.player!]);
                    break;

                case 'setGrid':
                    setCells(res.grid!);
                    break;

                case 'removePlayer':
                    setPlayers((prev) => prev.filter((p) => p.publicID !== res.publicID));
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
            if (event.wasClean) return;
            console.error('WebSocket closed and was not clean:', event);
        }, controller);

        return () => {
            // Before closing, tell the server who I am so it can remove me from the player list
            if (ref.current && ref.current.readyState === ref.current.OPEN) {
                ref.current.send(JSON.stringify({ action: 'leave', token }));
            }

            controller.abort();
            ref.current?.close();
        };
    }, [token]);

    const sendCell = useCallback((cell: Cell, token: string) => {
        if (true && cell.colors.length > 0 && jwtDecode<{ color: string }>(token).color !== cell.colors[0]) return; // TODO: Check that mode is lockout // If it's lockout, cell is already checked and not by the player

        if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;

        // Send the cell to the server
        ref.current.send(JSON.stringify({ action: 'setCell', cell, token }));

        // No local updates since jwt doesn't contain the player's color, and the server will send the updated grid to everyone
    }, []);

    const setGrid = useCallback((grid: Cell[]) => {
        setCells(grid);
    }, []);

    const updateToken = useCallback((newToken: string | null) => {
        setToken(newToken);
    }, []);

    const setPlayerList = useCallback((players: Player[]) => {
        setPlayers(players);
    }, []);

    return [cells, setGrid, sendCell, updateToken, players, setPlayerList] as const;
}