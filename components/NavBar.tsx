"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sprite } from "./Sprite";
import { Brain, Search, Clipboard, Library } from "lucide-react";

export function NavBar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Daily Wee", path: "/", icon: "joker" },
        // Erratic Deck is now the home page, so let's remove the redundant link or repurpose it?
        // User said: "default page SHOULD BE THE RITUAL".
        // Let's keep JAML Builder and others.
        { name: "JAML Builder", path: "/jaml-builder", icon: "brain" },
        { name: "Curator Review", path: "/analyzer-review", icon: "clipboard" },
        { name: "Seed Viewer", path: "/seed-viewer", icon: "magnify" },
    ];

    return (
        <nav className="border-b border-white/10 bg-black/90 sticky top-0 z-50">
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
                                    "flex items-center gap-2 px-4 py-2 font-header uppercase tracking-wider text-sm",
                                    isActive
                                        ? "balatro-button balatro-button-blue text-white"
                                        : "text-white/50 hover:text-white hover:bg-white/5 rounded transition-colors"
                                )}
                            >
                                {/* Icon Logic */}
                                {item.icon === "joker" && <Sprite name="Joker" width={24} className="h-6 w-auto" />}
                                {item.icon === "brain" && <Brain className="w-5 h-5" />}
                                {item.icon === "magnify" && <Search className="w-5 h-5" />}
                                {item.icon === "clipboard" && <Clipboard className="w-5 h-5" />}
                                {item.icon === "cards" && <Library className="w-5 h-5" />}
                                {item.icon === "blueprint" && <Sprite name="Blueprint" width={24} className="h-6 w-auto" />}

                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
