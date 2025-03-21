"use client";

import { FormEvent, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useSetCookie, useGetCookie, useHasCookie } from 'cookies-next/client';

function Bingo() {
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [token, setToken] = useState("");
    const [joinError, setJoinError] = useState("");
    const [createError, setCreateError] = useState("");
    const [joinLoading, setJoinLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const setCookie = useSetCookie();
    const getCookie = useGetCookie();
    const hasCookie = useHasCookie();

    function createRoom(e: FormEvent) {
        if (!username || !token) {
            setCreateError("Veuillez remplir tous les champs.");
            return;
        }

        setCreateLoading(true);
        fetch("/api/bingo/createRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, token }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                switch (res.status) {
                    case 400:
                        setCreateError("Paramètres manquants. Veuillez réessayer.");
                        break;

                    case 401:
                        setCreateError("Jeton invalide. Veuillez réessayer.");
                        break;

                    default:
                        setCreateError("Une erreur inconnue s'est produite. Veuillez réessayer.");
                        break;
                }

                setCreateLoading(false);
            }
        }).then((data) => {
            if (data) {
                const decoded = jwtDecode<{ username: string, id: string, code: string }>(data.token);
                setCookie('jwt', data.token);

                router.push(`/bingo/${decoded.code}`);
            }
        });

        e.preventDefault();
    }

    function joinRoom(e: FormEvent) {
        if (!code || !username) {
            setJoinError("Veuillez remplir tous les champs.");
            return;
        }

        if (code.length !== 4) {
            setJoinError("Le code du salon doit contenir exactement 4 caractères.");
            return;
        }

        setJoinLoading(true);
        const params: { method: string; headers: Record<string, string>; body: string } = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, code }),
        };

        if (hasCookie("jwt")) {
            params.headers["Authorization"] = `Bearer ${getCookie("jwt")}`;
        }

        fetch("/api/bingo/joinRoom", params)
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                switch (res.status) {
                    case 400:
                        setJoinError("Paramètres manquants ou erronés. Veuillez réessayer.");
                        break;

                    case 422:
                        setJoinError(`Le salon ${code} n'existe pas. Veuillez réessayer.`);
                        break;

                    default:
                        setJoinError("Une erreur inconnue s'est produite. Veuillez réessayer.");
                        break;
                }

                setJoinLoading(false);
            }
        }).then((data) => {
            if (data) {
                const decoded = jwtDecode<{ username: string, id: string, code: string }>(data.token);
                setCookie('jwt', data.token);

                router.push(`/bingo/${decoded.code}`);
            }
        });

        e.preventDefault();
    }

    useEffect(() => {
        if (searchParams.has("code")) {
            setCode(searchParams.get("code") as string);
        }
    }, [searchParams]);

    return (
        <div className='flex h-screen'>
            <form className="flex flex-col justify-between m-auto rounded-xl px-12 py-8 w-1/3 h-[480px] dark-rectangle" onSubmit={(e) => joinRoom(e)}>
                <div>
                    <div className="h-[50px]">
                        <span className="text-3xl">Rejoindre un salon</span>
                    </div>
                    <div className="flex flex-col space-y-2 my-8">
                        <label htmlFor="joinUsername">Nom d&apos;utilisateur</label>
                        <input disabled={joinLoading} required id="joinUsername" type="text" value={username} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10 disabled:cursor-not-allowed" onChange={(e) => setUsername(e.target.value)}></input>
                    </div>
                    <div className="flex flex-col space-y-2 mb-4">
                        <label htmlFor="code">Code du salon</label>
                        <input disabled={joinLoading} required id="code" type="text" pattern="[A-Z0-9]{4}" title="Veuillez entrer exactement 4 caractères alphanumériques." value={code} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10 disabled:cursor-not-allowed" onChange={(e) => setCode(e.target.value.toUpperCase())}></input>
                    </div>
                    {joinError && (
                        <span className="text-red-500">{joinError}</span>
                    )}
                </div>
                <button disabled={joinLoading} className="py-4 mt-8 w-full cursor-pointer dark-button disabled:cursor-not-allowed">{joinLoading ? "Connexion en cours... Veuillez patienter." : "Rejoindre le salon"}</button>
            </form>

            <form className="flex flex-col justify-between m-auto rounded-xl px-12 py-8 w-1/3 h-[480px] dark-rectangle" onSubmit={(e) => createRoom(e)}>
                <div>
                    <div className="h-[50px]">
                        <span className="text-3xl">Créer un salon</span>
                        <span className=" ml-4 text-xs">Par souci de bande passante, cette fonctionnalité est restreinte.</span>
                    </div>
                    <div className="flex flex-col space-y-2 my-8">
                        <label htmlFor="createUsername">Nom d&apos;utilisateur</label>
                        <input disabled={createLoading} required id="createUsername" type="text" value={username} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10 disabled:cursor-not-allowed" onChange={(e) => setUsername(e.target.value)}></input>
                    </div>
                    <div className="flex flex-col space-y-2 mb-4">
                        <label htmlFor="token">Jeton d&apos;authentification</label>
                        <input disabled={createLoading} required id="token" type="password" value={token} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10 disabled:cursor-not-allowed" onChange={(e) => setToken(e.target.value)}></input>
                    </div>
                    {createError && (
                        <span className="text-red-500">{createError}</span>
                    )}
                </div>
                <button disabled={createLoading} className="py-4 mt-8 w-full cursor-pointer dark-button disabled:cursor-not-allowed">{createLoading ? "Création en cours... Veuillez patienter." : "Créer un salon"}</button>
            </form>
        </div>
    )
}

export default function BingoHome() {
    return (
        <Suspense>
            <Bingo />
        </Suspense>
    )
}