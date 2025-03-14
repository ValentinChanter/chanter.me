"use client"

import { FormEvent, useState } from "react";

export default function Home() {
    const [username, setUsername] = useState("");
    const [currentLevel, setCurrentLevel] = useState(0);
    const [level2Password, setLevel2Password] = useState("");

    function start(e: FormEvent) {
        // Send timestamp and username to server
        if (username.match(/\w{2,}/)) {
            setCurrentLevel(1);
        }

        e.preventDefault();
    }

    function checkLevel1(e: FormEvent) {
        // Send timestamp to server
        setCurrentLevel(2);

        e.preventDefault();
    }

    function checkLevel2(e: FormEvent) {
        if (level2Password === process.env.LEVEL_2_PASS) { // check password server-side instead (env won't work client side)
            // timestamp
            setCurrentLevel(3);
        }

        e.preventDefault();
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="w-full h-full gap-[32px] row-start-2">
                <div className="flex flex-col justify-between h-full">
                    <span className="text-5xl">Level {currentLevel}</span>
                    {currentLevel === 0 && (
                        <form className="flex flex-col self-center" onSubmit={(e) => start(e)}>
                            <label htmlFor="username" className="mb-2">Enter your username:</label>
                            <input id="username" type="text" className="bg-slate-800 rounded-lg px-2 py-1" pattern="\w{2,}" required onChange={(e) => setUsername(e.target.value)} value={username} title="Please use at least 2 alphanumeric characters (\w{2,})"></input>
                        </form>
                    )}

                    {currentLevel === 1 && (
                        <form className="flex flex-col self-center" onSubmit={(e) => checkLevel1(e)}>
                            <button disabled className="rounded-full border-slate-500 border-1 px-4 py-3 cursor-not-allowed">Continue to Level 2</button>
                        </form>
                    )}

                    {currentLevel === 2 && (
                        <form className="flex flex-col self-center" onSubmit={(e) => checkLevel2(e)}>
                            <label htmlFor="password" className="mb-2">Enter password:</label>
                            <input id="password" type="password" disabled className="bg-slate-800 rounded-lg px-2 py-1 cursor-not-allowed" onChange={(e) => setLevel2Password(e.target.value)} value={level2Password}></input>
                        </form>
                    )}
                    <div></div>
                </div>
            </main>
        </div>
    );
}  