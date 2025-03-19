'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Cell } from './bingo';

export function useCells(url: () => string) {
    const ref = useRef<WebSocket>(null);
    const target = useRef(url);

    const [cells, setCells] = useState<Cell[]>([]);

    useEffect(() => {
        if (ref.current) return;
        const socket = new WebSocket(target.current());
        ref.current = socket;

        const controller = new AbortController();

        console.log('WebSocket created');

        socket.addEventListener('open', () => {
            console.log('WebSocket opened');
        }, controller);

        socket.addEventListener('message', async (event) => {
            console.log('Incoming event:', event);
            const payload = typeof event.data === 'string' ? event.data : await event.data.text();
            const res = JSON.parse(payload) as { action: string, cell?: Cell, grid?: Cell[] };

            if (res.action === 'setGrid' && res.grid) {
                setCells(res.grid);
            }
        }, controller);

        socket.addEventListener('error', (err) => {
            console.error('WebSocket error:', err);
        }, controller);

        socket.addEventListener('close', (event) => {
            if (event.wasClean) return;
            console.error('WebSocket closed and was not clean:', event);
        }, controller);

        return () => controller.abort();
    }, []);

    const sendCell = useCallback((cell: Cell) => {
        if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;
        // console.log('Outgoing cell:', cell);
        ref.current.send(JSON.stringify(cell));

        setCells((prev) => [...prev, cell]); // TODO: This is temporary
    }, []);

    const sendGrid = useCallback((grid: Cell[]) => {
        if (!ref.current || ref.current.readyState !== ref.current.OPEN) return;
        console.log('Outgoing grid:', grid);
        ref.current.send(JSON.stringify({ action: 'setGrid', grid }));

        setCells(grid);
    }, []);

    const setGrid = useCallback((grid: Cell[]) => {
        setCells(grid);
    }, []);

    return [cells, sendGrid, setGrid, sendCell] as const;
}