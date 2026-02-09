"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Search, Eye, BookOpen } from 'lucide-react';

const navItems = [
    { name: 'Daily Ritual', href: '/', icon: BookOpen },
    { name: 'Command Center', href: '/jaml-builder', icon: LayoutDashboard },
    { name: 'Seed Analytics', href: '/seed-viewer', icon: Search },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="h-16 border-b border-white/10 bg-black/60 flex items-center px-6 gap-8 shrink-0 z-50">
            <div className="flex items-center gap-2 mr-4">
                <div className="w-8 h-8 rounded bg-[var(--balatro-red)] flex items-center justify-center font-header text-xl text-white shadow-[0_2px_0_var(--balatro-shadow)]">
                    W
                </div>
                <span className="font-header text-xl tracking-widest text-white uppercase hidden sm:block">
                    WEE<span className="text-[var(--balatro-red)]">JOKER</span>
                </span>
            </div>

            <div className="flex items-center gap-1 h-full">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 h-10 rounded-lg transition-all font-header text-sm tracking-widest uppercase",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                            )}
                        >
                            <item.icon size={16} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="ml-auto flex items-center gap-4">
                <div className="px-3 py-1 rounded bg-black/40 border border-white/5 text-[10px] font-pixel text-white/30 uppercase tracking-widest">
                    Build v2.4.0
                </div>
            </div>
        </nav>
    );
}
