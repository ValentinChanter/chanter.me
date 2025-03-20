"use client";

import { FormEvent, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useRouter, useSearchParams } from "next/navigation";
import { useSetCookie } from 'cookies-next/client';

export default function BingoHome() {
    const [username, setUsername] = useState("");
    const [code, setCode] = useState("");
    const [token, setToken] = useState("");
    const [createError, setCreateError] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const setCookie = useSetCookie();

    function createRoom(e: FormEvent) {
        setLoading(true);
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
        e.preventDefault();
    }

    useEffect(() => {
        if (searchParams.has("code")) {
            setCode(searchParams.get("code") as string);
        }
    }, [searchParams]);

    return (
        <div className='flex h-screen'>
            <form className="flex flex-col justify-between m-auto rounded-xl px-12 py-8 w-1/3 h-[450px] dark-rectangle" onSubmit={(e) => joinRoom(e)}>
                <div>
                    <span className="text-3xl">Rejoindre un salon</span>
                    <div className="flex flex-col space-y-2 my-8">
                        <label htmlFor="joinUsername">Nom d&apos;utilisateur</label>
                        <input required id="joinUsername" type="text" value={username} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10" onChange={(e) => setUsername(e.target.value)}></input>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="code">Code du salon</label>
                        <input required id="code" type="text" value={code} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10" onChange={(e) => setCode(e.target.value)}></input>
                    </div>
                </div>
                <button className="py-4 mt-8 w-full cursor-pointer dark-button">Rejoindre le salon</button>
            </form>

            <form className="flex flex-col justify-between m-auto rounded-xl px-12 py-8 w-1/3 h-[450px] dark-rectangle" onSubmit={(e) => createRoom(e)}>
                <div>
                    <span className="text-3xl">Créer un salon</span>
                    <span className=" ml-4 text-xs">Par souci de bande passante, cette fonctionnalité est restreinte.</span>
                    <div className="flex flex-col space-y-2 my-8">
                        <label htmlFor="createUsername">Nom d&apos;utilisateur</label>
                        <input required id="createUsername" type="text" value={username} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10" onChange={(e) => setUsername(e.target.value)}></input>
                    </div>
                    <div className="flex flex-col space-y-2 mb-4">
                        <label htmlFor="token">Jeton d'authentification</label>
                        <input required id="token" type="password" value={token} className="bg-gray-700 rounded-lg px-4 py-2 outline outline-white/10" onChange={(e) => setToken(e.target.value)}></input>
                    </div>
                    {createError && (
                        <span className="text-red-500">{createError}</span>
                    )}
                </div>
                <button disabled={loading} className="py-4 mt-8 w-full cursor-pointer dark-button disabled:cursor-not-allowed">{loading ? "Création en cours... Veuillez patienter." : "Créer un salon"}</button>
            </form>
        </div>
    )
}