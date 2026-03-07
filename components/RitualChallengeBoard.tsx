"use client";

import React, { useState, useEffect } from "react";
import { Copy, Map as MapIcon, Trophy, Loader2 } from "lucide-react";
import { DeckSprite } from "./DeckSprite";
import { DeckFan4Row } from "./DeckFan4Row";
import { PlayingCard } from "./PlayingCard";
import { Sprite } from "./Sprite";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { evaluateSeed } from "@/lib/jaml/jamlEvaluator";
import { useJamlFilter } from "@/lib/hooks/useJamlFilter";
import { JamlJourneyMap } from "./cards/JamlJourneyMap";
import { cn } from "@/lib/utils";
import { JimboInnerPanel } from "./JimboPanel";

// Maps JAML filter clause rank values → PlayingCard rank prop
const JAML_RANK_MAP: Record<string, "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "Jack" | "Queen" | "King" | "Ace"> = {
    'A': 'Ace', 'Ace': 'Ace',
    'K': 'King', 'King': 'King',
    'Q': 'Queen', 'Queen': 'Queen',
    'J': 'Jack', 'Jack': 'Jack',
    '10': '10', '9': '9', '8': '8', '7': '7',
    '6': '6', '5': '5', '4': '4', '3': '3', '2': '2',
};

// Maps JAML filter clause suit values → PlayingCard suit prop
const JAML_SUIT_MAP: Record<string, "Hearts" | "Clubs" | "Diamonds" | "Spades"> = {
    'H': 'Hearts', 'Hearts': 'Hearts',
    'C': 'Clubs', 'Clubs': 'Clubs',
    'D': 'Diamonds', 'Diamonds': 'Diamonds',
    'S': 'Spades', 'Spades': 'Spades',
};

interface RitualChallengeBoardProps {
    seed: string;
    objectives: string[];
    ritualTitle?: string;
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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const fetchScores = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/scores?ritualId=${ritualId}&seed=${seed}`);
                if (!active) return;
                if (res.ok) {
                    const data = await res.json() as { scores?: any[] };
                    if (active) setScores(data.scores || []);
                } else {
                    if (active) setError('Scores unavailable');
                }
            } catch (err) {
                console.error('Failed to fetch scores:', err);
                if (active) setError('Scores unavailable');
            } finally {
                if (active) setLoading(false);
            }
        };
        fetchScores();
        return () => { active = false; };
    }, [ritualId, seed]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-[var(--jimbo-grey)]" size={24} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="font-pixel text-[11px] text-white/30">{error}</p>
            </div>
        );
    }

    if (scores.length === 0) {
        return (
            <div className="text-center py-8">
                <Trophy size={32} className="mx-auto mb-2 text-[var(--jimbo-grey)]" />
                <p className="font-pixel text-[11px] text-[var(--jimbo-grey)]">No scores yet. Be the first!</p>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {scores.map((score: any, i: number) => (
                <JimboInnerPanel key={i} className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                        <span className="font-header text-sm text-[var(--jimbo-gold)]">#{i + 1}</span>
                        <span className="font-pixel text-xs text-[var(--jimbo-grey)]">{score.player_name || 'Anonymous'}</span>
                    </div>
                    <span className="font-header text-sm text-white">{typeof score.score === 'number' ? score.score.toLocaleString() : score.score}</span>
                </JimboInnerPanel>
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
    ritualTitle,
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
    // VIEW 1: preview (arrows + compact card + Play button)
    // VIEW 2: detail  (full-width card + tabs — no arrows)
    const [viewMode, setViewMode] = useState<'preview' | 'detail'>('preview');
    const [activeTab, setActiveTab] = useState<'details' | 'strategy' | 'scores'>('details');
    const [copied, setCopied] = useState(false);
    const [slideState, setSlideState] = useState<'in' | 'out-down' | 'in-up'>('in');
    const [navDisabled, setNavDisabled] = useState(false);

    // Reset to preview when the seed changes (day navigation)
    useEffect(() => {
        setViewMode('preview');
        setActiveTab('details');
    }, [seed]);

    // JAML Filter
    const { filter } = useJamlFilter(jamlConfig || '');

    // Seed analysis (from WASM)
    const { data: analysis, loading: isAnalyzing } = useSeedAnalyzer(seed);

    const foundJokers = React.useMemo(() => {
        return analysis?.jokers || [];
    }, [analysis]);

    const foundConsumables = React.useMemo(() => {
        return analysis?.consumables || [];
    }, [analysis]);

    // Evaluation against JAML filter
    const evaluation = React.useMemo(() => {
        if (analysis && filter) {
            return evaluateSeed(analysis, filter);
        }
        return null;
    }, [analysis, filter]);

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

    // JAML rank/suit for the preview card overlay
    const jamlRank = React.useMemo((): "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "Jack" | "Queen" | "King" | "Ace" => {
        if (!filter) return 'Ace';
        const allClauses = [...(filter.must || []), ...(filter.should || [])];
        for (const clause of allClauses) {
            if (clause.rank && JAML_RANK_MAP[clause.rank]) return JAML_RANK_MAP[clause.rank];
        }
        if (objectives.includes('Wee Joker')) return '2';
        return 'Ace';
    }, [filter, objectives]);

    const jamlSuit = React.useMemo((): "Hearts" | "Clubs" | "Diamonds" | "Spades" => {
        if (!filter) return 'Hearts';
        const allClauses = [...(filter.must || []), ...(filter.should || [])];
        for (const clause of allClauses) {
            if (clause.suit && JAML_SUIT_MAP[clause.suit]) return JAML_SUIT_MAP[clause.suit];
        }
        return 'Hearts';
    }, [filter]);

    // Cartridge-pop navigation handler
    const handleNav = (direction: 'prev' | 'next') => {
        if (navDisabled) return;
        const fn = direction === 'prev' ? onPrevDay : onNextDay;
        if (!fn) return;
        setNavDisabled(true);
        setSlideState('out-down');
        setTimeout(() => {
            fn();
            setSlideState('in-up');
            setTimeout(() => {
                setSlideState('in');
                setNavDisabled(false);
            }, 250);
        }, 200);
    };

    const dn = (dayNumber || 0) < 1 ? 1 : dayNumber;

    return (
        <div className="w-full flex flex-col items-center justify-start select-none relative">
            {/* ===== DAY HEADER ===== */}
            <div className="text-center mb-2 w-full px-1">
                <div
                    className="font-header text-xl text-white tracking-wider leading-none mb-1 select-none"
                    style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}
                >
                    {ritualTitle || ritualId || 'Daily Ritual'}
                </div>
                <div className="flex justify-between items-center py-0.5 border-y border-[var(--jimbo-panel-edge)] text-[11px] font-pixel text-[var(--jimbo-grey)] tracking-[0.1em]">
                    <span>{displayDate || ''}</span>
                    <span className="text-[var(--jimbo-gold)]">No. {dn}</span>
                    <span>Est. 2026</span>
                </div>
            </div>

            {/* ===== VIEW 1: PREVIEW — arrows + compact card + Play button ===== */}
            {viewMode === 'preview' && (
                <div className="flex items-stretch justify-center gap-0 w-full" style={{ maxWidth: '375px', margin: '0 auto' }}>
                    {/* LEFT ARROW — hugs left edge */}
                    <button
                        type="button"
                        onClick={() => handleNav('prev')}
                        disabled={!canGoBack || navDisabled}
                        className="jimbo-btn jimbo-btn-red rounded-md flex items-center justify-center shrink-0 w-7 px-0 py-0"
                        aria-label="Previous Day"
                        title="Previous Day"
                    >
                        <span className="text-base select-none">&lt;</span>
                    </button>

                    {/* PREVIEW CARD — fixed 320x340 */}
                    <div
                        className={cn(
                            "flex-none",
                            slideState === 'out-down' && "animate-cartridge-out",
                            slideState === 'in-up' && "animate-cartridge-in",
                        )}
                        style={{ width: '320px' }}
                    >
                        <div className="balatro-panel flex flex-col overflow-hidden" style={{ width: '320px', height: '340px' }}>
                            {/* Top row: seed info (left 50%) | deck visual (right 50%) */}
                            <div className="flex flex-1 min-h-0 gap-2">
                                {/* Left: seed + JAML info */}
                                <div className="w-1/2 flex flex-col justify-center gap-1.5 py-2 pl-1">
                                    <div>
                                        <p className="font-pixel text-[9px] text-white/30 tracking-wider mb-1">seed</p>
                                        <h3 className="font-header text-xl text-white leading-tight truncate">{seed}</h3>
                                        <p className="font-pixel text-[9px] text-white/30 mt-0.5">
                                            {analysis?.deck || 'Erratic'} &bull; White
                                        </p>
                                    </div>
                                    {/* JAML Objectives */}
                                    {objectives.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {objectives.slice(0, 3).map((obj) => (
                                                <span
                                                    key={obj}
                                                    className="font-pixel text-[8px] bg-[var(--jimbo-red)]/30 text-[var(--jimbo-gold)] px-1.5 py-0.5 rounded leading-none"
                                                >
                                                    {obj}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {/* Featured JAML joker */}
                                    {foundJokers.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Sprite name={foundJokers[0].name} width={24} />
                                            <span className="font-pixel text-[9px] text-white/50 truncate">{foundJokers[0].name}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        disabled={isLocked}
                                        className="font-pixel text-[10px] text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        {copied ? '✓ Copied!' : '⎘ Copy Seed'}
                                    </button>
                                </div>

                                {/* Right: tilted deck back + playing card overlay */}
                                <div className="w-1/2 flex items-center justify-center relative">
                                    <div className="relative" style={{ width: 80, height: 100 }}>
                                        {/* Deck back — tilted RIGHT */}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center"
                                            style={{ transform: 'rotate(12deg)', transformOrigin: 'center' }}
                                        >
                                            <DeckSprite deck={analysis?.deck || 'Erratic'} stake="White" size={52} />
                                        </div>
                                        {/* Card face overlay — tilted LEFT, on top */}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center"
                                            style={{ transform: 'rotate(-8deg) translate(-4px, -4px)', transformOrigin: 'center', zIndex: 1 }}
                                        >
                                            <PlayingCard rank={jamlRank} suit={jamlSuit} size={52} />
                                        </div>
                                    </div>
                                    {isAnalyzing && (
                                        <div className="absolute bottom-2 right-2">
                                            <Loader2 className="animate-spin text-[var(--jimbo-gold)]" size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Blue Play button */}
                            <div className="pt-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('detail')}
                                    className="jimbo-btn jimbo-btn-blue w-full py-2 text-sm uppercase"
                                >
                                    Play No. {dn}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT ARROW — hugs right edge */}
                    <button
                        type="button"
                        onClick={() => handleNav('next')}
                        disabled={!canGoForward || navDisabled}
                        className="jimbo-btn jimbo-btn-red rounded-md flex items-center justify-center shrink-0 w-7 px-0 py-0"
                        aria-label="Next Day"
                        title="Next Day"
                    >
                        <span className="text-base select-none">&gt;</span>
                    </button>
                </div>
            )}

            {/* ===== VIEW 2: DETAIL — full-width, no arrows, tabs ===== */}
            {viewMode === 'detail' && (
                <div className="w-full" style={{ width: '320px', height: '340px', margin: '0 auto' }}>
                    <div className="balatro-panel flex flex-col h-[340px] overflow-hidden" style={{ width: '320px', height: '340px' }}>
                        {/* Seed bar */}
                        <div className="flex items-center gap-2 pb-2 border-b border-white/10 shrink-0">
                            <h3 className="font-header text-xl text-white truncate flex-1 min-w-0">{seed}</h3>
                            <span className="font-pixel text-[10px] text-white/30 shrink-0">
                                {analysis?.deck || 'Erratic'} &bull; White
                            </span>
                        </div>

                        {/* Red Tab Bar */}
                        <div className="flex w-full shrink-0 gap-1 justify-center pt-2 pb-1">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab;
                                const label = tab.charAt(0).toUpperCase() + tab.slice(1);
                                return (
                                    <div key={tab} className="relative flex flex-col items-center">
                                        {isActive && (
                                            <div className="mb-0.5 animate-jimbo-bounce">
                                                <svg width="10" height="7" viewBox="0 0 14 10" fill="var(--jimbo-red)">
                                                    <polygon points="7,10 0,0 14,0" />
                                                </svg>
                                            </div>
                                        )}
                                        {!isActive && <div className="mb-0.5 h-[7px]" />}
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(tab)}
                                            className="jimbo-tab font-header tracking-wide min-w-[72px] text-center uppercase"
                                        >
                                            {label}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="jimbo-inner-panel flex-1 min-h-0 overflow-auto">
                            {activeTab === 'details' && (
                                <div className="p-2 space-y-2">
                                    {/* JAML Objectives */}
                                    {objectives.length > 0 && (
                                        <div className="flex flex-wrap gap-1 px-1">
                                            {objectives.map((obj) => (
                                                <span
                                                    key={obj}
                                                    className="font-pixel text-[9px] bg-[var(--jimbo-red)]/30 text-[var(--jimbo-gold)] px-1.5 py-0.5 rounded leading-none"
                                                >
                                                    {obj}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Found Jokers */}
                                    {foundJokers.length > 0 && (
                                        <div>
                                            <span className="font-pixel text-[10px] text-white/40 tracking-wider px-1">Key Jokers</span>
                                            <div className="flex flex-wrap gap-1 mt-1 px-1">
                                                {foundJokers.map((j) => (
                                                    <div key={j.id} className="flex flex-col items-center gap-0.5" title={`${j.name} — Ante ${j.ante} (${j.source})`}>
                                                        <Sprite name={j.name} width={36} />
                                                        <span className="font-pixel text-[7px] text-white/40 text-center max-w-[40px] truncate">{j.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Found Consumables */}
                                    {foundConsumables.length > 0 && (
                                        <div>
                                            <span className="font-pixel text-[10px] text-white/40 tracking-wider px-1">Key Consumables</span>
                                            <div className="flex flex-wrap gap-1 mt-1 px-1">
                                                {foundConsumables.map((c) => (
                                                    <div key={c.id} className="flex flex-col items-center gap-0.5" title={`${c.name} — Ante ${c.ante} (${c.source})`}>
                                                        <Sprite name={c.name} width={36} />
                                                        <span className="font-pixel text-[7px] text-white/40 text-center max-w-[40px] truncate">{c.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Starting Deck */}
                                    <div className="flex items-center justify-between px-1">
                                        <span className="font-pixel text-[10px] text-white/40 tracking-wider">Starting Deck</span>
                                        <span className="font-pixel text-[10px] text-white/20">{analysis?.startingDeck?.length || 52} cards</span>
                                    </div>
                                    <div className="flex items-center justify-center overflow-visible">
                                        {analysis?.startingDeck ? (
                                            <DeckFan4Row
                                                cards={analysis.startingDeck}
                                                featuredRank={startingRankSummary?.rank}
                                                cardSize={44}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="animate-spin text-white/20" size={24} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'strategy' && (
                                <div className="p-2">
                                    {evaluation ? (
                                        <JamlJourneyMap evaluation={evaluation} />
                                    ) : (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="animate-spin text-white/20" size={24} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'scores' && (
                                <div className="p-2 space-y-2">
                                    <LeaderboardComponent ritualId={ritualId || 'TheDailyWee'} seed={seed} />
                                </div>
                            )}
                        </div>

                        {/* Action row + orange Back button */}
                        <div className="flex flex-col gap-2 pt-2 shrink-0">
                            <div className="flex gap-2">
                                {!isLocked && (
                                    <button
                                        onClick={onOpenSubmit}
                                        className="jimbo-btn jimbo-btn-blue flex-1 text-sm py-2 uppercase"
                                    >
                                        Submit Score
                                    </button>
                                )}
                                <button
                                    onClick={onShowHowTo}
                                    className="jimbo-btn jimbo-btn-red flex-1 text-sm py-2 uppercase"
                                >
                                    How to Play
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setViewMode('preview')}
                                className="jimbo-btn jimbo-btn-orange w-full py-2 text-sm uppercase"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
