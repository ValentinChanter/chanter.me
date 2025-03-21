"use client";

import { useEffect, useState } from "react";
import { useGetCookie, useHasCookie, useSetCookie } from 'cookies-next/client';
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import { useCells } from "./websocket";

export default function BingoGame({ code }: { code: string }) {
    const hasCookie = useHasCookie();
    const getCookie = useGetCookie();
    const setCookie = useSetCookie();
    const router = useRouter();

    const [token, setToken] = useState<string | null>(null);
    const [isTokenValidating, setIsTokenValidating] = useState(true);

    function generateGrid() {
        fetch("/api/bingo/generateGrid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getCookie("jwt")}`,
            },
            body: JSON.stringify({ code }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }
        ).then((data) => {
            if (data) {
                console.log(data);
                // TODO: L'envoyer sur WebSocket
            }
        });
    }

    // WebSocket setup
    const [cells, setGrid, sendCell, updateToken, players, setPlayerList] = useCells(() => `ws${process.env.NODE_ENV === "production" ? "s" : ""}://${window.location.host}/api/bingo/socket`);

    useEffect(() => {
        // The token will stay undefined until loaded (then it will be true/false)
        // After the page is loaded (i.e. the token is loaded), we can start verifying it
        if (hasCookie("jwt") === undefined) {
            setIsTokenValidating(false);
            return;
        }
    
        const validateToken = async () => {
            try {
                const response = await fetch(`/api/bingo/checkToken`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getCookie("jwt")}`,
                    },
                    body: JSON.stringify({ code }),
                });
    
                if (!response.ok) {
                    router.push(`/bingo?code=${code}`);
                    return;
                }
    
                const data = await response.json();
                if (data.token) {
                    setCookie("jwt", data.token);
                }
                setToken(getCookie("jwt") as string);
                setIsTokenValidating(false);
            } catch (error) {
                console.error("Token validation failed:", error);
                setIsTokenValidating(false);
            }
        };
    
        validateToken();
    }, [hasCookie, getCookie, setCookie, router, code]);
    
    useEffect(() => {
        // The token will be undefined, then it will be in the process of being validated, and only after we can start fetching the grid
        if (!token || isTokenValidating) return;
    
        const fetchGrid = async () => {
            try {
                const response = await fetch(`/api/bingo/getGridAndPlayers`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ code }),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setGrid(data.grid);
                    setPlayerList(data.players);
                }
            } catch (error) {
                console.error("Grid or players fetch failed:", error);
            }
        };
    
        fetchGrid();
    }, [token, isTokenValidating, code, setGrid, setPlayerList]);

    // Refresh token on mount
    useEffect(() => {
        if (hasCookie("jwt")) {
            updateToken(getCookie("jwt") as string);
        } else {
            updateToken(null);
        }
    }, [hasCookie, getCookie, updateToken]);

    return (
        <div className='flex h-screen'>
            {!hasCookie("jwt") || jwtDecode<{ code: string }>(getCookie("jwt") as string).code !== code ? (
                <h1 className='m-auto'>Veuillez patienter. Nous vérifions votre jeton...</h1>
            ) : (
                <div className="flex flex-row m-auto justify-between w-full h-full px-20 py-8">
                    <div className="rounded-xl p-4 h-5/6 aspect-square my-auto dark-rectangle ">
                        <div className="grid grid-cols-5 grid-rows-5 gap-2">
                            {cells.length === 25 ? (
                                cells.map((cell, i) => (
                                    <div
                                        key={i}
                                        className="outline outline-white/15 rounded-lg p-1 text-white overflow-y-auto no-scrollbar aspect-square text-center cursor-pointer hover:bg-gray-600 active:bg-gray-700 text-sm flex"
                                        style={{
                                            backgroundColor: cell.colors.length > 0  ? cell.colors[0] : "transparent"
                                        }}
                                        onClick={() => sendCell(cell, getCookie("jwt") as string)}
                                    >
                                        <div className="overflow-x-auto m-auto">
                                            <span className="break-words">{cell.word.replace(/_/g, " ") || i + 1}</span>
                                        </div>
                                    </div>
                                )
                            )) : (
                                Array.from({ length: 25 }, (_, i) => (
                                    <div key={i} className="outline outline-white/15 rounded-lg p-1 text-white overflow-y-auto no-scrollbar aspect-square text-center cursor-pointer hover:bg-gray-600 active:bg-gray-700 text-sm flex">
                                        <div className="overflow-x-auto m-auto">
                                            <span className="break-words">{i + 1}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl p-6 flex flex-col justify-between w-1/5 h-5/6 my-auto dark-rectangle">
                        <div>
                            <div className="flex flex-col mb-8">
                                <span className="text-xl">Joueurs en ligne :</span>
                                <div>
                                    <div className="flex flex-col mb-8">
                                        <span className="text-xl mb-1">{players.length} joueur{players.length === 1 ? "" : "s"} en ligne</span>
                                        <div className="flex flex-row flex-wrap gap-2 justify-center">
                                            {players.map((player, i) => (
                                                <div
                                                    key={i}
                                                    className="rounded-full px-3 py-1 w-fit text-center"
                                                    style={{
                                                        backgroundColor: player.color
                                                    }}
                                                >
                                                    <span>{player.username}</span>
                                                </div>
                    </div>
                </div>
            )}
        </div>
    );
}