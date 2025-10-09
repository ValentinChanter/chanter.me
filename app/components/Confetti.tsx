"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { 
    type ISourceOptions,
    MoveDirection, 
    OutMode 
} from "@tsparticles/engine";
import { loadFull } from "tsparticles";

interface ConfettiProps {
    colors?: string[];
}

const Confetti = ({ colors = ["#f00", "#0f0", "#00f", "#ff0", "#f0f", "#0ff"] }: ConfettiProps) => {
    const [init, setInit] = useState(false);

    // Initialize the particles engine once
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options: ISourceOptions = useMemo(
        () => ({
            fullScreen: {
                enable: true,
                zIndex: 45 // Set to be above dark overlay (40) but below modal content (50)
            },
            particles: {
                number: {
                    value: 100
                },
                color: {
                    value: colors
                },
                shape: {
                    type: "circle"
                },
                opacity: {
                    value: { min: 0.4, max: 0.8 }
                },
                size: {
                    value: { min: 2, max: 6 }
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: MoveDirection.bottom,
                    straight: false,
                    outModes: {
                        default: OutMode.out
                    }
                },
                life: {
                    duration: {
                        sync: false,
                        value: Infinity
                    },
                    count: 1
                },
                rotate: {
                    value: {
                        min: 0,
                        max: 360
                    },
                    direction: "random",
                    animation: {
                        enable: true,
                        speed: 60
                    }
                },
                tilt: {
                    value: { min: 0, max: 360 },
                    animation: { enable: true, speed: 60 },
                    direction: "random",
                    enable: true
                },
                roll: {
                    enable: true,
                    speed: { min: 15, max: 25 },
                    mode: "both",
                    darken: { enable: true, value: 30 },
                    enlighten: { enable: true, value: 30 }
                },
                wobble: {
                    distance: 30,
                    enable: true,
                    speed: {
                        angle: { min: -15, max: 15 },
                        move: 10
                    }
                }
            },
            background: {
                color: {
                value: "transparent"
                }
            },
            detectRetina: true,
            emitters: {
                direction: "bottom",
                life: {
                    count: 1000,
                    duration: 0.1,
                    delay: 0.1
                },
                rate: {
                    delay: 0.01,
                    quantity: 5
                },
                size: {
                    width: 100,
                    height: 0
                },
                position: {
                    y: 100,
                    x: 50
                }
            }
        }),
        [colors]
    );

    if (!init) return null;

    return <Particles id="tsparticles-confetti" options={options} />;
};

export default Confetti;
