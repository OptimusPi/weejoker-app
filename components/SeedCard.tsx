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

// Simple hook to reuse logic if needed, or stick to existing one
const useCopySeedSnippet = () => {
    const [copied, setCopied] = useState(false);
    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return { copied, copy };
};

export function SeedCard({ seed, dayNumber, className, onAnalyze }: SeedCardProps) {
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

    // Helper to determine sprites for a row
    const getSprites = (ante: 1 | 2) => {
        const sprites: string[] = [];
        // Wee Joker
        if ((ante === 1 && (seed.WeeJoker_Ante1 ?? 0) > 0) || (ante === 2 && (seed.WeeJoker_Ante2 ?? 0) > 0)) {
            sprites.push("weejoker");
        }
        // Hack
        if ((ante === 1 && (seed.Hack_Ante1 ?? 0) > 0) || (ante === 2 && (seed.Hack_Ante2 ?? 0) > 0)) {
            sprites.push("hack");
        }
        // Hanging Chad
        if ((ante === 1 && (seed.HanginChad_Ante1 ?? 0) > 0) || (ante === 2 && (seed.HanginChad_Ante2 ?? 0) > 0)) {
            sprites.push("hangingchad");
        }

        // Blueprint/Brainstorm - Check generic 'early' flags
        if (ante === 1) {
            if ((seed.blueprint_early ?? 0) > 0) sprites.push("blueprint");
            if ((seed.brainstorm_early ?? 0) > 0) sprites.push("brainstorm");
        }

        return sprites;
    };

    const isLocked = seed.isLocked;

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
        <div className={cn("relative group flex flex-col", className)}>
            <div className="absolute inset-0 bg-black/40 rounded-xl blur-sm scale-[1.02] translate-y-2 z-0" />

            {/* Main Container */}
            <div className="bg-[var(--balatro-grey)] rounded-xl border-[4px] border-white/20 p-2 flex flex-col relative overflow-hidden h-full z-10 transition-transform active:translate-y-[2px] grow">

                {/* Inner Container */}
                <div className="rounded-lg bg-[var(--balatro-grey-dark)] p-4 flex flex-col gap-4 relative border border-white/10 grow h-full">

                    {/* Header: Seed ID */}
                    {isLocked ? (
                        // LOCKED HEADER
                        <div className="flex items-center gap-4 w-full p-2 -ml-2 rounded-lg shrink-0 select-none opacity-60">
                            <div className="p-3 rounded-lg border-2 border-white/20 bg-[var(--balatro-disabled-face)]">
                                <span className="text-2xl">🔒</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-header text-3xl text-white tracking-widest drop-shadow-md blur-sm">HIDDEN</span>
                                <span className="font-pixel text-[10px] text-white/50 uppercase tracking-wider">LOCKED UNTIL TOMORROW</span>
                            </div>
                        </div>
                        </div>
                ) : (
                <div className="flex items-center gap-4 w-full text-left p-3 rounded-lg border-2 border-red-900/50 bg-red-950/30 cursor-not-allowed">
                    <div className="p-3 rounded-lg border-2 border-red-500/50 bg-red-900/20">
                        <span className="text-2xl drop-shadow-md">🔒</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-header text-3xl text-red-200/50 tracking-widest drop-shadow-md blur-[2px]">????????</span>
                        <span className="font-pixel text-[10px] text-red-400/80 uppercase tracking-wider">LOCKED</span>
                    </div>
                </div>
            </div>
            ) : (
            <div className="bg-black/20 rounded-xl p-2 -ml-2 select-none">
                <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    className="flex items-center gap-4 w-full text-left group/seed hover:brightness-110 transition-all outline-none"
                    title="Click to Copy Seed"
                >
                    <div className={`p-3 rounded-lg border-2 transition-all duration-300 ${copied ? 'bg-[var(--balatro-blue)] border-white' : 'bg-[var(--balatro-blue)] border-white/20 group-hover/seed:border-white/60'}`}>
                        {copied ? <Check size={24} className="text-white" strokeWidth={4} /> : <Copy size={24} className="text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-header text-3xl text-white tracking-widest drop-shadow-md">{seed.seed}</span>
                        <span className="font-pixel text-[10px] text-white/50 uppercase tracking-wider">{copied ? 'COPIED TO CLIPBOARD' : 'CLICK TO COPY'}</span>
                    </div>
                </button>
            </div>
                    )}

            {/* TWO Count Section */}
            <div className="bg-black/30 rounded-lg p-4 border border-white/5 shrink-0">
                <div className="flex flex-col items-center">
                    <span className="font-header text-5xl text-white tracking-widest drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
                        {seed.twos ?? 0}
                    </span>
                    <span className="font-header text-[var(--balatro-blue)] text-sm tracking-widest uppercase mt-[-4px]">
                        TWOS
                    </span>
                </div>
            </div>

            {/* Sprites Rows */}
            <div className="flex flex-col gap-2 grow justify-center py-2 h-0 min-h-0">
                {/* Ante 1 Row */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5 flex items-center gap-4 grow min-h-[4rem]">
                    <span className="font-header text-[#D04035] text-xl w-8 shrink-0 text-right">A1</span>
                    <div className="flex flex-wrap gap-2 items-center justify-center grow">
                        {((seed.WeeJoker_Ante1 ?? 0) > 0) && (
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/10 mr-2">
                                <Sprite name="weejoker" width={32} />
                                <span className="font-header text-[var(--balatro-blue)] text-sm">WEE JOKER</span>
                            </div>
                        )}
                        {getSprites(1).filter(s => s !== 'weejoker').length > 0 ? getSprites(1).filter(s => s !== 'weejoker').map((s, i) => (
                            <Sprite key={`a1-${i}`} name={s} width={48} className="drop-shadow-md" />
                        )) : (!((seed.WeeJoker_Ante1 ?? 0) > 0) && <span className="font-pixel text-white/20 text-xs">-</span>)}
                    </div>
                </div>

                {/* Ante 2 Row */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5 flex items-center gap-4 grow min-h-[4rem]">
                    <span className="font-header text-[#D04035] text-xl w-8 shrink-0 text-right">A2</span>
                    <div className="flex flex-wrap gap-2 items-center justify-center grow">
                        {((seed.WeeJoker_Ante2 ?? 0) > 0) && (
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded border border-white/10 mr-2">
                                <Sprite name="weejoker" width={32} />
                                <span className="font-header text-[var(--balatro-blue)] text-sm">WEE JOKER</span>
                            </div>
                        )}
                        {getSprites(2).filter(s => s !== 'weejoker').length > 0 ? getSprites(2).filter(s => s !== 'weejoker').map((s, i) => (
                            <Sprite key={`a2-${i}`} name={s} width={48} className="drop-shadow-md" />
                        )) : (!((seed.WeeJoker_Ante2 ?? 0) > 0) && <span className="font-pixel text-white/20 text-xs">-</span>)}
                    </div>
                </div>
            </div>

            {/* Top Score & Action Bar */}
            <div className="mt-auto shrink-0 z-50 flex flex-col gap-2">
                {/* Top Score (Hidden if Locked to avoid spoilers/confusion? Or show last year's? Best to hide or show dashes) */}
                {!isLocked && topScore ? (
                    <div className="bg-black/40 rounded-lg px-3 py-2 border border-white/10 flex justify-between items-center">
                        <span className="font-header text-[var(--balatro-gold)] uppercase text-xs tracking-wider">
                            Best: {topScore.name.substring(0, 10)}
                        </span>
                        <span className="font-header text-white text-lg tracking-widest drop-shadow-sm leading-none">
                            {topScore.score.toLocaleString()}
                        </span>
                    </div>
                ) : (
                    <div className="bg-black/40 rounded-lg px-3 py-2 border border-white/10 flex justify-center items-center">
                        <span className="font-pixel text-white/40 text-[10px] tracking-widest uppercase">
                            {isLocked ? "SCORES LOCKED" : "NO SCORES YET"}
                        </span>
                    </div>
                )}

                {/* Play Button or Countdown */}
                {isLocked ? (
                    <div className="w-full bg-[var(--balatro-disabled-face)] text-[var(--balatro-disabled-text)] font-header text-xl px-4 py-3 rounded-xl shadow-[0_4px_0_var(--balatro-disabled-shadow)] flex items-center justify-center gap-3 border border-white/10 cursor-not-allowed">
                        <span>{timeLeft || "--:--:--"}</span>
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onAnalyze?.(); }}
                        className="w-full bg-[var(--balatro-orange)] text-white font-header text-xl px-4 py-3 rounded-xl shadow-[0_4px_0_#000] flex items-center justify-center gap-3 hover:bg-[#D04035] hover:brightness-110 active:shadow-none active:translate-y-[2px] transition-all"
                    >
                        <span>PLAY</span>
                    </button>
                )}
            </div>
        </div>
            </div >
        </div >
    );
}
