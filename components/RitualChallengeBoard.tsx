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
    const { data: analysis } = useSeedAnalyzer(seed);

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

            {/* ===== HERO CARD CONTAINER with arrows ===== */}
            <div className="flex items-center justify-center gap-2">
                {viewMode === 'quick' && (
                    <button
                        type="button"
                        onClick={onPrevDay}
                        disabled={!canGoBack}
                        className="straddle-arrow flex items-center justify-center text-lg disabled:opacity-40 shrink-0"
                        title="Previous Day"
                    >
                        &lt;
                    </button>
                )}

                {/* ===== THE CARD — jimbo-panel, fixed dimensions ===== */}
                <div className={cn(
                    "hero-card jimbo-panel overflow-hidden",
                    viewMode === 'full' && "!w-[480px]"
                )}>
                    {/* --- HEADER: Seed + Badge --- */}
                    <div className="jimbo-inner-panel p-2 flex items-center justify-between shrink-0 mb-1">
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <span className="font-pixel text-[11px] text-[var(--jimbo-green)] tracking-wider animate-pulse">Copied!</span>
                            ) : (
                                <Copy size={14} className="text-white/40" />
                            )}
                            {isLocked ? (
                                <span className="font-header text-lg text-[var(--jimbo-grey)] tracking-wider">PREVIEW</span>
                            ) : (
                                <span className="font-header text-lg text-[var(--jimbo-blue)] tracking-wider">{seed}</span>
                            )}
                        </div>

                        {/* Top-right: starting rank badge OR deck sprite */}
                        {viewMode === 'quick' && startingRankSummary ? (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                                style={{ backgroundColor: 'var(--jimbo-inner-border)' }}>
                                <span className="font-header text-[var(--jimbo-gold)]">{startingRankSummary.count}</span>
                                <span className="font-pixel text-[10px] text-white/40">Starting</span>
                                <span className="font-header text-white/60">{startingRankSummary.rank}&apos;s</span>
                            </div>
                        ) : viewMode === 'full' ? (
                            <div className="flex items-center gap-2">
                                <span className="font-pixel text-[11px] text-white/30 tracking-wider">Erratic Deck</span>
                                <DeckSprite
                                    deck={analysis?.deck || 'Erratic Deck'}
                                    size={36}
                                    className="shadow-sm"
                                />
                            </div>
                        ) : null}
                    </div>

                    {/* ===== QUICK VIEW ===== */}
                    {viewMode === 'quick' && (
                        <div className="flex-1 flex flex-col gap-1.5 p-1.5 min-h-0">
                            {/* Compact deck fan */}
                            <div className="jimbo-inner-panel p-1.5 overflow-hidden">
                                {analysis?.startingDeck ? (
                                    <div className="scale-[0.55] origin-top w-full flex justify-center" style={{ marginBottom: '-45px' }}>
                                        <CardFan
                                            count={analysis.startingDeck.length}
                                            cards={analysis.startingDeck}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1 animate-pulse py-4">
                                        <Loader2 className="text-white/10" size={16} />
                                        <span className="font-pixel text-[10px] text-white/20">Loading Deck...</span>
                                    </div>
                                )}
                            </div>

                            {/* Found Jokers — fanned hand */}
                            {foundJokers.length > 0 && (
                                <div className="jimbo-inner-panel p-2">
                                    <span className="font-pixel text-[9px] text-white/30 tracking-wider block mb-1">JOKERS</span>
                                    <div className="flex items-center justify-center" style={{ minHeight: '48px' }}>
                                        <div className="flex items-end" style={{ marginLeft: foundJokers.length > 1 ? '8px' : '0' }}>
                                            {foundJokers.map((item, i) => (
                                                <div
                                                    key={item.id + i}
                                                    className="relative transition-transform hover:z-20 hover:-translate-y-1"
                                                    style={{
                                                        marginLeft: i === 0 ? 0 : '-8px',
                                                        zIndex: i + 1,
                                                    }}
                                                    title={`${item.name}${item.edition ? ` (${item.edition})` : ''} — Ante ${item.ante}`}
                                                >
                                                    <Sprite
                                                        name={item.name}
                                                        width={38}
                                                        edition={item.edition as any}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Found Consumables */}
                            {foundConsumables.length > 0 && (
                                <div className="jimbo-inner-panel p-2">
                                    <span className="font-pixel text-[9px] text-white/30 tracking-wider block mb-1">CONSUMABLES</span>
                                    <div className="flex items-center justify-center gap-1 flex-wrap">
                                        {foundConsumables.map((item, i) => (
                                            <div
                                                key={item.id + i}
                                                className="transition-transform hover:-translate-y-1"
                                                title={`${item.name} (${item.type}) — Ante ${item.ante}`}
                                            >
                                                <Sprite
                                                    name={item.name}
                                                    width={30}
                                                    edition={item.edition as any}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No winner yet placeholder if no jokers/consumables found */}
                            {foundJokers.length === 0 && foundConsumables.length === 0 && !isLocked && (
                                <div className="jimbo-inner-panel p-3 flex items-center gap-2">
                                    <span className="text-lg">🏆</span>
                                    <span className="font-pixel text-[11px] text-white/30">No Winner Yet!</span>
                                </div>
                            )}

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Play / Lock Button */}
                            {isLocked ? (
                                <button
                                    type="button"
                                    disabled
                                    className="jimbo-btn jimbo-btn-gold w-full opacity-60 cursor-not-allowed"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <span>Unlocks Tomorrow:</span>
                                        <span>No. {dayNumber}</span>
                                    </span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setViewMode('full')}
                                    className="jimbo-btn jimbo-btn-blue w-full text-lg"
                                >
                                    Play No. {dayNumber}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ===== FULL (PLAY) VIEW ===== */}
                    {viewMode === 'full' && (
                        <>
                            {/* Tab Bar — always red, tight spacing */}
                            <div className="flex w-full shrink-0 px-2 pt-2 pb-1 gap-2 justify-center items-end overflow-visible">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab;
                                    const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                                    return (
                                        <div key={tab} className="relative flex flex-col items-center">
                                            {/* Bouncing red arrow */}
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

                            {/* Tab Content — fixed height, scrolls internally */}
                            <div className="flex-1 overflow-y-auto min-h-0" style={{ backgroundColor: 'var(--jimbo-inner-border)' }}>
                                {activeTab === 'details' && (
                                    <div className="p-2 space-y-2">
                                        {/* 4-Row Deck Fan */}
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center justify-between px-1">
                                                <span className="font-pixel text-[11px] text-white/40 tracking-wider">Starting Deck</span>
                                                <span className="font-pixel text-[11px] text-white/20">{analysis?.startingDeck?.length || 52} Cards</span>
                                            </div>
                                            <div className="jimbo-inner-panel p-2 flex items-center justify-center relative overflow-visible">
                                                {analysis?.startingDeck ? (
                                                    <DeckFan4Row cards={analysis.startingDeck} featuredRank={startingRankSummary?.rank} />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 animate-pulse py-8">
                                                        <Loader2 className="text-white/10" />
                                                        <span className="font-pixel text-[11px] text-white/20">Analyzing Deck...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Submit CTA */}
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

                            {/* Back button — gold/orange, compact */}
                            <div className="p-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('quick')}
                                    className="jimbo-btn jimbo-btn-gold w-full"
                                >
                                    Back
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {viewMode === 'quick' && (
                    <button
                        type="button"
                        onClick={onNextDay}
                        disabled={!canGoForward}
                        className="straddle-arrow flex items-center justify-center text-lg disabled:opacity-40 shrink-0"
                        title="Next Day"
                    >
                        &gt;
                    </button>
                )}
            </div>
        </div>
    );
}
