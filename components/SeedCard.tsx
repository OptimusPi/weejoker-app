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
    onOpenSubmit?: () => void;
    isLocked?: boolean;
    canSubmit?: boolean;
}

// Simple hook removed as it was unused


type CardView = 'DEFAULT' | 'PLAY' | 'SCORES';

export function SeedCard({ seed, dayNumber, className, onAnalyze, onOpenSubmit, isLocked, canSubmit }: SeedCardProps) {
    const [view, setView] = useState<CardView>('DEFAULT');
    const [copied, setCopied] = useState(false);
    const [topScore, setTopScore] = useState<{ name: string; score: number } | null>(null);
    const [allScores, setAllScores] = useState<{ id: number, player_name: string; score: number }[]>([]);

    // Fetch Scores
    useEffect(() => {
        if (dayNumber <= 0) return;
        let isMounted = true;
        fetch(`/api/scores?day=${dayNumber}`)
            .then(res => res.json())
            .then(data => {
                if (isMounted) {
                    const scores = data.scores || [];
                    setAllScores(scores);
                    if (scores.length > 0) {
                        setTopScore({ name: scores[0].player_name, score: scores[0].score });
                    } else {
                        setTopScore(null);
                    }
                }
            })
            .catch(() => {
                if (isMounted) setTopScore(null);
            });
        return () => { isMounted = false; };
    }, [dayNumber]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(seed.seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 3140);
    };

    const getJokers = (ante: 1 | 2) => {
        const jokers: { id: string; name: string; tally?: number }[] = [];
        if (seed.themeJoker && seed.themeJoker !== "Joker") {
            const themeTally = ante === 1 ? seed.themeCardAnte1 : seed.themeCardAnte2;
            if ((themeTally ?? 0) > 0) {
                const jokerId = seed.themeJoker.toLowerCase().replace(/ /g, "");
                jokers.push({ id: jokerId, name: seed.themeJoker, tally: themeTally as number });
            }
        }
        const isAlreadyAdded = (name: string) => jokers.some(j => j.name === name);
        const weeTally = ante === 1 ? seed.WeeJoker_Ante1 : seed.WeeJoker_Ante2;
        if ((weeTally ?? 0) > 0 && !isAlreadyAdded("Wee Joker")) {
            jokers.push({ id: "weejoker", name: "Wee Joker", tally: weeTally as number });
        }
        const hackTally = ante === 1 ? seed.Hack_Ante1 : seed.Hack_Ante2;
        if ((hackTally ?? 0) > 0 && !isAlreadyAdded("Hack")) {
            jokers.push({ id: "hack", name: "Hack", tally: hackTally as number });
        }
        const chadTally = ante === 1 ? seed.HanginChad_Ante1 : seed.HanginChad_Ante2;
        if ((chadTally ?? 0) > 0 && !isAlreadyAdded("Hanging Chad")) {
            jokers.push({ id: "hangingchad", name: "Hanging Chad", tally: chadTally as number });
        }
        if (ante === 1) {
            if ((seed.blueprint_early ?? 0) > 0 && !isAlreadyAdded("Blueprint")) jokers.push({ id: "blueprint", name: "Blueprint", tally: seed.blueprint_early as number });
            if ((seed.brainstorm_early ?? 0) > 0 && !isAlreadyAdded("Brainstorm")) jokers.push({ id: "brainstorm", name: "Brainstorm", tally: seed.brainstorm_early as number });
        }
        return jokers;
    };

    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        if (!isLocked) return;
        const interval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setUTCHours(24, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            if (diff < 0) { setTimeLeft("00:00:00"); return; }
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [isLocked]);

    return (
        <div className={cn("relative group flex flex-col balatro-sway", className)}>
            <div className="balatro-panel p-1.5 flex flex-col relative h-full z-10 grow gap-1.5 min-h-[345px] !overflow-visible">

                {/* Header Row: Seed & Twos */}
                <div className="flex w-full overflow-hidden rounded-lg border-2 border-black/20 shrink-0 h-10">
                    <div className="w-1/2 bg-black/40 flex items-center justify-center border-r-2 border-black/20 overflow-hidden px-1">
                        {!isLocked ? (
                            <button onClick={handleCopy} className="flex items-center gap-2 outline-none w-full justify-center">
                                <div className={cn("p-1 rounded-md transition-colors shrink-0", copied ? 'bg-[var(--balatro-green)]' : 'bg-black/20')}>
                                    {copied ? <Check size={10} className="text-white" strokeWidth={4} /> : <Copy size={10} className="text-white/60" strokeWidth={3} />}
                                </div>
                                <span className={cn("font-header text-xs tracking-wider truncate", copied ? 'text-[var(--balatro-green)]' : 'text-white')}>{copied ? 'COPIED!' : seed.seed}</span>
                            </button>
                        ) : (
                            <span className="font-header text-sm text-white/40 tracking-widest leading-none">--------</span>
                        )}
                    </div>
                    <div className="w-1/2 bg-black/20 flex flex-col items-center justify-center p-0.5">
                        <span className="font-header text-lg text-white tracking-widest leading-none">{seed.twos ?? 0}</span>
                        <span className="font-header text-[var(--balatro-blue)] text-[8px] tracking-widest uppercase mt-[-2px]">Starting 2&apos;s</span>
                    </div>
                </div>

                {/* View Container */}
                <div className="flex-1 flex flex-col min-h-0">
                    {view === 'DEFAULT' && (
                        <div className="flex flex-col gap-1.5 py-1">
                            {[1, 2].map((anteNum) => {
                                const jokers = getJokers(anteNum as 1 | 2);
                                return (
                                    <div key={`ante-${anteNum}`} className="flex items-center gap-2 h-[55px] shrink-0 overflow-visible relative pl-7 group">
                                        <div className="balatro-side-label">ANTE {anteNum}</div>
                                        <div className="flex gap-1 items-end">
                                            {jokers.length === 0 ? (
                                                <span className="font-pixel text-white/10 text-[10px] uppercase tracking-widest">No Jokers</span>
                                            ) : jokers.map((j) => (
                                                <div key={`${anteNum}-${j.id}`} className="relative flex flex-col items-center">
                                                    {j.tally !== undefined && j.tally > 1 && (
                                                        <div className="absolute -top-1 -right-1 bg-[var(--balatro-blue)] text-white font-header text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full z-20 shadow-md">
                                                            {j.tally}
                                                        </div>
                                                    )}
                                                    <Sprite name={j.id} width={j.id === 'weejoker' ? 24 : 36} />
                                                    <span className="font-header text-[7px] text-white/50 uppercase mt-0.5 leading-none">{j.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {view === 'PLAY' && (
                        <div className="flex-1 flex flex-col p-2 bg-black/10 rounded-lg text-center gap-2 justify-center">
                            <h3 className="font-header text-white text-xs uppercase tracking-widest text-[var(--balatro-gold)]">Instructions</h3>
                            <p className="font-header text-[10px] text-white/70 leading-relaxed uppercase tracking-wider">
                                1. Buy Wee Joker in Ante {seed.WeeJoker_Ante1 ? '1' : '2'}.<br />
                                2. Copy it with Hack/Chad.<br />
                                3. Scale it with 2s.<br />
                                4. Post your high score!
                            </p>
                            <div className="flex flex-col gap-1 mt-1">
                                <button onClick={() => setView('SCORES')} className="balatro-button balatro-button-blue text-[10px] py-1 uppercase">View Scores</button>
                                <button onClick={onAnalyze} className="balatro-button balatro-button-gold text-[10px] py-1 uppercase">How to play?</button>
                            </div>
                        </div>
                    )}

                    {view === 'SCORES' && (
                        <div className="flex-1 flex flex-col p-1.5 bg-black/10 rounded-lg min-h-0">
                            <div className="flex justify-between items-center px-1 mb-1 border-b border-white/5 pb-0.5">
                                <span className="font-header text-[8px] text-white/40 uppercase tracking-widest">Global Ranking</span>
                                <button onClick={() => setView('DEFAULT')} className="font-header text-[8px] text-[var(--balatro-red)] uppercase tracking-widest hover:text-white">Close</button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-0.5">
                                {allScores.length > 0 ? allScores.map((s, idx) => (
                                    <div key={s.id} className="flex justify-between items-center bg-white/5 p-1 rounded-sm">
                                        <div className="flex gap-2 items-center">
                                            <span className="font-pixel text-[8px] text-white/20 w-3">#{idx + 1}</span>
                                            <span className="font-header text-[10px] text-white uppercase truncate max-w-[80px]">{s.player_name}</span>
                                        </div>
                                        <span className="font-header text-[10px] text-[var(--balatro-gold)]">{s.score.toLocaleString()}</span>
                                    </div>
                                )) : (
                                    <div className="flex-1 flex items-center justify-center font-pixel text-[8px] text-white/10 uppercase italic">No scores yet</div>
                                )}
                            </div>
                            {canSubmit && (
                                <button onClick={onOpenSubmit} className="mt-1 w-full balatro-button balatro-button-gold text-[10px] py-2 uppercase">Submit Mine</button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer UI - Dynamic Buttons */}
                <div className="mt-auto shrink-0 z-50 flex flex-col gap-1.5">
                    {view === 'DEFAULT' ? (
                        <>
                            {!isLocked && topScore && (
                                <div className="bg-black/10 rounded-lg px-2 py-1 flex justify-between items-center cursor-pointer hover:bg-black/20" onClick={() => setView('SCORES')}>
                                    <span className="font-header text-[var(--balatro-gold)] uppercase text-[9px] tracking-wider">#1 {topScore.name}</span>
                                    <span className="font-header text-white text-sm tracking-widest">{topScore.score.toLocaleString()}</span>
                                </div>
                            )}
                            {isLocked ? (
                                <button className="w-full bg-black/40 text-white/20 font-header text-md py-3 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed border border-white/5 uppercase tracking-widest shadow-inner">
                                    (LOCKED) WEE NO. {dayNumber}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setView('PLAY')}
                                    className="w-full balatro-button balatro-button-red text-md py-3 uppercase tracking-widest font-header"
                                >
                                    PLAY WEE NO. {dayNumber}
                                </button>
                            )}
                        </>
                    ) : (
                        <button onClick={() => setView('DEFAULT')} className="w-full balatro-button balatro-button-blue text-sm py-2 uppercase tracking-widest font-header">
                            Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
