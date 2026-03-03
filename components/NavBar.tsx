"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, PenTool, FileCode, Search } from 'lucide-react';

const navItems = [
    { name: 'We Joker', href: '/we', icon: Users },
    { name: 'Me Joker', href: '/create', icon: PenTool, special: true },
    { name: 'JAML', href: '/jaml-uiv2', icon: FileCode },
    { name: 'Search', href: '/seed-viewer', icon: Search },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="jimbo-panel flex-row items-center px-2 md:px-4 py-0 h-14 md:h-16 gap-2 md:gap-6 shrink-0 z-50">
            {/* Logo / Home Link */}
            <Link href="/" className="flex items-center gap-1 md:gap-2 mr-1 md:mr-4 group">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-[var(--jimbo-blue)] flex items-center justify-center font-header text-lg md:text-xl text-white shadow-[0_2px_0_var(--jimbo-border-south)]">
                    W
                </div>
                <span className="font-header text-lg md:text-xl tracking-widest text-white hidden md:block">
                    Wee<span className="text-[var(--jimbo-blue)]">Joker</span>
                </span>
            </Link>

            <div className="flex items-center gap-0.5 md:gap-1 h-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    const isSpecial = item.special;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "jimbo-btn py-1.5 px-2 md:px-3 text-[10px] md:text-sm w-auto gap-1 md:gap-2",
                                isActive
                                    ? "jimbo-btn-red"
                                    : "bg-transparent text-[var(--jimbo-grey)] hover:text-white hover:bg-[var(--jimbo-panel-edge)]",
                                isSpecial && !isActive && "hover:text-[var(--jimbo-gold)]"
                            )}
                        >
                            <item.icon size={14} className="shrink-0" />
                            <span className="pt-0.5">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="ml-auto" />
        </nav>
    );
}
