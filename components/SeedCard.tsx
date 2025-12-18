"use client";
import { SeedData } from "@/lib/types";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Sprite } from "./Sprite";
import { cn } from "@/lib/utils";

interface SeedCardProps {
    seed: SeedData;
    dayNumber: number;
    className?: string;
    onAnalyze?: () => void;
    isLocked?: boolean;
}

// Simple hook removed as it was unused


export function SeedCard({ seed, dayNumber, className, onAnalyze, isLocked }: SeedCardProps) {
    const [copied, setCopied] = useState(false);
    const [topScore, setTopScore] = useState<{ name: string; score: number } | null>(null);

    // Fetch Top Score when dayNumber changes
    useEffect(() => {
        if (dayNumber <= 0) return;

        let isMounted = true;
        // Simple fetch for the top score
        fetch(`/api/scores?day=${dayNumber}`)
            .then(res => res.json())
            .then(data => {
                if (isMounted) {
                    if (data.scores && data.scores.length > 0) {
                        setTopScore({ name: data.scores[0].player_name, score: data.scores[0].score });
                    } else {
                        setTopScore(null);
                    }
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error("Failed to fetch top score", err);
                    setTopScore(null);
                }
            });

        return () => { isMounted = false; };
    }, [dayNumber]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(seed.seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to determine jokers for a row
    const getJokers = (ante: 1 | 2) => {
        const jokers: { id: string; name: string; tally: number | undefined }[] = [];

        // Wee Joker
        const weeTally = ante === 1 ? seed.WeeJoker_Ante1 : seed.WeeJoker_Ante2;
        if ((weeTally ?? 0) > 0) {
            jokers.push({ id: "weejoker", name: "Wee Joker", tally: weeTally as number });
        }

        // Hack
        const hackTally = ante === 1 ? seed.Hack_Ante1 : seed.Hack_Ante2;
        if ((hackTally ?? 0) > 0) {
            jokers.push({ id: "hack", name: "Hack", tally: hackTally as number });
        }

        // Hanging Chad
        const chadTally = ante === 1 ? seed.HanginChad_Ante1 : seed.HanginChad_Ante2;
        if ((chadTally ?? 0) > 0) {
            jokers.push({ id: "hangingchad", name: "Hanging Chad", tally: chadTally as number });
        }

        // Blueprint/Brainstorm
        if (ante === 1) {
            if ((seed.blueprint_early ?? 0) > 0) jokers.push({ id: "blueprint", name: "Blueprint", tally: seed.blueprint_early as number });
            if ((seed.brainstorm_early ?? 0) > 0) jokers.push({ id: "brainstorm", name: "Brainstorm", tally: seed.brainstorm_early as number });
        }

        return jokers;
    };

    // Countdown Logic (only if locked)
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        if (!isLocked) return;
        const interval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setUTCHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();

            if (diff < 0) {
                // Might need refresh here
                setTimeLeft("00:00:00");
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [isLocked]);

    return (
        <div className={cn("relative group flex flex-col juice-wobble", className)}>
            {/* Main Container - BALATRO PANEL STYLE */}
            <div className="balatro-panel p-1.5 flex flex-col relative h-full z-10 grow gap-1.5 min-h-[340px]">

                {/* Header: Seed ID */}
                {!isLocked && (
                    <div className="bg-black/20 rounded-lg p-0.5 select-none shrink-0 h-10 flex items-center justify-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                            className="flex items-center gap-2 outline-none"
                            title="Click to Copy Seed"
                        >
                            <div className={cn("p-1 rounded-md transition-colors", copied ? 'bg-[var(--balatro-green)]' : 'bg-black/20')}>
                                {copied ? <Check size={14} className="text-white" strokeWidth={4} /> : <Copy size={14} className="text-white/60" strokeWidth={3} />}
                            </div>
                            <span className="font-header text-lg text-white tracking-widest leading-none">{seed.seed}</span>
                        </button>
                    </div>
                )}

                {/* Main Stats Area: TWOS */}
                <div className="bg-black/10 rounded-lg p-0.5 px-3 flex flex-col items-center shrink-0">
                    <span className="font-header text-2xl text-white tracking-widest leading-none">
                        {seed.twos ?? 0}
                    </span>
                    <span className="font-header text-[var(--balatro-blue)] text-[9px] tracking-widest uppercase mt-[-1px]">
                        Starting 2's
                    </span>
                </div>

                {/* Ante Rows */}
                <div className="flex flex-col gap-2 shrink-0 justify-center">
                    {[1, 2].map((anteNum) => {
                        const jokers = getJokers(anteNum as 1 | 2);
                        return (
                            <div key={`ante-${anteNum}`} className="bg-black/10 rounded-lg p-2 flex flex-col gap-1.5">
                                <div className="flex justify-between items-center opacity-60">
                                    <span className="font-header text-[var(--color-red)] text-xs tracking-widest">Ante {anteNum}</span>
                                    {jokers.length === 0 && <span className="font-pixel text-white/10 text-[10px]">None</span>}
                                </div>
                                <div className="flex flex-wrap gap-2 items-start justify-center">
                                    {jokers.map((j) => (
                                        <div key={`${anteNum}-${j.id}`} className="relative bg-black/30 rounded-md p-1 pt-1.5 pb-2 flex flex-col items-center min-w-[50px] group/joker">
                                            {/* Hype Stat Badge */}
                                            {j.tally !== undefined && (
                                                <div className="absolute -top-1 -right-1 bg-[var(--balatro-blue)] text-white font-header text-[10px] px-1 rounded-sm shadow-md z-20">
                                                    +{j.tally}
                                                </div>
                                            )}
                                            <Sprite name={j.id} width={36} />
                                            {/* Name Tag */}
                                            <div className="mt-1 bg-black/40 px-1 rounded-sm w-full text-center">
                                                <span className="font-header text-[8px] text-white/80 whitespace-nowrap">{j.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Top Score & Action Bar */}
                <div className="mt-auto shrink-0 z-50 flex flex-col gap-1.5">
                    {/* Top Score */}
                    {!isLocked && topScore ? (
                        <div className="bg-black/10 rounded-lg px-2 py-1 flex justify-between items-center">
                            <span className="font-header text-[var(--balatro-gold)] uppercase text-[10px] tracking-wider">
                                Best: {topScore.name.substring(0, 8)}
                            </span>
                            <span className="font-header text-white text-md tracking-widest leading-none">
                                {topScore.score.toLocaleString()}
                            </span>
                        </div>
                    ) : (
                        <div className="bg-black/10 rounded-lg px-2 py-1 flex justify-center items-center">
                            <span className="font-pixel text-white/40 text-[9px] tracking-widest uppercase">
                                {isLocked ? "LOCKED" : "NO SCORES"}
                            </span>
                        </div>
                    )}

                    {/* Play Button or Countdown */}
                    {isLocked ? (
                        <div className="w-full bg-[var(--balatro-disabled-face)] text-[var(--balatro-disabled-text)] font-header text-lg px-4 py-1.5 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                            <span>{timeLeft || "--:--:--"}</span>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy();
                                onAnalyze?.();
                            }}
                            className="w-full balatro-button balatro-button-blue text-xl py-2 uppercase"
                        >
                            Play Daily Wee
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
