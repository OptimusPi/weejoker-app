"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BookOpen, Users, PenTool, FileCode, Search } from 'lucide-react';

const navItems = [
    { name: 'We Joker', href: '/we', icon: Users, description: 'Community' },
    { name: 'Me Joker', href: '/create', icon: PenTool, description: 'Create', special: true },
    { name: 'JAML', href: '/jaml-uiv2', icon: FileCode, description: 'Editor' },
    { name: 'Search', href: '/seed-viewer', icon: Search, description: 'Find Seeds' },
];



export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="h-14 md:h-16 border-b border-white/10 bg-black/60 flex items-center px-2 md:px-6 gap-2 md:gap-8 shrink-0 z-50">
            {/* Logo / Home Link */}
            <Link href="/" className="flex items-center gap-1 md:gap-2 mr-1 md:mr-4 group">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded bg-[var(--balatro-blue)] flex items-center justify-center font-header text-lg md:text-xl text-white shadow-[0_2px_0_var(--balatro-shadow)] group-hover:brightness-110 transition-all">
                    W
                </div>
                <span className="font-header text-lg md:text-xl tracking-widest text-white hidden md:block">
                    Wee<span className="text-[var(--balatro-blue)]">Joker</span>
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
                                "flex items-center gap-1.5 md:gap-2 px-2 md:px-4 h-9 md:h-10 rounded-lg transition-all font-header text-[11px] md:text-sm tracking-wide relative group whitespace-nowrap",
                                isActive
                                    ? "bg-white/10 text-white"
                                    : "text-white/40 hover:text-white/80 hover:bg-white/5",
                                isSpecial && "hover:text-[var(--balatro-gold)]"
                            )}
                        >
                            <item.icon size={14} className={cn("shrink-0", isSpecial && "group-hover:text-[var(--balatro-gold)]")} />
                            <span className="text-[10px] md:text-sm pt-0.5">{item.name}</span>

                            {isSpecial && (
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-[var(--balatro-gold)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap animate-bounce font-pixel bg-black/90 px-2 py-1 rounded border border-[var(--balatro-gold)]/30 pointer-events-none z-50">
                                    Create your own
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="ml-auto" />
        </nav>
    );
}
