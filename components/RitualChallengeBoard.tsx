"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Copy, Map as MapIcon, Info, Trophy, Crown, Medal, Loader2, Play } from "lucide-react";
import { AgnosticSeedCard } from "./AgnosticSeedCard";
import { Sprite } from "./Sprite";
import { CardFan } from "./CardFan";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { evaluateSeed } from "@/lib/jaml/jamlEvaluator";
import { useJamlFilter } from "@/lib/hooks/useJamlFilter";
import { JamlJourneyMap } from "./cards/JamlJourneyMap";
import { cn } from "@/lib/utils";
import { ritualConfig } from "@/lib/config";

interface RitualChallengeBoardProps {
    seed: string;
    objectives: string[];
    onCopy: () => void;
    onShowHowTo: () => void;
    onOpenSubmit: () => void;
    onOpenLeaderboard: () => void;
    isLocked?: boolean;
    dayNumber?: number;
    ritualId?: string;
    onPrevDay?: () => void;
    onNextDay?: () => void;
    canGoBack?: boolean;
    canGoForward?: boolean;
    jamlConfig?: string | null;
}

function LeaderboardComponent({ ritualId, seed }: { ritualId: string; seed: string }) {
    const [scores, setScores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/scores?seed=${seed}&ritualId=${ritualId.toLowerCase()}`);
                if (!res.ok) throw new Error("Failed");
                const data = await res.json() as { scores: any[] };
                if (data.scores) setScores(data.scores);
            } catch (err) {
                console.error("Score load fail", err);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, [ritualId, seed]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 animate-pulse">
            <Loader2 className="animate-spin text-[var(--balatro-gold)] mb-4" size={32} />
            <div className="font-pixel text-white/40 text-sm">Synchronizing Scores...</div>
        </div>
    );

    if (scores.length === 0) return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <Trophy size={48} className="text-white/10 mb-4" />
            <div className="font-header text-xl text-white/40 mb-2">No Hall of Fame entries yet</div>
            <div className="font-pixel text-xs text-white/20">Be the first to carve your name here.</div>
        </div>
    );

    return (
        <div className="space-y-3">
            {scores.map((entry, idx) => (
                <div key={idx} className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-2",
                    idx === 0 ? "bg-[var(--balatro-gold)] border-[var(--balatro-gold)] text-black" : "bg-black/30 border-white/5 text-white"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 flex justify-center">
                            {idx === 0 ? <Crown size={18} /> : idx === 1 ? <Medal size={18} className="text-zinc-400" /> : idx === 2 ? <Medal size={18} className="text-amber-700" /> : <span className="font-header text-zinc-500">{idx + 1}</span>}
                        </div>
                        <span className="font-header text-lg">{entry.player_name}</span>
                    </div>
                    <div className="font-header text-xl tracking-wider">{Number(entry.score).toLocaleString()}</div>
                </div>
            ))}
        </div>
    );
}

export function RitualChallengeBoard({
    seed,
    objectives,
    onCopy,
    onShowHowTo,
    onOpenSubmit,
    onOpenLeaderboard,
    isLocked,
    dayNumber,
    ritualId,
    onPrevDay,
    onNextDay,
    canGoBack,
    canGoForward,
    jamlConfig
}: RitualChallengeBoardProps) {
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'STRATEGY' | 'SCORES'>('DETAILS');
    const [copied, setCopied] = useState(false);
    const [showWisdom, setShowWisdom] = useState(false);

    // JAML Filter[showWisdom, setShowWisdom] = useState(false);

    // JAML Filter
    const { filter } = useJamlFilter(jamlConfig || '');

    // Get analysis for this seed automatically
    const { data: analysis } = useSeedAnalyzer(seed);

    // Evaluation
    const evaluation = React.useMemo(() => {
        if (analysis && filter) {
            return evaluateSeed(analysis, filter);
        }
        return null;
    }, [analysis, filter]);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center select-none relative overflow-hidden md:py-8">
            <div className="absolute inset-0 pointer-events-none" />

            {/* Mobile Header Nav (Day Navigation) */}
            <div className="md:hidden w-full flex items-center justify-between px-4 py-2 bg-black/40 border-b border-white/5 shrink-0 z-20">
                 <button
                    type="button"
                    onClick={onPrevDay}
                    disabled={!canGoBack}
                    className="p-2 text-white/60 disabled:opacity-20 active:text-white"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="font-header text-xl text-[var(--balatro-gold)]">
                    Day {dayNumber}
                </div>
                <button
                    type="button"
                    onClick={onNextDay}
                    disabled={!canGoForward}
                    className="p-2 text-white/60 disabled:opacity-20 active:text-white"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Desktop Left Nav Button */}
            <div className="hidden md:flex items-center justify-center z-20 h-full px-4">
                <button
                    type="button"
                    onClick={onPrevDay}
                    disabled={!canGoBack}
                    className="balatro-button balatro-button-red w-12 flex items-center justify-center rounded-lg shadow-[0_4px_0_#9e2b21] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 text-3xl font-header h-16"
                    title="Previous Day"
                >
                    &lt;
                </button>
            </div>

            {/* Main Cabinet Card */}
            <div className="flex-1 w-full md:max-w-md lg:max-w-xl h-full md:h-auto md:aspect-[9/16] max-h-[900px] flex flex-col bg-[#111818] border-x md:border border-white/10 relative md:rounded-xl shadow-2xl z-10 overflow-hidden">
                
                {/* Header / Seed Info */}
                <div className="bg-black/80 p-4 flex items-center justify-between border-b border-white/10 shrink-0 backdrop-blur-md">
                    <div 
                        className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/5 group cursor-pointer hover:bg-white/10 transition-all active:scale-95" 
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <span className="font-pixel text-[10px] text-green-400 uppercase tracking-widest animate-pulse">Copied!</span>
                        ) : (
                            <Copy size={14} className="text-white/40 group-hover:text-white transition-colors" />
                        )}
                        <span className="font-header text-xl md:text-2xl text-[var(--balatro-blue)] tracking-[0.15em]">{seed}</span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                         {/* Deck Icon */}
                        <div className="flex items-center gap-2">
                            <span className="font-pixel text-[10px] text-white/30 uppercase tracking-widest hidden sm:block">Erratic Deck</span>
                            <div className="w-8 h-10 bg-white/10 rounded border border-white/5 flex items-center justify-center relative overflow-hidden">
                                <Sprite name="8BitDeck" width={24} className="opacity-80" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex w-full bg-black/40 border-b border-white/5 shrink-0">
                    {['Details', 'Strategy', 'Scores'].map((tab) => (
                        <button
                            type="button"
                            key={tab}
                            onClick={() => setActiveTab(tab.toUpperCase() as any)}
                            className={cn(
                                "flex-1 py-3 text-sm font-header uppercase tracking-wider transition-colors relative",
                                activeTab === tab.toUpperCase()
                                    ? "text-[var(--balatro-gold)] bg-white/5"
                                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                            )}
                        >
                            {tab}
                            {activeTab === tab.toUpperCase() && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--balatro-gold)] shadow-[0_-2px_8px_rgba(253,231,0,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1a2323] relative">
                    {activeTab === 'DETAILS' && (
                        <div className="p-4 space-y-6">
                            {/* Card Fan / Deck Visualization */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between px-1">
                                    <span className="font-pixel text-[10px] text-white/40 uppercase tracking-widest">Starting Deck</span>
                                    <span className="font-pixel text-[10px] text-white/20 uppercase">{analysis?.startingDeck?.length || 52} Cards</span>
                                </div>
                                <div className="bg-black/20 rounded-xl p-4 border border-white/5 min-h-[160px] flex items-center justify-center relative overflow-hidden">
                                    {analysis?.startingDeck ? (
                                        <div className="scale-75 origin-top w-full flex justify-center -mb-8">
                                            <CardFan 
                                                count={analysis.startingDeck.length} 
                                                cards={analysis.startingDeck} 
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 animate-pulse">
                                            <Loader2 className="text-white/10" />
                                            <span className="font-pixel text-[10px] text-white/20">Analyzing Deck...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                    <div className="font-pixel text-[10px] text-white/30 uppercase mb-1">Archetype</div>
                                    <div className="font-header text-lg text-[var(--balatro-blue)]">
                                        {evaluation?.matches?.[0]?.item.name || "Unknown"}
                                    </div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                                    <div className="font-pixel text-[10px] text-white/30 uppercase mb-1">Potential</div>
                                    <div className="font-header text-lg text-[var(--balatro-green)]">
                                        {evaluation?.score?.toLocaleString() || "0"}
                                    </div>
                                </div>
                            </div>

                             {/* Mobile Submit CTA */}
                            <div className="md:hidden pt-4">
                                <button
                                    onClick={onOpenSubmit}
                                    disabled={isLocked}
                                    className="balatro-button balatro-button-green w-full py-4 text-xl flex items-center justify-center gap-2"
                                >
                                    {isLocked ? "Ritual Locked" : "Submit Score"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'STRATEGY' && (
                        <div className="p-4 min-h-full">
                            {evaluation ? (
                                <JamlJourneyMap evaluation={evaluation} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                    <MapIcon size={48} className="mb-4 text-white/20" />
                                    <p className="font-header text-xl text-white/40">Consulting the Spirits...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'SCORES' && (
                        <div className="flex flex-col min-h-full">
                            <div className="p-4 space-y-4 flex-1">
                                {/* Submit CTA in Scores tab too */}
                                {!isLocked && (
                                    <button
                                        onClick={onOpenSubmit}
                                        className="balatro-button balatro-button-blue w-full py-3 text-lg flex items-center justify-center gap-2 mb-4"
                                    >
                                        <Trophy size={18} />
                                        Submit Your Run
                                    </button>
                                )}
                                <LeaderboardComponent ritualId={ritualId || ritualConfig.id} seed={seed} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Desktop Footer Action */}
                <div className="hidden md:block p-4 bg-black/40 border-t border-white/5 shrink-0">
                    <button
                        type="button"
                        onClick={onOpenSubmit}
                        disabled={isLocked}
                        className="balatro-button balatro-button-green w-full text-xl py-4 tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        {isLocked ? (
                            <span className="opacity-80">Ritual Locked</span>
                        ) : (
                            <>Submit Score</>
                        )}
                    </button>
                </div>

            </div>

            {/* Desktop Right Nav Button */}
            <div className="hidden md:flex items-center justify-center z-20 h-full px-4">
                <button
                    type="button"
                    onClick={onNextDay}
                    disabled={!canGoForward}
                    className="balatro-button balatro-button-red w-12 flex items-center justify-center rounded-lg shadow-[0_4px_0_#9e2b21] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 text-3xl font-header h-16"
                    title="Next Day"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}
