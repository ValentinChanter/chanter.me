"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className='flex h-screen'>
      <div className="m-auto flex flex-row h-full w-full px-20 justify-center gap-16">
        <div className="rounded-xl py-6 px-8 dark-rectangle my-auto w-[320px] flex flex-col cursor-pointer hover:scale-105 active:scale-95 transition-transform" onClick={() => router.push("/bingo")}>
          <span className="text-3xl mb-4">Wikirace Bingo</span>
          <span className="text-justify">Face off against your friends in a race to reach the most Wikipedia pages before your friends do!</span>
        </div>
        <span className="my-auto">(+ 1 unlisted page)</span>
      </div>
    </div>
  );
}
