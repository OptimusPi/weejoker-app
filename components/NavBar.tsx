"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sprite } from "./Sprite";
import { Brain, Search } from "lucide-react";

export function NavBar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Daily Wee", path: "/", icon: "joker" },
        { name: "JAML Builder", path: "/jaml-builder", icon: "brain" },
        { name: "Seed Viewer", path: "/seed-viewer", icon: "magnify" },
    ];

    return (
        <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo / Home Link */}
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Sprite name="Wee Joker" width={32} />
                    <span className="font-header text-2xl text-white tracking-widest uppercase drop-shadow-md">
                        Wee<span className="text-[var(--balatro-blue)]">Joker</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="flex items-center gap-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded transition-all font-header uppercase tracking-wider text-sm",
                                    isActive
                                        ? "balatro-button balatro-button-blue text-white shadow-balatro border-none translate-y-[-2px]"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {/* Icon Logic */}
                                {item.icon === "joker" && <Sprite name="Joker" width={24} className="h-6 w-auto" />}
                                {item.icon === "brain" && <Brain className="w-5 h-5" />}
                                {item.icon === "magnify" && <Search className="w-5 h-5" />}

                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
