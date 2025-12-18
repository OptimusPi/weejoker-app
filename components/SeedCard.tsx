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
            {/* Main Container - BALATRO CARD STYLE */}
            {/* Main Container - BALATRO CARD STYLE */}
            <div className="bg-[var(--balatro-grey)] rounded-xl border-[3px] border-black/20 p-1.5 flex flex-col relative overflow-hidden h-full z-10 grow gap-1.5">

                {/* Header: Seed ID */}
                <div className="bg-black/20 rounded-lg p-1 select-none shrink-0 h-12 flex items-center">
                    {isLocked ? (
                        <div className="flex items-center gap-3 w-full px-2">
                            <div className="p-1.5 rounded-md bg-black/20 text-white/20">
                                🔒
                            </div>
                            <div className="flex flex-col">
                                <span className="font-header text-xl text-white/20 tracking-widest leading-none blur-[1px]">XXXXXXXX</span>
                                <span className="font-pixel text-[8px] text-white/20 uppercase tracking-tighter">LOCKED</span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                            className="flex items-center gap-2 w-full text-left outline-none px-1"
                            title="Click to Copy Seed"
                        >
                            <div className={`p-1.5 rounded-md ${copied ? 'bg-[var(--balatro-green)]' : 'bg-black/20'}`}>
                                {copied ? <Check size={16} className="text-white" strokeWidth={4} /> : <Copy size={16} className="text-white/60" strokeWidth={3} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-header text-xl text-white tracking-widest leading-none">{seed.seed}</span>
                                <span className="font-pixel text-[8px] text-white/40 uppercase tracking-tighter">{copied ? 'COPIED' : 'CLICK TO COPY'}</span>
                            </div>
                        </button>
                    )}
                </div>

                {/* Main Stats Area */}
                <div className="bg-black/10 rounded-lg p-1 px-3 flex flex-col items-center shrink-0">
                    <span className="font-header text-3xl text-white tracking-widest leading-none">
                        {seed.twos ?? 0}
                    </span>
                    <span className="font-header text-[var(--balatro-blue)] text-[10px] tracking-widest uppercase mt-[-1px]">
                        TWOS
                    </span>
                </div>

                {/* Ante Rows */}
                <div className="flex flex-col gap-1 shrink-0 justify-center">
                    {/* Ante 1 Row */}
                    <div className="bg-black/5 rounded-lg p-1.5 flex items-center gap-2">
                        <span className="font-header text-[var(--color-red)] text-md w-5 shrink-0 text-right opacity-80">A1</span>
                        <div className="flex flex-wrap gap-1 items-center justify-center grow">
                            {((seed.WeeJoker_Ante1 ?? 0) > 0) && (
                                <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded">
                                    <Sprite name="weejoker" width={22} />
                                    <span className="font-header text-[var(--balatro-blue)] text-[9px]">WEE JOKER</span>
                                </div>
                            )}
                            {getSprites(1).filter(s => s !== 'weejoker').length > 0 ? getSprites(1).filter(s => s !== 'weejoker').map((s, i) => (
                                <Sprite key={`a1-${i}`} name={s} width={32} />
                            )) : (!((seed.WeeJoker_Ante1 ?? 0) > 0) && <span className="font-pixel text-white/5 text-[10px]">NONE</span>)}
                        </div>
                    </div>

                    {/* Ante 2 Row */}
                    <div className="bg-black/5 rounded-lg p-1.5 flex items-center gap-2">
                        <span className="font-header text-[var(--color-red)] text-md w-5 shrink-0 text-right opacity-80">A2</span>
                        <div className="flex flex-wrap gap-1 items-center justify-center grow">
                            {((seed.WeeJoker_Ante2 ?? 0) > 0) && (
                                <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded">
                                    <Sprite name="weejoker" width={22} />
                                    <span className="font-header text-[var(--balatro-blue)] text-[9px]">WEE JOKER</span>
                                </div>
                            )}
                            {getSprites(2).filter(s => s !== 'weejoker').length > 0 ? getSprites(2).filter(s => s !== 'weejoker').map((s, i) => (
                                <Sprite key={`a2-${i}`} name={s} width={32} />
                            )) : (!((seed.WeeJoker_Ante2 ?? 0) > 0) && <span className="font-pixel text-white/5 text-[10px]">NONE</span>)}
                        </div>
                    </div>
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
                            <span className="font-pixel text-white/20 text-[9px] tracking-widest uppercase">
                                {isLocked ? "LOCKED" : "NO SCORES"}
                            </span>
                        </div>
                    )}

                    {/* Play Button or Countdown */}
                    {isLocked ? (
                        <div className="w-full bg-[var(--balatro-disabled-face)] text-[var(--balatro-disabled-text)] font-header text-lg px-4 py-2 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed">
                            <span>{timeLeft || "--:--:--"}</span>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAnalyze?.(); }}
                            className="w-full bg-[var(--balatro-orange)] text-white font-header text-lg px-4 py-2 rounded-lg flex items-center justify-center hover:bg-[var(--color-dark-orange)] opacity-100 transition-colors uppercase"
                        >
                            PLAY
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
