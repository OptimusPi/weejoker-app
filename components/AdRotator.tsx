"use client";

import { useState, useEffect } from "react";
import { HeartHandshake, ExternalLink, Trophy } from "lucide-react";
import Image from "next/image";

interface AdProps {
    onOpenWisdom: () => void;
    onOpenLeaderboard: () => void;
    topScore?: { name: string; score: number } | null;
    isLocked?: boolean;
}

export function AdRotator({ onOpenWisdom, onOpenLeaderboard, topScore, isLocked }: AdProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState("");

    // Countdown Logic (Tick every second)
    useEffect(() => {
        if (!isLocked) return;

        const tick = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setUTCHours(24, 0, 0, 0); // Next Midnight UTC
            const diff = tomorrow.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("UNLOCKING...");
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                setTimeLeft(`${hours}:${minutes}:${seconds}`);
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [isLocked]);

    // Ad Definitions
    const ads: {
        id: string;
        type: 'internal' | 'external' | 'image';
        title?: string;
        subtitle?: string;
        actionText?: string;
        link?: string;
        src?: string;
        icon?: React.ReactNode;
        color?: string;
        action?: () => void;
    }[] = [
            {
                id: 'wisdom',
                type: 'internal',
                title: "Need a Wee bit of Wisdom?",
                subtitle: "WeeJoker shares his +8 Chips!",
                actionText: "GET WISDOM",
                icon: <HeartHandshake size={20} />,
                color: "var(--balatro-blue)",
                action: onOpenWisdom
            },
            isLocked ? {
                id: 'countdown',
                type: 'internal',
                title: `UNLOCKS IN: ${timeLeft}`,
                subtitle: "Come back tomorrow for the Daily Seed!",
                actionText: "LOCKED",
                icon: <span className="text-xl">🔒</span>, // Simple Lock Icon
                color: "#ef4444", // Red
                action: () => { } // No action
            } : {
                id: 'leaderboard',
                type: 'internal',
                title: topScore ? `Who is #1? ${topScore.name.toUpperCase()}!` : "Who is the Daily #1?",
                subtitle: topScore ? `${topScore.score.toLocaleString()} Chips on Day 1` : "Check the Global Leaderboards now!",
                actionText: "VIEW RANKINGS",
                icon: <Trophy size={20} />,
                color: "var(--balatro-gold)",
                action: onOpenLeaderboard
            },
            {
                id: 'erratic',
                type: 'external',
                link: "https://ErraticDeck.app",
                title: "Like Erratic Deck, Bored of Wee Joker?",
                subtitle: "Challenge your friends at ErraticDeck.app",
                actionText: "SEARCH NOW",
                icon: <ExternalLink size={20} />,
                color: "var(--balatro-red)"
            }
        ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 8000); // 8 Seconds
        return () => clearInterval(interval);
    }, [ads.length]);

    const currentAd = ads[currentIndex];

    // Handle Click
    const handleClick = () => {
        if (currentAd.type === 'internal' && currentAd.action) {
            currentAd.action();
        } else if (currentAd.type === 'external' && currentAd.link) {
            window.open(currentAd.link, '_blank');
        }
    };

    return (
        <button
            onClick={handleClick}
            className="w-full relative overflow-hidden bg-[var(--balatro-grey)] rounded-[4px] border border-black/20 transition-colors hover:bg-black/20 active:bg-black/40 p-1 px-3 flex flex-row items-center justify-between gap-2 min-h-[3rem]"
        >
            {currentAd.type === 'image' && currentAd.src ? (
                // Full Image Ad
                <div className="absolute inset-0">
                    <Image src={currentAd.src} alt="Ad" fill className="object-cover" />
                </div>
            ) : (
                // Text/Icon Ad
                <>
                    {/* Content Left */}
                    <div className="flex flex-col items-start text-left z-10 shrink min-w-0">
                        {/* Title with Ad Color Highlight */}
                        <span
                            className="font-header text-sm sm:text-base uppercase tracking-wider leading-none mb-0.5 drop-shadow-sm transition-colors duration-500 truncate w-full"
                            style={{ color: currentAd.color }}
                        >
                            {currentAd.title}
                        </span>
                        <span className="font-pixel text-[8px] sm:text-[10px] text-white/80 line-clamp-1">
                            {currentAd.subtitle}
                        </span>
                    </div>

                    {/* Mobile Only: Simple Icon */}
                    <div className="sm:hidden text-white/50 shrink-0">
                        {currentAd.icon}
                    </div>
                </>
            )}
        </button>
    );
}
