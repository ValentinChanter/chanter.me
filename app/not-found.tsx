import Link from 'next/link'
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "chanter.me - Not Found",
    description: "You're probably lost. Why are you even reading this? You should go back.",
};

export default function Custom404() {
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="w-full h-full gap-[32px] row-start-2">
                <div className="flex flex-col justify-between h-full">
                    <span className="text-5xl">Error 404</span>
                    <div>
                        <span className="flex flex-row justify-center">The page you&apos;re trying to access doesn&apos;t exist. How did you even get here?</span>
                        <Link className="flex flex-row justify-center underline" href="/">Go back</Link>
                    </div>
                    <div></div>
                </div>
            </main>
        </div>
    );
}