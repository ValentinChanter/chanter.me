"use client"

import { FormEvent, useState, useEffect } from "react";
import Image from "next/image";
import { useSetCookie, useGetCookie, useHasCookie } from 'cookies-next/client';
import { jwtDecode } from "jwt-decode";

interface NicoJwtPayload {
    level5?: boolean;
    level4?: boolean;
    level3?: boolean;
    level2?: boolean;
    level1?: boolean;
    start?: boolean;
    iat?: number;
    exp?: number;
}

export default function Happy_Birthday_Nico() {
    const [username, setUsername] = useState("");
    const [currentLevel, setCurrentLevel] = useState(0);
    const [jwt, setJwt] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [flag1, setFlag1] = useState("");
    const [flag2_imageUrl, setFlag2ImageUrl] = useState("");
    const [flag2, setFlag2] = useState("");
    const [flag3, setFlag3] = useState("");
    const [flag4_imageUrl, setFlag4ImageUrl] = useState("");
    const [flag4, setFlag4] = useState("");
    const [flag5_imageUrl, setFlag5ImageUrl] = useState("");
    const [flag5, setFlag5] = useState("");

    const setCookie = useSetCookie();
    const getCookie = useGetCookie();
    const hasCookie = useHasCookie();

    // Load JWT from cookie on component mount
    useEffect(() => {
        if (hasCookie('nico_jwt')) {
            const storedJwt = getCookie('nico_jwt');
            if (storedJwt) {
                setJwt(storedJwt);
                
                try {
                    // Decode JWT to determine level
                    const decoded = jwtDecode<NicoJwtPayload>(storedJwt);
                    
                    if (decoded.level4) {
                        setCurrentLevel(5);
                        // Also need to fetch the image URL for level 5
                        fetch("/api/happy-birthday-nico/restoreLevel4", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ token: storedJwt }),
                        }).then(res => {
                            if (res.ok) return res.json();
                            return null;
                        }).then(data => {
                            if (data && data.imageUrl) {
                                setFlag5ImageUrl(data.imageUrl);
                            }
                        });
                    } else if (decoded.level3) {
                        setCurrentLevel(4);
                        // Also need to fetch the image URL for level 4
                        fetch("/api/happy-birthday-nico/restoreLevel4", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ token: storedJwt }),
                        }).then(res => {
                            if (res.ok) return res.json();
                            return null;
                        }).then(data => {
                            if (data && data.imageUrl) {
                                setFlag4ImageUrl(data.imageUrl);
                            }
                        });
                    } else if (decoded.level2) {
                        setCurrentLevel(3);
                    } else if (decoded.level1) {
                        setCurrentLevel(2);
                        // Also need to fetch the image URL for level 2
                        fetch("/api/happy-birthday-nico/restoreLevel2", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ token: storedJwt }),
                        }).then(res => {
                            if (res.ok) return res.json();
                            return null;
                        }).then(data => {
                            if (data && data.imageUrl) {
                                setFlag2ImageUrl(data.imageUrl);
                            }
                        });
                    } else if (decoded.start) {
                        setCurrentLevel(1);
                    }
                } catch {
                    // Invalid JWT, clear it
                    setCookie('nico_jwt', '', { maxAge: 0 });
                }
            }
        }
        setIsLoading(false);
    }, [hasCookie, getCookie, setCookie]);

    const saveJwt = (token: string) => {
        setCookie('nico_jwt', token, { maxAge: 86400 }); // 24 hours
        setJwt(token);
    };

    function start(e: FormEvent) {
        if (username.match(/\w{2,}/)) {
            fetch("/api/happy-birthday-nico/start", {
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
                    saveJwt(data.token);
                    setUsername("");

                    setCurrentLevel(1);
                }
            });     
        }

        e.preventDefault();
    }


    function downloadImage(url: string, title: string) {
        fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = title + ".png";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        });
    }

    function checkLevel1(e: FormEvent) {
        fetch("/api/happy-birthday-nico/level1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt, pass: flag1 }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                saveJwt(data.token);
                setFlag2ImageUrl(data.imageUrl);

                setCurrentLevel(2);
            }
        });

        e.preventDefault();
    }

    function checkLevel2(e: FormEvent) {
        fetch("/api/happy-birthday-nico/level2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt, pass: flag2 }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                saveJwt(data.token);

                setCurrentLevel(3);
            }
        });
        e.preventDefault();
    }

    function checkLevel3(e: FormEvent) {
        fetch("/api/happy-birthday-nico/level3", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt, pass: flag3 }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                saveJwt(data.token);
                setFlag4ImageUrl(data.imageUrl);

                setCurrentLevel(4);
            }
        });
        e.preventDefault();
    }

    function checkLevel4(e: FormEvent) {
        fetch("/api/happy-birthday-nico/level4", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt, pass: flag4 }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                saveJwt(data.token);
                setFlag5ImageUrl(data.imageUrl);

                setCurrentLevel(5);
            }
        });
        e.preventDefault();
    }

    function checkLevel5(e: FormEvent) {
        fetch("/api/happy-birthday-nico/level5", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: jwt, pass: flag5 }),
        }).then((res) => {
            if (res.ok) {
                return res.json();
            }
        }).then((data) => {
            if (data) {
                saveJwt(data.token);
                setCurrentLevel(6);
            }
        });
        e.preventDefault();
    }

    if (isLoading) {
        return (
            <div className="grid place-items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
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
                            <div className="text-center mb-4 flex-col flex" >
                                <span>The &quot;/api/happy-birthday-nico/settings&quot; endpoint is at your disposal.</span>
                                <span>Open it in a new tab to avoid losing progress.</span>
                            </div>
                            <label htmlFor="flag1" className="mb-2">Find the flag:</label>
                            <input id="flag1" type="text" className="bg-gray-700 rounded-lg px-2 py-1" required onChange={(e) => setFlag1(e.target.value)} value={flag1}></input>
                        </form>
                    )}

                    {currentLevel === 2 && (
                        <form className="flex flex-col self-center items-center" onSubmit={(e) => checkLevel2(e)}>
                            <div className="text-center mb-4 flex-col flex items-center" >
                                <div className="mb-4 relative w-[250px] h-[250px]">
                                    {flag2_imageUrl && (
                                        <Image 
                                            src={flag2_imageUrl}
                                            alt="Level 2 Image" 
                                            width={250} 
                                            height={250} 
                                            unoptimized={true}
                                        />
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => downloadImage(flag2_imageUrl, "level2")}
                                    className="bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md mb-6"
                                >
                                    Download Image
                                </button>
                            </div>
                            <label htmlFor="flag2" className="mb-2">Enter the flag:</label>
                            <input 
                                id="flag2" 
                                type="text" 
                                className="bg-gray-700 rounded-lg px-2 py-1" 
                                required 
                                onChange={(e) => setFlag2(e.target.value)} 
                                value={flag2}
                            ></input>
                        </form>
                    )}

                    {currentLevel === 3 && (
                        <form className="flex flex-col self-center" onSubmit={(e) => checkLevel3(e)}>
                            <div className="text-center mb-4 flex-col flex" >
                                <span>Visit &quot;/api/happy-birthday-nico/bakery&quot; with your cookie.</span>
                                <span>The baker will give you feedback on your cookie.</span>
                            </div>
                            <label htmlFor="flag3" className="mb-2">Enter the flag:</label>
                            <input 
                                id="flag3" 
                                type="text" 
                                className="bg-gray-700 rounded-lg px-2 py-1" 
                                required 
                                onChange={(e) => setFlag3(e.target.value)} 
                                value={flag3}
                            ></input>
                        </form>
                    )}

                    {currentLevel === 4 && (
                        <form className="flex flex-col self-center items-center" onSubmit={(e) => checkLevel4(e)}>
                            <div className="text-center mb-4 flex-col flex items-center" >
                                <div className="text-center mb-4 flex-col flex" >
                                    <span>Wow you made it so far! You really are the <span className="font-bold text-lg">M</span>aster of <span className="font-bold text-lg">S</span>ecurity <span className="font-bold text-lg">B</span>ypassing!</span>
                                    <span>Good luck.</span>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => downloadImage(flag4_imageUrl, "level4")}
                                    className="bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md mb-6"
                                >
                                    Download Image
                                </button>
                            </div>
                            <label htmlFor="flag4" className="mb-2">Enter the flag:</label>
                            <input 
                                id="flag4" 
                                type="text" 
                                className="bg-gray-700 rounded-lg px-2 py-1" 
                                required 
                                onChange={(e) => setFlag4(e.target.value)} 
                                value={flag4}
                            ></input>
                        </form>
                    )}

                    {currentLevel === 5 && (
                        <form className="flex flex-col self-center items-center" onSubmit={(e) => checkLevel5(e)}>
                            <div className="text-center mb-4 flex-col flex items-center" >
                                <div className="mb-4 relative w-[384] h-[256]">
                                    {flag5_imageUrl && (
                                        <Image 
                                            src={flag5_imageUrl}
                                            alt="Level 5 Image" 
                                            width={384} 
                                            height={256} 
                                            unoptimized={true}
                                        />
                                    )}
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => downloadImage(flag5_imageUrl, "level5")}
                                    className="bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white px-4 py-2 rounded-md mb-6"
                                >
                                    Download Image
                                </button>
                            </div>
                            <label htmlFor="flag5" className="mb-2">Enter the flag:</label>
                            <input 
                                id="flag5" 
                                type="text" 
                                className="bg-gray-700 rounded-lg px-2 py-1" 
                                required 
                                onChange={(e) => setFlag5(e.target.value)} 
                                value={flag5}
                            ></input>
                        </form>
                    )}

                    {currentLevel === 6 && (
                        <div className="text-center flex flex-col">
                            <span className="text-2xl">Congratulations! You just earned yourself 2 Steam keys!</span>
                            <span className="text-lg">You can ask for an additional one by sending a DM to me</span>
                        </div>
                    )}
                    <div></div>
                </div>
            </main>
        </div>
    );
}  