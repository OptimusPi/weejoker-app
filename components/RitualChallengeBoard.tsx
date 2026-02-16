"use client";

import React, { useState, useEffect } from "react";
import { Copy, Map as MapIcon, Trophy, Loader2 } from "lucide-react";
import { DeckSprite } from "./DeckSprite";
import { DeckFan4Row } from "./DeckFan4Row";
import { CardFan } from "./CardFan";
import { Sprite } from "./Sprite";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { evaluateSeed } from "@/lib/jaml/jamlEvaluator";
import { useJamlFilter } from "@/lib/hooks/useJamlFilter";
import { JamlJourneyMap } from "./cards/JamlJourneyMap";
import { AgnosticSeedCard } from "./AgnosticSeedCard";
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
    displayDate?: string;
}

// ============================================
// Leaderboard (scores tab)
// ============================================
function LeaderboardComponent({ ritualId, seed }: { ritualId: string; seed: string }) {
    const [scores, setScores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/scores?ritualId=${ritualId}&seed=${seed}`);
                if (res.ok) {
                    const data = await res.json() as { scores?: any[] };
                    setScores(data.scores || []);
                }
            } catch (err) {
                console.error('Failed to fetch scores:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, [ritualId, seed]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-white/20" size={24} />
            </div>
        );
    }

    if (scores.length === 0) {
        return (
            <div className="text-center py-8">
                <Trophy size={32} className="mx-auto mb-2 text-white/10" />
                <p className="font-pixel text-[11px] text-white/30">No scores yet. Be the first!</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {scores.map((score: any, i: number) => (
                <div key={i} className="jimbo-inner-panel flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                        <span className="font-header text-sm text-[var(--jimbo-gold)]">#{i + 1}</span>
                        <span className="font-pixel text-xs text-white/60">{score.playerName || 'Anonymous'}</span>
                    </div>
                    <span className="font-header text-sm text-white">{score.score?.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}

// ============================================
// Main Hero Card
// ============================================
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
    jamlConfig,
    displayDate,
}: RitualChallengeBoardProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'strategy' | 'scores'>('details');
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<'quick' | 'full'>('quick');

    // JAML Filter
    const { filter } = useJamlFilter(jamlConfig || '');

    // Seed analysis (from WASM)
    const { data: analysis, loading: isAnalyzing } = useSeedAnalyzer(seed);

    // Evaluation against JAML filter
    const evaluation = React.useMemo(() => {
        if (analysis && filter) {
            return evaluateSeed(analysis, filter);
        }
        return null;
    }, [analysis, filter]);

    // Extract found jokers from evaluation
    const foundJokers = React.useMemo(() => {
        if (!evaluation?.matches) return [];
        const seen = new Set<string>();
        return evaluation.matches
            .filter(m => m.item.type.toLowerCase() === 'joker' && m.priority !== 'mustNot')
            .filter(m => {
                if (seen.has(m.item.id)) return false;
                seen.add(m.item.id);
                return true;
            })
            .map(m => m.item);
    }, [evaluation]);

    // Extract found consumables (tarot/spectral)
    const foundConsumables = React.useMemo(() => {
        if (!evaluation?.matches) return [];
        const seen = new Set<string>();
        return evaluation.matches
            .filter(m => ['tarot', 'spectral'].includes(m.item.type.toLowerCase()) && m.priority !== 'mustNot')
            .filter(m => {
                if (seen.has(m.item.id)) return false;
                seen.add(m.item.id);
                return true;
            })
            .map(m => m.item);
    }, [evaluation]);

    const handleCopy = () => {
        if (isLocked) return;
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Compute starting rank summary (e.g. "14x 2's")
    const startingRankSummary = React.useMemo(() => {
        if (!analysis?.startingDeck) return null;

        let featuredRank: string | null = null;
        if (filter) {
            const allClauses = [...filter.must, ...filter.should];
            for (const clause of allClauses) {
                if (clause.rank) { featuredRank = clause.rank; break; }
                if (clause.type === 'joker' && clause.value === 'Wee Joker') { featuredRank = '2'; }
            }
        }
        if (!featuredRank && objectives.includes("Wee Joker")) { featuredRank = '2'; }

        const rankCounts: Record<string, number> = {};
        for (const card of analysis.startingDeck) {
            const [r] = card.split('_');
            rankCounts[r] = (rankCounts[r] || 0) + 1;
        }

        let targetRank = featuredRank;
        if (!targetRank) {
            let maxRank = '2';
            let maxCount = 0;
            for (const [rank, count] of Object.entries(rankCounts)) {
                if (count > maxCount) { maxCount = count; maxRank = rank; }
            }
            targetRank = maxRank;
        }

        return { rank: targetRank, count: rankCounts[targetRank] || 0, total: analysis.startingDeck.length };
    }, [analysis, filter, objectives]);

    const tabs = ['details', 'strategy', 'scores'] as const;

    return (
        <div className="w-full h-full flex flex-col items-center justify-center select-none relative">
            {/* ===== DAY HEADER — anchored to card ===== */}
            <div className="text-center mb-2 w-[320px]">
                <div className="font-header text-xl text-white tracking-wider leading-none mb-1 select-none"
                    style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}>
                    The Daily Wee
                </div>
                <div className="flex justify-between items-center py-0.5 border-y border-white/10 text-[11px] font-pixel text-white/40 tracking-[0.1em]">
                    <span>{displayDate || 'Loading...'}</span>
                    <span className="text-[var(--jimbo-gold)]">No. {(dayNumber || 0) < 1 ? 1 : dayNumber}</span>
                    <span>Est. 2026</span>
                </div>
            </div>

            {/* ===== HERO CARD CONTAINER with straddling arrows ===== */}
            <div className="flex items-stretch justify-center gap-1 h-[340px] mb-4">
                <div className="w-6 flex items-center justify-center">
                    {viewMode === 'quick' && (
                        <button
                            type="button"
                            onClick={onPrevDay}
                            disabled={!canGoBack}
                            className="straddle-arrow text-sm disabled:opacity-20 shrink-0"
                            title="Previous Day"
                        >
                            &lt;
                        </button>
                    )}
                </div>

                {/* ===== THE HERO CARD (Agnostic) ===== */}
                <AgnosticSeedCard
                    seed={seed}
                    deckSlug={analysis?.deck || 'Erratic'}
                    stakeSlug="White"
                    analysis={analysis}
                    isLocked={isLocked}
                    dayNumber={dayNumber}
                    className={cn(
                        "relative z-10",
                        viewMode === 'full' && "!w-full !max-w-[480px] !h-auto !min-h-0"
                    )}
                    onClick={() => setViewMode('full')}
                />

                <div className="w-6 flex items-center justify-center">
                    {viewMode === 'quick' && (
                        <button
                            type="button"
                            onClick={onNextDay}
                            disabled={!canGoForward}
                            className="straddle-arrow text-sm disabled:opacity-20 shrink-0"
                            title="Next Day"
                        >
                            &gt;
                        </button>
                    )}
                </div>
            </div>

            {/* In full mode, we show the deeper strategy/scores below the hero card */}
            {viewMode === 'full' && (
                <div className="flex flex-col gap-4 w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Tab Bar — red, tight spacing */}
                    <div className="flex w-full shrink-0 px-2 pt-2 pb-1 gap-2 justify-center items-end overflow-visible">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab;
                            const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                            return (
                                <div key={tab} className="relative flex flex-col items-center">
                                    <div
                                        className={cn(
                                            'mb-0.5 transition-opacity duration-150',
                                            isActive ? 'opacity-100 animate-jimbo-bounce' : 'opacity-0 pointer-events-none'
                                        )}
                                    >
                                        <svg width="12" height="8" viewBox="0 0 14 10" fill="var(--jimbo-red)">
                                            <polygon points="7,10 0,0 14,0" />
                                        </svg>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className="jimbo-tab font-header tracking-wide"
                                    >
                                        {label}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="jimbo-inner-panel min-h-[300px] overflow-visible">
                        {activeTab === 'details' && (
                            <div className="p-3 space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="font-pixel text-[11px] text-white/40 tracking-wider">Starting Deck</span>
                                    <span className="font-pixel text-[11px] text-white/20">{analysis?.startingDeck?.length || 52} Cards</span>
                                </div>
                                <div className="p-2 flex items-center justify-center relative overflow-visible">
                                    {analysis?.startingDeck ? (
                                        <div className="w-full flex justify-center">
                                            <DeckFan4Row cards={analysis.startingDeck} featuredRank={startingRankSummary?.rank} />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 animate-pulse py-8">
                                            <Loader2 className="text-white/10 animate-spin" />
                                            <span className="font-pixel text-[11px] text-white/20">Analyzing Deck...</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={onOpenSubmit}
                                    disabled={isLocked}
                                    className="jimbo-btn jimbo-btn-green w-full"
                                >
                                    {isLocked ? "Ritual Locked" : "Submit Score"}
                                </button>
                            </div>
                        )}

                        {activeTab === 'strategy' && (
                            <div className="p-3">
                                {evaluation ? (
                                    <JamlJourneyMap evaluation={evaluation} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                                        <MapIcon size={48} className="mb-4 text-white/20" />
                                        <p className="font-header text-lg text-white/40">Consulting the Spirits...</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'scores' && (
                            <div className="p-3 space-y-3">
                                {!isLocked && (
                                    <button
                                        onClick={onOpenSubmit}
                                        className="jimbo-btn jimbo-btn-blue w-full flex items-center justify-center gap-2"
                                    >
                                        <Trophy size={18} />
                                        Submit Your Run
                                    </button>
                                )}
                                <LeaderboardComponent ritualId={ritualId || ritualConfig.id} seed={seed} />
                            </div>
                        )}
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => setViewMode('quick')}
                        className="jimbo-btn jimbo-btn-back"
                    >
                        Back
                    </button>
                </div>
            )}
        </div>
    );
}
