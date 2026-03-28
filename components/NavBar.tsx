"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sparkles, Terminal, Database, Search, Zap, Rocket } from 'lucide-react';

const navItems = [
    { name: 'Daily', href: '/we', icon: Zap },
    { name: 'Editor', href: '/create', icon: Terminal, special: true },
    { name: 'Vault', href: '/jaml-builder', icon: Database },
    { name: 'Search', href: '/seed-viewer', icon: Search },
    { name: 'Explore', href: '/explore', icon: Sparkles },
    { name: 'Moon Lander', href: '/moon-lander', icon: Rocket },
    { name: 'Drive', href: '/drive', icon: Rocket },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="relative z-50 flex items-center justify-center w-full px-4 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-1 md:gap-2 p-1.5 bg-[#1a1e1e] border-2 border-[var(--jimbo-inner-border)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md bg-opacity-80">
                {/* Logo / Home */}
                <Link href="/" className="flex items-center justify-center w-10 h-10 ml-1 mr-2 transition-all rounded-xl bg-[var(--jimbo-blue)] shadow-[0_3px_0_var(--jimbo-dark-blue)] hover:brightness-110 active:translate-y-0.5 active:shadow-none group">
                    <span className="font-header text-2xl text-white select-none">W</span>
                </Link>

                <div className="flex items-center gap-1 h-full min-w-0 pr-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        const isSpecial = item.special;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center gap-2 px-3 md:px-5 py-2.5 rounded-xl transition-all duration-200 min-w-0",
                                    isActive
                                        ? "bg-[var(--jimbo-red)] shadow-[0_3px_0_var(--jimbo-dark-red)] text-white"
                                        : "text-[var(--jimbo-grey)] hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon
                                    size={16}
                                    className={cn(
                                        "shrink-0",
                                        isActive ? "text-white" : isSpecial ? "text-[var(--jimbo-gold)]" : "text-inherit"
                                    )}
                                />
                                <span className={cn(
                                    "font-header text-xs md:text-sm tracking-widest uppercase truncate pt-0.5",
                                    !isActive && "hidden md:block" // Hide text on small screens unless active
                                )}>
                                    {item.name}
                                </span>

                                {isActive && (
                                    <div className="absolute -top-1 -right-1">
                                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
