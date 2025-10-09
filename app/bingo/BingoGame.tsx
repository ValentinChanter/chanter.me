"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useGetCookie, useHasCookie, useSetCookie } from 'cookies-next/client';
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

import { useCells } from "./websocket";
import Confetti from "../components/Confetti";

export default function BingoGame({ code }: { code: string }) {
    const hasCookie = useHasCookie();
    const getCookie = useGetCookie();
    const setCookie = useSetCookie();
    const router = useRouter();

    const [isTokenValidating, setIsTokenValidating] = useState(true);
    const [loadingGridAndPlayers, setLoadingGridAndPlayers] = useState(true);
    const [currentView, setCurrentView] = useState<"iframe" | "grid">("grid");
    const overlayRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
    // Create state to track current Wikipedia page
    const [currentPage, setCurrentPage] = useState<string>("");
    const [iframeScrollPosition, setIframeScrollPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

    // Add state for game timer
    const [gameDuration, setGameDuration] = useState(30 * 60); // Default 30 minutes in seconds
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
                sendGrid(data.grid, data.startWord, getCookie("jwt") as string);
            }
        });
    }

    function switchView() {
        // Prevent switching view if grid is not revealed yet
        if (!gridRevealed) return;
        
        if (currentView === "iframe" && iframeRef.current) {
            try {
                // Save scroll position before switching to grid view
                const contentWindow = iframeRef.current.contentWindow;
                if (contentWindow) {
                    setIframeScrollPosition({
                        x: contentWindow.scrollX,
                        y: contentWindow.scrollY
                    });
                }
            } catch (error) {
                console.error("Could not save iframe scroll position:", error);
            }
        }
        
        setCurrentView(currentView === "iframe" ? "grid" : "iframe");
    }

    // WebSocket setup with new winner and gameFinished states
    const [
        cells, setGrid, sendCell, setToken, 
        players, setPlayerList, sendGrid, 
        startWord, setStartWord, token,
        winner, gameFinished,
        gridRevealed, revealGrid,
        gameEndTime
    ] = useCells(() => `ws${process.env.NODE_ENV === "production" ? "s" : ""}://${window.location.host}/api/bingo/socket`);
    
    // Add state to control visibility of winner modal
    const [showWinnerModal, setShowWinnerModal] = useState(true);

    // Function to reveal the grid with timer (owner only)
    const handleRevealGrid = () => {
        revealGrid(getCookie("jwt") as string, gameDuration);
    };

    // Set up timer countdown when gameEndTime changes
    useEffect(() => {
        // Clear any existing interval
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }

        // If we have a game end time, start countdown
        if (gameEndTime) {
            const updateTimer = () => {
                const now = Date.now();
                // Convert both to seconds and calculate the difference
                const endTimeInSeconds = Math.floor(gameEndTime.getTime() / 1000);
                const nowInSeconds = Math.floor(now / 1000);
                const remaining = endTimeInSeconds - nowInSeconds;
                
                if (remaining <= 0) {
                    // Timer finished
                    setTimeRemaining(0);
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    }
                } else {
                    setTimeRemaining(remaining);
                }
            };
            
            // Initial update
            updateTimer();
            
            // Set interval for updates
            timerIntervalRef.current = setInterval(updateTimer, 1000);
        }

        // Cleanup function
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [gameEndTime]);

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
    }, [hasCookie, getCookie, setCookie, setToken, router, code]);
    
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
                    setStartWord(data.startWord);
                    setLoadingGridAndPlayers(false);
                }
            } catch (error) {
                console.error("Grid or players fetch failed:", error);
            }
        };
    
        fetchGrid();
    }, [token, isTokenValidating, code, setGrid, setPlayerList, setStartWord]);

    useEffect(() => {
        // Prevent back navigation in the parent window
        window.history.pushState(null, '', window.location.href);
        
        const handlePopState = () => {
            window.history.pushState(null, '', window.location.href);
        };
        
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Prevent keyboard events except numbers - use document level and capture phase
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only allow numbers 0-9, backspace, delete, tab, arrows
            const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        // Use capture phase to ensure we intercept the event before it reaches the iframe
        document.addEventListener('keydown', handleKeyDown, { capture: true });
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, []);

    // Focus overlay whenever grid loads with improved focus retention
    useEffect(() => {
        if (!loadingGridAndPlayers && overlayRef.current) {
            // Initial focus
            overlayRef.current.focus();
            
            // More aggressive focus retention strategy
            const retainFocus = () => {
                if (document.activeElement?.tagName === 'IFRAME' || 
                    document.activeElement !== overlayRef.current) {
                    overlayRef.current?.focus();
                }
            };
            
            // Run frequently enough to feel responsive but not impact performance
            const focusInterval = setInterval(retainFocus, 100);
            
            // Also attempt to refocus on any user interaction with the document
            const documentEvents = ['mousedown', 'mouseup', 'click', 'touchstart', 'touchend'];
            
            const documentClickHandler = () => {
                setTimeout(retainFocus, 10);
            };
            
            documentEvents.forEach(eventType => {
                document.addEventListener(eventType, documentClickHandler, { capture: true });
            });
            
            return () => {
                clearInterval(focusInterval);
                documentEvents.forEach(eventType => {
                    document.removeEventListener(eventType, documentClickHandler, { capture: true });
                });
            };
        }
    }, [loadingGridAndPlayers]);

    // Extract and decode the page name from a Wikipedia URL
    function extractWikipediaPageName(url: string): string | null {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('wikipedia.org')) {
                const pathParts = urlObj.pathname.split('/');
                if (pathParts.length >= 3 && pathParts[1] === 'wiki') {
                    return decodeURIComponent(pathParts[2]);
                }
            }
            // Also check if this is our proxy URL
            else if (urlObj.pathname.includes('/api/bingo/proxy/')) {
                const pageName = urlObj.pathname.split('/api/bingo/proxy/')[1];
                if (pageName) {
                    return decodeURIComponent(pageName);
                }
            }
            return null;
        } catch (e) {
            console.error("Error extracting Wikipedia page name:", e);
            return null;
        }
    }

    // Check if a word matches a cell and mark it if found
    const checkAndMarkWord = useCallback((word: string) => {
        if (!word || gameFinished) return;
        
        const cell = cells.find(c => c.word === word.replace(/_/g, " "));
        if (cell && !cell.colors.includes(jwtDecode<{ color: string }>(getCookie("jwt") as string).color)) {
            sendCell(cell, getCookie("jwt") as string);
        }
    }, [cells, gameFinished, getCookie, sendCell]);

    // Handle page navigation in the iframe
    const handleIframeNavigation = useCallback((newPageName: string) => {
        try {
            // Always decode the page name to ensure consistent format
            const decodedPageName = decodeURIComponent(newPageName);
            
            // Only process if the page has actually changed
            if (decodedPageName !== currentPage) {
                setCurrentPage(decodedPageName);
                checkAndMarkWord(decodedPageName);
            }
        } catch (e) {
            console.error("Error handling navigation:", e);
        }
    }, [currentPage, setCurrentPage, checkAndMarkWord]);
    
    // Use a message event to receive navigation events from our proxy
    useEffect(() => {
        const messageHandler = (event: MessageEvent) => {
            // Only accept messages from our own domain
            if (event.origin !== window.location.origin) return;
            
            // Check if it's a navigation message from our proxy
            if (event.data && event.data.type === 'wikipediaNavigation' && event.data.page) {
                handleIframeNavigation(event.data.page);
            }
        };
        
        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    }, [cells, currentPage, handleIframeNavigation]);
    
    // Restore scroll position when switching back to iframe
    useEffect(() => {
        if (currentView === "iframe" && iframeRef.current && !loadingGridAndPlayers) {
            try {
                const contentWindow = iframeRef.current?.contentWindow;
                if (contentWindow) {
                    contentWindow.scrollTo(iframeScrollPosition.x, iframeScrollPosition.y);
                }
            } catch (error) {
                console.error("Could not restore iframe scroll position:", error);
            }
        }
    }, [currentView, iframeScrollPosition, loadingGridAndPlayers]);

    // Format seconds to HH:MM:SS or MM:SS based on duration
    const formatTime = (seconds: number): string => {
        if (seconds === null || isNaN(seconds) || seconds < 0) {
            return "00:00";
        }
        
        // Calculate hours, minutes and seconds
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        // Format with or without hours depending on the value
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };

    // Add these new handlers for individual time inputs
    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hours = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
        const minutes = Math.floor((gameDuration % 3600) / 60);
        const seconds = gameDuration % 60;
        setGameDuration((hours * 3600) + (minutes * 60) + seconds);
    };

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hours = Math.floor(gameDuration / 3600);
        const minutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
        const seconds = gameDuration % 60;
        setGameDuration((hours * 3600) + (minutes * 60) + seconds);
    };

    const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hours = Math.floor(gameDuration / 3600);
        const minutes = Math.floor((gameDuration % 3600) / 60);
        const seconds = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
        setGameDuration((hours * 3600) + (minutes * 60) + seconds);
    };

    return (
        <div className='flex h-screen'>
            {!hasCookie("jwt") || jwtDecode<{ code: string }>(getCookie("jwt") as string).code !== code ? (
                <span className='m-auto text-2xl'>Veuillez patienter. Nous vérifions votre jeton...</span>
            ) : (
                <div className="flex flex-row m-auto justify-between w-full h-full px-20 py-8">
                    {/* Winner modal */}
                    {gameFinished && winner && showWinnerModal && (
                        <>
                            {/* Dark overlay with lower z-index */}
                            <div className="fixed inset-0 bg-black/70 z-40"></div>
                            
                            {/* Confetti will be rendered between overlay and content */}
                            <Confetti colors={[winner.color, "#ffffff", "#ffd700", "#FFA500"]} />
                            
                            {/* Modal content with higher z-index */}
                            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                                <div className="bg-gray-800 rounded-lg p-8 max-w-md text-center flex flex-col pointer-events-auto">
                                    <h2 className="text-3xl mb-4">BINGO !</h2>
                                    <div className="flex flex-row justify-center gap-2 mb-4">
                                        <div
                                            className="rounded-full px-3 py-1 w-fit text-center"
                                            style={{
                                                backgroundColor: winner.color
                                            }}
                                        >
                                            <span>{winner.username}</span>
                                        </div>
                                        <span className="flex flex-col justify-center">a gagné !</span>
                                    </div>
                                    <button 
                                        className="dark-button py-2 px-2 text-lg cursor-pointer"
                                        onClick={() => setShowWinnerModal(false)}
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {/* Existing game UI */}
                    <div className="rounded-xl p-4 h-5/6 w-full mx-8 my-auto dark-rectangle ">
                        <div className="w-full h-full">
                            {loadingGridAndPlayers ? (
                                <div className="flex flex-col justify-center h-full">
                                    <span className="flex flex-row justify-center text-2xl">Chargement de la page...</span>
                                </div>
                            ) : !gridRevealed ? (
                                <div className="flex flex-col justify-center h-full">
                                    <span className="flex flex-row justify-center text-2xl">En attente du propriétaire de la salle...</span>
                                </div>
                            ) : (
                                <div className="h-full">       
                                    <div hidden={currentView === "iframe"} className="aspect-square mx-auto my-auto h-full">
                                        <div className="grid grid-cols-5 grid-rows-5 gap-2 h-full">
                                            {cells.map((cell, i) => (
                                                <div key={i} className="relative group">
                                                    <div
                                                        className="outline outline-white/15 rounded-lg p-1 text-white overflow-y-auto no-scrollbar aspect-square text-center hover:bg-gray-600 text-sm flex"
                                                        style={{
                                                            backgroundColor: cell.colors.length > 0  ? cell.colors[0] : ""
                                                        }}
                                                    >
                                                        <div className="overflow-x-auto m-auto">
                                                            <span className="break-words">{cell.word.replace(/_/g, " ") || i + 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute inset-0 z-10 flex justify-center rounded-lg -translate-x-[4rem] translate-y-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-[calc(100%+8rem)] h-[8rem] dark-rectangle overflow-y-hidden no-scrollbar px-2 py-1">
                                                        <span className="break-words text-justify text-sm my-auto">{cell.description}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div hidden={currentView === "grid"} className="h-full relative">
                                        <iframe 
                                            ref={iframeRef}
                                            name="wikipediaFrame"
                                            src={`/api/bingo/proxy/${startWord}`}
                                            className="w-full h-full rounded-lg border border-white/15"
                                            title="Wikipedia"
                                            allow="fullscreen"
                                            onLoad={(e) => {
                                                try {
                                                    // This can't be directly modified due to cross-origin restrictions
                                                    // Instead, we ensure our own window's history is managed
                                                    window.history.pushState({ page: "bingo-game" }, "", window.location.href);
                                                    
                                                    // Focus the overlay immediately when iframe loads
                                                    overlayRef.current?.focus();

                                                    // Track initial load
                                                    const iframe = e.currentTarget as HTMLIFrameElement;
                                                    const pageName = extractWikipediaPageName(iframe.src);
                                                    
                                                    if (pageName && pageName !== currentPage) {
                                                        setCurrentPage(pageName);
                                                    }
                                                } catch (e) {
                                                    console.error("Error with navigation handling:", e);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl p-6 w-1/5 h-5/6 my-auto dark-rectangle">
                        {loadingGridAndPlayers ? (
                            <div className="w-full flex flex-col justify-center h-full">
                                <span className="text-2xl text-center break-words">Chargement des informations...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-between h-full">
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
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col mb-8">
                                        <span className="text-xl">Page Wikipédia de départ</span>
                                        <div className="text-center">
                                            <a href={`https://fr.wikipedia.org/wiki/${startWord}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 break-words text-xl hover:underline">{startWord.replace(/_/g, " ")}</a>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <button 
                                            className={`dark-button py-4 px-2 w-full mb-4 ${!gridRevealed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} 
                                            onClick={() => switchView()}
                                            disabled={!gridRevealed}
                                        >
                                            Passer à la {currentView === "iframe" ? "grille" : "page Wikipédia"}
                                        </button>
                                        <div hidden={currentView === "grid"}>
                                            <div className="grid grid-cols-5 gap-0.5 w-full aspect-square mb-2">
                                                {cells.map((cell, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-full aspect-square rounded-sm"
                                                        style={{
                                                            backgroundColor: cell.colors.length > 0 ? cell.colors[0] : "rgba(255,255,255,0.1)"
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {/* Display countdown timer if game is in progress */}
                                    {gridRevealed && timeRemaining !== null && (
                                        <div className="mb-4 text-center">
                                            <span className="text-xl block mb-2">Temps restant</span>
                                            <span className="text-2xl font-bold">{formatTime(timeRemaining)}</span>
                                        </div>
                                    )}
                                    
                                    {/* Show timer input and reveal button for owner if grid not revealed */}
                                    {jwtDecode<{ owner: boolean }>(getCookie("jwt") as string).owner && !gridRevealed && (
                                        <>
                                            <div className="mb-4">
                                                <label htmlFor="gameDurationHours" className="block text-center mb-2">
                                                    Durée de la partie
                                                </label>
                                                <div className="flex items-center justify-center">
                                                    {/* Hours input */}
                                                    <input
                                                        id="gameDurationHours"
                                                        type="text"
                                                        value={Math.floor(gameDuration / 3600).toString().padStart(2, '0')}
                                                        onChange={handleHoursChange}
                                                        className="w-16 bg-gray-700 rounded-l p-2 text-center text-xl focus:outline-none focus:inset-shadow-sm"
                                                        placeholder="00"
                                                        maxLength={3}
                                                    />
                                                    
                                                    {/* Separator */}
                                                    <span className="text-xl mx-1">:</span>
                                                    
                                                    {/* Minutes input */}
                                                    <input
                                                        id="gameDurationMinutes"
                                                        type="text"
                                                        value={Math.floor((gameDuration % 3600) / 60).toString().padStart(2, '0')}
                                                        onChange={handleMinutesChange}
                                                        className="w-16 bg-gray-700 p-2 text-center text-xl focus:outline-none focus:inset-shadow-sm"
                                                        placeholder="30"
                                                        maxLength={3}
                                                    />
                                                    
                                                    {/* Separator */}
                                                    <span className="text-xl mx-1">:</span>
                                                    
                                                    {/* Seconds input */}
                                                    <input
                                                        id="gameDurationSeconds"
                                                        type="text"
                                                        value={(gameDuration % 60).toString().padStart(2, '0')}
                                                        onChange={handleSecondsChange}
                                                        className="w-16 bg-gray-700 rounded-r p-2 text-center text-xl focus:outline-none focus:inset-shadow-sm"
                                                        placeholder="00"
                                                        maxLength={3}
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                className="dark-button py-4 px-2 w-full cursor-pointer mb-4" 
                                                onClick={handleRevealGrid}
                                            >
                                                Révéler la grille
                                            </button>
                                        </>
                                    )}
                                    
                                    {jwtDecode<{ owner: boolean }>(getCookie("jwt") as string).owner && (
                                        <button className="dark-button py-4 px-2 w-full cursor-pointer" onClick={() => generateGrid()}>Générer une nouvelle grille</button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}