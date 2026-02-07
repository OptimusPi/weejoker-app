"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Copy, Map as MapIcon, Info, Trophy, Crown, Medal, Loader2, Play } from "lucide-react";
import { AgnosticSeedCard } from "./AgnosticSeedCard";
import { Sprite } from "./Sprite";
import { CardFan } from "./CardFan";
import { WeeWisdom } from "./WeeWisdom";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { evaluateSeed } from "@/lib/jaml/jamlEvaluator";
import { useJamlFilter } from "@/lib/hooks/useJamlFilter";
import { JamlJourneyMap } from "./cards/JamlJourneyMap";
import { cn } from "@/lib/utils";

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
                const data = await res.json();
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
        <div className="w-full h-full min-h-0 flex items-center justify-center select-none relative py-2 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" />

            {/* Central Layout Container */}
            <div className="flex items-center justify-center gap-4 h-full w-full max-w-6xl mx-auto px-4">

                {/* Left Nav Button */}
                <div className="flex items-center justify-center z-20 self-stretch">
                    <button
                        type="button"
                        onClick={onPrevDay}
                        disabled={!canGoBack}
                        className="balatro-button balatro-button-red w-12 md:w-14 flex items-center justify-center rounded-lg shadow-[0_4px_0_#9e2b21] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 text-3xl font-header h-full"
                        title="Previous Day"
                    >
                        &lt;
                    </button>
                </div>

                {/* Main Cabinet Card */}
                <div className="flex-1 max-w-2xl w-full h-full max-h-full flex flex-col bg-[#111818]/60 border-x border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 backdrop-blur-sm">

                    <div className="bg-black/90 p-5 flex items-center justify-between border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-xl border border-white/5 group cursor-pointer hover:bg-white/10 transition-all shadow-inner active:scale-95" onClick={handleCopy}>
                            <Copy size={12} className="text-white/20 group-hover:text-white transition-colors" />
                            <span className="font-header text-2xl text-[var(--balatro-blue)] tracking-[0.25em]">{seed}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="w-8 h-10 bg-white/10 rounded flex items-center justify-center mb-1">
                                <Sprite name="8BitDeck" width={24} />
                            </div>
                            <span className="font-pixel text-sm text-white/30 tracking-widest">Erratic Deck</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center gap-2 py-4 border-b border-black/20 bg-black/10 shrink-0">
                        {['Details', 'Strategy', 'Scores'].map((tab) => (
                            <button
                                type="button"
                                key={tab}
                                onClick={() => setActiveTab(tab.toUpperCase() as any)}
                                className={cn(
                                    "balatro-button px-6 py-2 min-h-0 h-auto text-lg normal-case tracking-normal",
                                    activeTab === tab.toUpperCase()
                                        ? "balatro-button-red shadow-inner translate-y-[2px]"
                                        : "balatro-button-grey opacity-80 hover:opacity-100"
                                )}
                                style={{
                                    boxShadow: activeTab === tab.toUpperCase() ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : undefined
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--balatro-modal-inner)] min-h-0">
                        {activeTab === 'DETAILS' && (
                            <div className="p-4 flex flex-col items-center gap-4">
                                <AgnosticSeedCard
                                    seed={seed}
                                    analysis={analysis}
                                    dayNumber={dayNumber}
                                    ritualId={ritualId}
                                    jamlConfig={jamlConfig}
                                    isLocked={isLocked}
                                    onShowHowTo={onShowHowTo}
                                    onOpenSubmit={onOpenSubmit}
                                    canSubmit={!isLocked}
                                    className="border-none shadow-none bg-transparent p-0 w-full"
                                />

                                {/* Command Station Link */}
                                <div className="w-full">
                                    <Link
                                        href="/jaml-uiv2"
                                        className="balatro-button balatro-button-purple w-full py-3 flex items-center justify-center gap-2 group transition-all hover:scale-[1.02]"
                                    >
                                        <Sprite name="Brainstorm" width={24} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <span className="font-header text-xl">Command Station</span>
                                    </Link>
                                </div>
                                {/* Banner Ad / Wee Wisdom - REMOVED PER USER REQUEST */}
                                {showWisdom && (
                                    <WeeWisdom onBack={() => setShowWisdom(false)} />
                                )}
                            </div>
                        )}
                        {activeTab === 'STRATEGY' && (
                            <div className="p-4 bg-[var(--balatro-modal-inner)]">
                                <JamlJourneyMap evaluation={evaluation} />
                            </div>
                        )}
                        {activeTab === 'SCORES' && (
                            <div className="p-4 bg-[var(--balatro-modal-inner)] min-h-full">
                                <LeaderboardComponent ritualId={ritualId || 'the-daily-wee'} seed={seed} />
                            </div>
                        )}
                    </div>

                    {/* Big Blue Play Button */}
                    <div className="p-6 bg-[#0f1a1a] border-t border-white/5 shrink-0">
                        <button
                            type="button"
                            onClick={onOpenSubmit}
                            disabled={isLocked}
                            className="balatro-button balatro-button-green w-full text-2xl py-6 tracking-[0.2em] flex items-center justify-center gap-2"
                        >
                            {isLocked ? (
                                <span className="opacity-80">Ritual locked</span>
                            ) : (
                                <>Play Ritual No. {dayNumber}</>
                            )}
                        </button>
                    </div>

                </div>

                {/* Right Nav Button */}
                <div className="flex items-center justify-center z-20 self-stretch">
                    <button
                        type="button"
                        onClick={onNextDay}
                        disabled={!canGoForward}
                        className="balatro-button balatro-button-red w-12 md:w-14 flex items-center justify-center rounded-lg shadow-[0_4px_0_#9e2b21] active:shadow-none active:translate-y-[4px] disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 text-3xl font-header h-full"
                        title="Next Day"
                    >
                        &gt;
                    </button>
                </div>

            </div>
        </div>

    );
}
