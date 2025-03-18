"use client"

import { FormEvent, useState } from "react";

export default function Admin() {
    const [username, setUsername] = useState("");
    const [currentLevel, setCurrentLevel] = useState(0);
    const [level2Password, setLevel2Password] = useState("");
    const [jwt, setJwt] = useState("");

    function start(e: FormEvent) {
        if (username.match(/\w{2,}/)) {
            fetch("/api/admin/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username }),
            }).then((res) => {
                if (res.ok) {
                    return res.json();
                }
            }).then((data) => {
                if (data) {
                    setJwt(data.token);
                    setUsername("");

                    setCurrentLevel(1);
                }
            });     
        }

        e.preventDefault();
    }

    function checkLevel1(e: FormEvent) {
        fetch("/api/admin/level1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                setJwt(data.token);

                setCurrentLevel(2);
            }
        });

        e.preventDefault();
    }

    function checkLevel2(e: FormEvent) {
        fetch("/api/admin/level2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt, pass: level2Password }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                setJwt(data.token);
                setLevel2Password("");
                
                setCurrentLevel(3);
            }
        });

        e.preventDefault();
    }

    function end() {
        fetch("/api/admin/end", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt }),
        }).then((res) => {
            if (res.ok) {
                setJwt("");
                setCurrentLevel(0);
            }
        });
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="w-full h-full gap-[32px] row-start-2">
                <div className="flex flex-col justify-between h-full">
                    <span className="text-5xl">Level {currentLevel}</span>
                    {currentLevel === 0 && (
                        <form className="flex flex-col self-center" onSubmit={(e) => start(e)}>
                            <label htmlFor="username" className="mb-2">Enter your username:</label>
                            <input id="username" type="text" className="bg-gray-700 rounded-lg px-2 py-1" pattern="\w{2,}" required onChange={(e) => setUsername(e.target.value)} value={username} title="Please use at least 2 alphanumeric characters (\w{2,})"></input>
                        </form>
                    )}

                    {currentLevel === 1 && (
                        <form className="flex flex-col self-center" onSubmit={(e) => checkLevel1(e)}>
                            <div className="mb-2 flex flex-col">
                                <span>You have been given a token to track your progress.</span>
                                <span className="flex flex-row justify-center">Please do not lose or modify it.</span>
                            </div>
                            <button disabled className="rounded-full border-slate-500 border-1 px-4 py-3 cursor-not-allowed">Got it. Take me to Level 2.</button>
                        </form>
                    )}

                    {currentLevel === 2 && (
                        <form className="flex flex-col self-center" onSubmit={(e) => checkLevel2(e)}>
                            <label htmlFor="password" className="mb-2">Enter password:</label>
                            <input id="password" type="password" disabled className="bg-gray-700 rounded-lg px-2 py-1 cursor-not-allowed" onChange={(e) => setLevel2Password(e.target.value)} value={level2Password}></input>
                        </form>
                    )}

                    {currentLevel === 3 && (
                        <span className="flex flex-row justify-center">Nothing here... for now</span>
                    )}

                    {currentLevel > 1 ? (
                        <div className="flex flex-row justify-end">
                            <button className="rounded-full border-red-500 border-1 px-4 py-3 cursor-pointer hover:bg-red-500" onClick={() => end()}>Forfeit</button>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>
            </main>
        </div>
    );
}  