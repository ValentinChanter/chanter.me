import Image from 'next/image'
import Link from 'next/link'

export default function Header({ title, link }: { title: string, link: string }) {
    return (
        <div className="flex flex-row justify-between gap-8 min-h-[4rem] ring ring-white/30 items-center">
            <Image src="/logo.png" alt="Logo" width={180} height={41} />
            <div className='hover:scale-105 active:scale-95 transition-transform'>
                <Link className="cursor-pointer" href={link}>{title}</Link>
            </div>
            <div className="w-[180px]"></div>
        </div>
    )
}