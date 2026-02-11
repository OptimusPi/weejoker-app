"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, Users, PenTool, Database } from 'lucide-react';

const navItems = [
    { name: 'Wee Joker', href: '/', icon: BookOpen, description: 'Daily Ritual' },
    { name: 'We Joker', href: '/we', icon: Users, description: 'Community' },
    { name: 'Me Joker', href: '/create', icon: PenTool, description: 'Create', special: true },
    { name: 'Ice Lake', href: '/ice-lake', icon: Database, description: 'Seed DB' },
];

import { MotelyVersionBadge } from './MotelyVersionBadge';

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
                    const isSpecial = item.special;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 px-4 h-10 rounded-lg transition-all font-header text-sm tracking-widest uppercase relative group",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white/80 hover:bg-white/5",
                                isSpecial && "hover:text-[var(--balatro-gold)]"
                            )}
                        >
                            <item.icon size={16} className={cn(isSpecial && "group-hover:text-[var(--balatro-gold)]")} />
                            <span>{item.name}</span>
                            
                            {isSpecial && (
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-[var(--balatro-gold)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap animate-bounce font-pixel bg-black/90 px-2 py-1 rounded border border-[var(--balatro-gold)]/30 pointer-events-none">
                                    Create your own
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="ml-auto flex items-center gap-4">
                <MotelyVersionBadge />
            </div>
        </nav>
    );
}
