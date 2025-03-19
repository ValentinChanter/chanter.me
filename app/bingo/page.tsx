"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSetCookie, useHasCookie, useDeleteCookie, useGetCookie } from 'cookies-next/client';
import { useRouter } from 'next/navigation'
import { jwtDecode } from "jwt-decode";
import { useCells } from "../api/bingo/socket/websocket";
import { Cell } from "../api/bingo/socket/bingo";

export default function Bingo() {
    const router = useRouter()

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loggedAs, setLoggedAs] = useState("");

    const setCookie = useSetCookie();
    const getCookie = useGetCookie();
    const hasCookie = useHasCookie();
    const deleteCookie = useDeleteCookie();

    function login(e: FormEvent) {
        fetch("/api/bingo/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                setCookie('jwt', data.token);
                const decodedToken = jwtDecode<{ username: string }>(data.token);
                setLoggedAs(decodedToken.username);
            }
        });

        e.preventDefault();
    }

    function generateGrid() {
        fetch("/api/bingo/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: getCookie("jwt") }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                console.log(data);

                // Set new JWT
                setCookie('jwt', data.token);

                // Set grid using method defined in WebSocket
                const grid = data.words.map((word: string) => ({ word, colors: [] })) as Cell[];
                sendGrid(grid);
            }
        });
    }

    // WebSocket setup
    const [cells, sendGrid, setGrid] = useCells(() => `ws${process.env.NODE_ENV === "production" ? "s" : ""}://${window.location.host}/api/bingo/socket`);

    useEffect(() => {
        if (hasCookie("jwt")) {
            const token = getCookie("jwt") as string;
            try {
                const decodedToken = jwtDecode<{ username: string }>(token);
                setLoggedAs(decodedToken.username);

                // Fetch grid
                fetch("/api/bingo/getGrid", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                }).then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                }
                ).then((data) => {
                    if (data) {
                        // Send grid to WebSocket
                        const grid = data.grid as Cell[];
                        setGrid(grid);
                    }
                });
            } catch {
                deleteCookie("jwt");
                setLoggedAs("");
                router.refresh();
            }
        }
    }, [hasCookie, getCookie, setLoggedAs, deleteCookie, router, setGrid]);

    return (
        <div className='flex h-screen'>
            {!hasCookie("jwt") && !loggedAs ? (
                <form className="flex flex-col justify-between m-auto rounded-xl px-12 py-8 w-1/3 h-[350px] dark-rectangle" onSubmit={(e) => login(e)}>
                    <div>
                        <div className="flex flex-col space-y-2 mb-8">
                            <label htmlFor="username">Nom d&apos;utilisateur</label>
                            <input id="username" type="text" value={username} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10" onChange={(e) => setUsername(e.target.value)}></input>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="password">Mot de passe</label>
                            <input id="password" type="password" value={password} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10" onChange={(e) => setPassword(e.target.value)}></input>
                        </div>
                    </div>
                    <button className="py-4 mt-8 w-full cursor-pointer dark-button">Se connecter</button>
                </form>
            ) : (
                <div className="flex flex-row m-auto justify-between w-full h-full px-20 py-8">
                    <div className="rounded-xl p-4 h-5/6 aspect-square my-auto dark-rectangle ">
                        <div className="grid grid-cols-5 grid-rows-5 gap-2">
                            {cells.length === 25 ? (
                                cells.map((cell, i) => (
                                    <div key={i} className="outline outline-white/15 rounded-lg break-words p-2 text-white aspect-square text-center flex flex-col justify-center cursor-pointer hover:bg-gray-600 active:bg-gray-700 text-sm">
                                        {cell.word.replace(/_/g, " ") || i + 1}
                                    </div>
                                )
                            )) : (
                                Array.from({ length: 25 }, (_, i) => (
                                    <div key={i} className="outline outline-white/15 rounded-lg p-4 text-white aspect-square text-center flex flex-col justify-center cursor-pointer hover:bg-gray-600 active:bg-gray-700"></div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl p-6 flex flex-col justify-between w-1/5 h-5/6 my-auto dark-rectangle">
                        <div>
                            <div className="flex flex-col mb-8">
                                <span className="text-xl">Joueurs en ligne :</span>
                                <span>test</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl">Mot de départ :</span>
                                <span>Non défini</span>
                            </div>
                        </div>
                        <div>
                            <button disabled={loggedAs !== "Admin"} className="dark-button py-4 w-full cursor-pointer disabled:cursor-not-allowed" onClick={() => generateGrid()}>Générer une nouvelle grille</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}