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

            {/* Main Content Area with Flanking Nav Buttons */}
            <div className="flex items-center justify-center w-full max-w-xl md:max-w-2xl lg:max-w-4xl h-full md:h-auto gap-2 md:gap-4 px-2 md:px-0 z-10">
                
                {/* Left Nav Button - Desktop & Mobile */}
                <button
                    type="button"
                    onClick={onPrevDay}
                    disabled={!canGoBack}
                    className="hidden md:flex balatro-button balatro-button-red w-12 md:w-16 items-center justify-center rounded-lg shadow-[0_4px_0_#9e2b21] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 text-3xl font-header h-40 shrink-0"
                    title="Previous Day"
                >
                    &lt;
                </button>

                {/* Main Cabinet Card */}
                <div className="flex-1 w-full flex flex-col bg-[#111818] border-x md:border border-white/10 relative md:rounded-xl shadow-2xl overflow-hidden max-h-[85vh] md:max-h-[800px]">
                    
                    {/* Header / Seed Info */}
                <div className="bg-black/80 p-2 md:p-3 flex items-center justify-between border-b border-white/10 shrink-0 backdrop-blur-md relative z-20">
                     {/* Mobile Nav Left */}
                    <button
                        type="button"
                        onClick={onPrevDay}
                        disabled={!canGoBack}
                        className="md:hidden balatro-button balatro-button-red w-8 h-8 flex items-center justify-center rounded shadow-[0_2px_0_#9e2b21] active:shadow-none active:translate-y-[2px] disabled:opacity-50"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div 
                        className="flex items-center gap-2 md:gap-3 bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded border border-white/5 group cursor-pointer hover:bg-white/10 transition-all active:scale-95 mx-auto md:mx-0" 
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <span className="font-pixel text-[11px] text-green-400 tracking-wider animate-pulse">Copied!</span>
                        ) : (
                            <Copy size={14} className="text-white/40 group-hover:text-white transition-colors" />
                        )}
                        <span className="font-header text-lg md:text-xl text-[var(--balatro-blue)] tracking-wider">{seed}</span>
                    </div>
                    
                    {/* Mobile Nav Right */}
                    <button
                        type="button"
                        onClick={onNextDay}
                        disabled={!canGoForward}
                        className="md:hidden balatro-button balatro-button-red w-8 h-8 flex items-center justify-center rounded shadow-[0_2px_0_#9e2b21] active:shadow-none active:translate-y-[2px] disabled:opacity-50"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <div className="hidden md:flex flex-col items-end">
                         {/* Deck Icon */}
                        <div className="flex items-center gap-2">
                            <span className="font-pixel text-[11px] text-white/30 tracking-wider hidden sm:block">Erratic Deck</span>
                            <div className="w-6 h-8 bg-white/10 rounded border border-white/5 flex items-center justify-center relative overflow-hidden">
                                <Sprite name="8BitDeck" width={20} className="opacity-80" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs - Balatro Floating Pills Style */}
                <div className="flex w-full bg-[var(--balatro-black)] shrink-0 px-2 py-2 gap-2 justify-center items-center relative z-10 border-b border-white/5">
                    {['Details', 'Strategy', 'Scores'].map((tab) => {
                        const isActive = activeTab === tab.toUpperCase();
                        return (
                            <div key={tab} className="relative flex flex-col items-center">
                                {/* Bouncing Triangle Indicator (Only for Active) */}
                                {isActive && (
                                    <div className="absolute -top-3 animate-bounce z-20">
                                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[var(--balatro-red)]" />
                                    </div>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(tab.toUpperCase() as any)}
                                    className={cn(
                                        "px-4 py-1.5 text-base md:text-lg font-header tracking-wide transition-all rounded-lg shadow-[0_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]",
                                        isActive
                                            ? "bg-[var(--balatro-red)] text-white scale-105 z-10"
                                            : "bg-[var(--balatro-grey)] text-white/60 hover:bg-[var(--balatro-light-black)] hover:text-white"
                                    )}
                                >
                                    {tab}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1a2323] relative">
                    {activeTab === 'DETAILS' && (
                        <div className="p-2 md:p-3 space-y-3">
                            {/* Card Fan / Deck Visualization */}
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between px-1">
                                    <span className="font-pixel text-[11px] text-white/40 tracking-wider">Starting Deck</span>
                                    <span className="font-pixel text-[11px] text-white/20">{analysis?.startingDeck?.length || 52} Cards</span>
                                </div>
                                <div className="bg-black/20 rounded-lg p-2 border border-white/5 min-h-[120px] flex items-center justify-center relative overflow-hidden">
                                    {analysis?.startingDeck ? (
                                        <div className="scale-75 origin-top w-full flex justify-center -mb-4">
                                            <CardFan 
                                                count={analysis.startingDeck.length} 
                                                cards={analysis.startingDeck} 
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 animate-pulse">
                                            <Loader2 className="text-white/10" />
                                            <span className="font-pixel text-[11px] text-white/20">Analyzing Deck...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/20 rounded p-2 border border-white/5">
                                    <div className="font-pixel text-[11px] text-white/30 mb-0.5">Target Hand</div>
                                    <div className="font-header text-base text-[var(--balatro-blue)]">
                                        {evaluation?.matches?.[0]?.item.name || "Unknown"}
                                    </div>
                                </div>
                                <div className="bg-black/20 rounded p-2 border border-white/5">
                                    <div className="font-pixel text-[11px] text-white/30 mb-0.5">Potential</div>
                                    <div className="font-header text-base text-[var(--balatro-green)]">
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

            {/* Desktop Right Nav Button - Now Visible on Mobile too */}
            <div className="flex items-center justify-center z-20 h-full px-1 md:px-4 shrink-0">
                <button
                    type="button"
                    onClick={onNextDay}
                    disabled={!canGoForward}
                    className="balatro-button balatro-button-red w-10 md:w-14 flex items-center justify-center rounded-lg shadow-[0_4px_0_#9e2b21] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 text-2xl md:text-3xl font-header h-full max-h-[600px] md:max-h-none"
                    title="Next Day"
                >
                    <ChevronRight size={24} className="md:hidden" />
                    <span className="hidden md:block">&gt;</span>
                </button>
            </div>
        </div>
    );
}
