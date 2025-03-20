"use client";

import { useEffect, useState } from "react";
import { useGetCookie, useHasCookie, useSetCookie } from 'cookies-next/client';
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import { useCells } from "../api/bingo/socket/websocket";

export default function BingoGame({ code }: { code: string }) {
    const hasCookie = useHasCookie();
    const getCookie = useGetCookie();
    const setCookie = useSetCookie();
    const router = useRouter();

    const [receivedNewToken, setReceivedNewToken] = useState(false);

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
    const [cells] = useCells(() => `ws${process.env.NODE_ENV === "production" ? "s" : ""}://${window.location.host}/api/bingo/socket`);

    useEffect(() => {
        // Now it's called twice after the token is received

        // useEffect is fired twice without token on a normal use-case, then once with a token
        if (hasCookie("jwt")) {
            console.log(getCookie("jwt"));
            fetch(`/api/bingo/checkToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getCookie("jwt")}`,
                },
                body: JSON.stringify({ code }),
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    router.push(`/bingo?code=${code}`);
                }
            }).then((data) => {
                if (data) {
                    if (data.token) setCookie("jwt", data.token);
                    if (!receivedNewToken) setReceivedNewToken(true); // Refresh useEffect to make the page render

                    // TODO: Récupérer la grille
                }
            });
        } else {
            // If a user is lost without a token, redirect him to the home page
            // We don't want to redirect during those two first useEffect calls
            // We use a trick with a timeout to avoid this
            const timeout = setTimeout(() => {
                if (!hasCookie("jwt")) {
                    router.push(`/bingo?code=${code}`);
                }
            }, 1);

            return () => clearTimeout(timeout); // Cleanup in case token appears
        }
    }, [hasCookie, getCookie, setCookie, receivedNewToken, setReceivedNewToken, router, code]);

    return (
        <div className='flex h-screen'>
            {!hasCookie("jwt") || jwtDecode<{ username: string, id: string, code: string, owner: boolean }>(getCookie("jwt") as string).code !== code ? (
                <h1 className='m-auto'>Please wait while we are verifying your token...</h1>
            ) : (
                <div className="flex flex-row m-auto justify-between w-full h-full px-20 py-8">
                    <div className="rounded-xl p-4 h-5/6 aspect-square my-auto dark-rectangle ">
                        <div className="grid grid-cols-5 grid-rows-5 gap-2">
                            {cells.length === 25 ? (
                                cells.map((cell, i) => (
                                    <div key={i} className="outline outline-white/15 rounded-lg p-1 text-white overflow-y-auto no-scrollbar aspect-square text-center cursor-pointer hover:bg-gray-600 active:bg-gray-700 text-sm flex">
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
                                <span>test</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl">Mot de départ :</span>
                                <span>Non défini</span>
                            </div>
                        </div>
                        <div>
                            {jwtDecode<{ username: string, id: string, code: string,owner: boolean }>(getCookie("jwt") as string).owner && (
                                <button className="dark-button py-4 w-full cursor-pointer" onClick={() => generateGrid()}>Générer une nouvelle grille</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}