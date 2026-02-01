"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Map as MapIcon, Info, Trophy } from "lucide-react";
import { AgnosticSeedCard } from "./AgnosticSeedCard";
import { Sprite } from "./Sprite";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { evaluateSeed } from "@/lib/jamlEvaluator";
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

export function RitualChallengeBoard({
    seed,
    objectives,
    onCopy,
    onShowHowTo,
    onOpenSubmit,
    onOpenLeaderboard,
    isLocked,
    dayNumber = 25,
    ritualId = "weejoker",
    onPrevDay,
    onNextDay,
    canGoBack,
    canGoForward,
    jamlConfig
}: RitualChallengeBoardProps) {
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'STRATEGY' | 'SCORES'>('DETAILS');
    const [copied, setCopied] = useState(false);

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
        <div className="w-full h-full flex items-center justify-center overflow-hidden select-none relative">
            <div className="absolute inset-0 pointer-events-none" />

            {/* Left Nav Bar - Stride */}
            {/* Left Nav Bar - Stride */}
            <div className="h-full flex items-center justify-center px-2 z-20">
                <button
                    onClick={onPrevDay}
                    disabled={!canGoBack}
                    className="balatro-button balatro-button-red w-12 md:w-14 h-full p-0 flex items-center justify-center rounded-lg"
                    title="Previous Day"
                    style={{ fontSize: '2rem' }}
                >
                    &lt;
                </button>
            </div>

            {/* Main Cabinet Card - Fit to available height */}
            <div className="flex-1 max-w-md h-full max-h-full flex flex-col bg-[#111818]/90 border-x border-white/5 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10">

                <div className="bg-black/90 p-5 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-xl border border-white/5 group cursor-pointer hover:bg-white/10 transition-all shadow-inner" onClick={handleCopy}>
                        <Copy size={12} className="text-white/20 group-hover:text-white transition-colors" />
                        <span className="font-header text-2xl text-white tracking-[0.25em]">{seed}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="w-8 h-10 bg-white/10 rounded flex items-center justify-center mb-1">
                            <Sprite name="8BitDeck" width={24} />
                        </div>
                        <span className="font-pixel text-[6px] text-white/30 uppercase tracking-widest">Erratic Deck</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 py-4 border-b border-black/20 bg-black/10">
                    {['DETAILS', 'STRATEGY', 'SCORES'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "balatro-button px-6 py-2 min-h-0 h-auto text-lg normal-case tracking-normal",
                                activeTab === tab
                                    ? "balatro-button-red shadow-inner translate-y-[2px]"
                                    : "balatro-button-grey opacity-80 hover:opacity-100"
                            )}
                            style={{
                                boxShadow: activeTab === tab ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : undefined
                            }}
                        >
                            {tab === 'JOURNEY' ? 'STRATEGY' : tab}
                        </button>
                    ))}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--balatro-modal-inner)]">
                    {activeTab === 'DETAILS' && (
                        <div className="p-4 flex flex-col items-center">
                            {/* Deck Composition Fan Concept */}
                            <div className="w-full bg-black/20 rounded-xl p-6 mb-6 border border-white/5 relative overflow-hidden group">
                                <div className="flex justify-center -space-x-12 mb-4 opacity-40 group-hover:opacity-60 transition-opacity">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="w-16 h-24 bg-white/10 border border-white/10 rounded rotate-[-10deg] shadow-lg" />
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-[var(--balatro-black)]/90 px-6 py-3 rounded-lg font-header text-sm text-[var(--balatro-gold)] tracking-[0.2em] border border-[var(--balatro-gold)]/20 shadow-lg relative z-10 flex items-center gap-2">
                                        <Sprite name="8BitDeck" width={16} />
                                        <span>STARTING DECK: 16 RANK 2S</span>
                                    </div>
                                </div>
                            </div>

                            <AgnosticSeedCard
                                seed={seed}
                                analysis={analysis}
                                dayNumber={dayNumber}
                                ritualId={ritualId}
                                isLocked={isLocked}
                                onShowHowTo={onShowHowTo}
                                onOpenSubmit={onOpenSubmit}
                                canSubmit={!isLocked}
                                className="border-none shadow-none bg-transparent p-0 w-full"
                            />
                        </div>
                    )}
                    {activeTab === 'STRATEGY' && (
                        <div className="p-4 bg-[var(--balatro-modal-inner)]">
                            <JamlJourneyMap evaluation={evaluation} />
                        </div>
                    )}
                    {activeTab === 'SCORES' && (
                        <div className="p-8 flex flex-col items-center justify-center h-full space-y-6 text-center">
                            <Trophy size={64} className="text-[var(--balatro-gold)] opacity-20" />
                            <div>
                                <div className="font-header text-2xl uppercase tracking-[0.2em] text-white/50 mb-2">No Winner Yet!</div>
                                <div className="font-pixel text-[10px] text-white/20 tracking-widest">BE THE FIRST TO SUBMIT A SCORE</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Big Blue Play Button */}
                <div className="p-6 bg-[#0f1a1a] border-t border-white/5">
                    <button
                        onClick={onOpenSubmit}
                        disabled={isLocked}
                        className="balatro-button balatro-button-blue w-full text-2xl py-6 tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                        {isLocked ? (
                            <span className="opacity-80">RITUAL LOCKED</span>
                        ) : (
                            <>PLAY RITUAL NO. {dayNumber}</>
                        )}
                    </button>
                </div>

            </div>

            {/* Right Nav Bar - Stride */}
            {/* Right Nav Bar - Stride */}
            {/* Right Nav Bar - Stride */}
            <div className="h-full flex items-center justify-center px-2 z-20">
                <button
                    onClick={onNextDay}
                    disabled={!canGoForward}
                    className="balatro-button balatro-button-red w-12 md:w-14 h-full p-0 flex items-center justify-center rounded-lg"
                    title="Next Day"
                    style={{ fontSize: '2rem' }}
                >
                    &gt;
                </button>
            </div>
        </div>

    );
}
