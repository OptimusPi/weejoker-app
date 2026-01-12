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

                {/* View Tabs */}
                <div className="flex gap-1 justify-center shrink-0 mt-0.5">
                    {(['DEFAULT', 'PLAY', 'SCORES'] as CardView[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "balatro-tab balatro-button-red",
                                view === v && "balatro-selected-tab"
                            )}
                        >
                            {v === 'DEFAULT' ? 'DETAILS' : v === 'PLAY' ? 'HOW TO' : 'SCORES'}
                        </button>
                    ))}
                </div>

                {/* View Container - Direct content, no inner panel */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {view === 'DEFAULT' && (
                        <div className="flex-1 flex flex-col justify-center gap-1.5 px-2 py-2 overflow-visible">
                            <div className="grid grid-cols-2 gap-1.5">
                                {[1, 2].map((anteNum) => {
                                    const jokers = getJokers(anteNum as 1 | 2);
                                    if (jokers.length === 0) return null;
                                    return (
                                        <div key={anteNum} className="bg-black/30 rounded-lg p-1.5 border border-white/10">
                                            {/* Ante Label */}
                                            <div className={cn(
                                                "text-center font-header text-[9px] tracking-wider uppercase py-0.5 px-1 rounded mb-1",
                                                anteNum === 1 ? "bg-[var(--balatro-gold)] text-black" : "bg-[var(--balatro-blue)] text-white"
                                            )}>
                                                Ante {anteNum}
                                            </div>
                                            {/* Jokers */}
                                            <div className="flex flex-col gap-1">
                                                {jokers.map((j) => (
                                                    <div key={j.id} className="bg-white/5 rounded p-1 flex items-center gap-1.5">
                                                        <div className="relative shrink-0">
                                                            {j.tally !== undefined && j.tally > 1 && (
                                                                <div className="absolute -top-0.5 -right-0.5 bg-white text-black font-header text-[7px] w-3 h-3 flex items-center justify-center rounded-full z-20 shadow-sm">
                                                                    {j.tally}
                                                                </div>
                                                            )}
                                                            <Sprite
                                                                name={j.id}
                                                                width={j.id === 'weejoker' ? 22 : 40}
                                                                className="drop-shadow-sm"
                                                            />
                                                        </div>
                                                        <span className="font-header text-[8px] text-white uppercase leading-tight flex-1">{j.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {getJokers(1).length === 0 && getJokers(2).length === 0 && (
                                <span className="font-pixel text-white/10 text-[9px] uppercase tracking-widest py-4 text-center">No Jokers Found</span>
                            )}
                        </div>
                    )}

                    {view === 'PLAY' && (
                        <div className="flex-1 flex flex-col p-2 text-center gap-2 justify-center">
                            <h3 className="font-header text-[var(--balatro-gold)] text-[10px] uppercase tracking-widest shrink-0">Strategy Guide</h3>
                            <div className="font-header text-[9px] text-white/70 leading-relaxed uppercase tracking-wider flex-1 flex flex-col justify-center">
                                <p>1. Buy Wee Joker in Ante {seed.WeeJoker_Ante1 ? '1' : '2'}.</p>
                                <p>2. Copy it with Hack/Chad.</p>
                                <p>3. Scale it with 2s.</p>
                                <p>4. Submit your high score!</p>
                            </div>
                            <button onClick={onAnalyze} className="balatro-button balatro-button-gold text-[8px] py-1.5 uppercase shrink-0">How do I play?</button>
                        </div>
                    )}

                    {view === 'SCORES' && (
                        <div className="flex-1 flex flex-col p-1.5 min-h-0">
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                                {allScores.length > 0 ? allScores.map((s, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-1 rounded-sm">
                                        <div className="flex gap-1.5 items-center">
                                            <span className="font-pixel text-[8px] text-white/20 w-3">#{idx + 1}</span>
                                            <span className="font-header text-[9px] text-white uppercase truncate max-w-[70px]">{s.player_name}</span>
                                        </div>
                                        <span className="font-header text-[9px] text-[var(--balatro-gold)]">{s.score.toLocaleString()}</span>
                                    </div>
                                )) : (
                                    <div className="flex-1 flex items-center justify-center font-pixel text-[8px] text-white/10 uppercase italic">No scores yet</div>
                                )}
                            </div>
                            {canSubmit && (
                                <button onClick={onOpenSubmit} className="mt-1 w-full balatro-button balatro-button-gold text-[8px] py-2 uppercase shrink-0">Submit Score</button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer UI - Fixed Action Button */}
                <div className="mt-1.5 shrink-0 z-50 flex flex-col gap-1.5">
                    {!isLocked && topScore && view === 'DEFAULT' ? (
                        <div className="bg-black/10 rounded-lg px-2 py-1 flex justify-between items-center cursor-pointer hover:bg-black/20" onClick={() => setView('SCORES')}>
                            <span className="font-header text-[var(--balatro-gold)] uppercase text-[9px] tracking-wider">#1 {topScore.name}</span>
                            <span className="font-header text-white text-sm tracking-widest leading-none">{topScore.score.toLocaleString()}</span>
                        </div>
                    ) : null}

                    {isLocked ? (
                        <div className="w-full bg-black/40 text-white/20 font-header text-md py-3 rounded-lg flex items-center justify-center border border-white/5 uppercase tracking-widest">
                            (LOCKED) WEE NO. {dayNumber}
                        </div>
                    ) : view === 'DEFAULT' ? (
                        <button
                            onClick={() => setView('PLAY')}
                            className="w-full balatro-button balatro-button-red text-md py-3 uppercase tracking-widest font-header"
                        >
                            PLAY WEE NO. {dayNumber}
                        </button>
                    ) : null}

                    {/* Bottom-most button: Always Orange "Back" */}
                    {!isLocked && view !== 'DEFAULT' && (
                        <button
                            onClick={() => setView('DEFAULT')}
                            className="w-full balatro-button balatro-button-back text-md py-3 uppercase tracking-widest font-header"
                        >
                            Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
