"use client";
import React, { useState, useEffect } from 'react';
import { SearchResult } from '@/lib/api/motelyApi';
import { cn } from '@/lib/utils';
import { Loader2, ChevronRight, Copy, Check, Info } from 'lucide-react';
import { DeckSprite } from './DeckSprite';
import { analyzeSeedWasm } from '@/lib/api/motelyWasm';
import { normalizeAnalysis, AnalyzedSeed } from '@/lib/seedAnalyzer';
import { CardFan } from './CardFan';
import { SeedStrategyModal } from './SeedStrategyModal';
import { SeedSnapshotModal } from './SeedSnapshotModal';
import { Sprite } from './Sprite';
import { evaluateSeed } from '@/lib/jamlEvaluator';
import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { DeckPanel, TagsPanel, BossPanel } from './cards/SeedComponents';
import { JamlJourneyMap } from './cards/JamlJourneyMap';

interface AgnosticSeedCardProps {
    // For search results
    result?: SearchResult;
    deckSlug?: string;
    stakeSlug?: string;

    // For Daily Ritual / direct analysis
    seed?: string;
    analysis?: AnalyzedSeed | null;
    jamlConfig?: string | null;
    dayNumber?: number;
    ritualId?: string;
    isLocked?: boolean;
    onShowHowTo?: () => void;
    onOpenSubmit?: () => void;
    canSubmit?: boolean;

    className?: string;
}

export function AgnosticSeedCard({
    result,
    deckSlug,
    stakeSlug,
    seed,
    analysis: initialAnalysis,
    jamlConfig,
    dayNumber,
    ritualId,
    isLocked,
    onShowHowTo,
    onOpenSubmit,
    canSubmit,
    className
}: AgnosticSeedCardProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<AnalyzedSeed | null>(initialAnalysis || null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [showSnapshotModal, setShowSnapshotModal] = useState(false);
    const [source, setSource] = useState<'WASM' | 'API' | null>(null);

    // analysis/result is already handled above
    const { setFromJaml, filter } = useJamlFilter(jamlConfig || '');

    // Derive evaluation directly during render (modern 2026 pattern, no useEffect smell)
    const evaluation = React.useMemo(() => {
        if (analysis && filter) {
            return evaluateSeed(analysis, filter);
        } else if (result?.tallies && filter) {
            return {
                isMatch: true,
                score: result.score,
                tallies: result.tallies,
                matches: [] // Add empty matches for search-level highlights
            };
        }
        return null;
    }, [analysis, filter, result?.score, result?.seed]);

    // Auto-analyze if seed is present but analysis/result is not
    useEffect(() => {
        if (seed && !result && !analysis && !isAnalyzing && !error) {
            handleAnalyze();
        }
    }, [seed, !!result, !!analysis, isAnalyzing, !!error]);

    const displaySeed = isLocked ? "LOCKED" : (seed || result?.seed || "UNKNOWN");
    const displayScore = evaluation ? evaluation.score : (result?.score || 0);
    const isMatch = evaluation ? evaluation.isMatch : true; // Default to true if no rules

    const handleCopy = () => {
        if (isLocked) return;
        navigator.clipboard.writeText(displaySeed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAnalyze = async () => {
        if (isLocked) return;
        if (analysis) {
            setShowStrategyModal(true);
            return;
        }

        const targetSeed = displaySeed;
        if (!targetSeed || targetSeed === 'UNKNOWN') return;

        setIsAnalyzing(true);
        setError(null);
        try {
            const { analyzeSeedWasm } = await import('@/lib/api/motelyWasm');
            const { normalizeAnalysis } = await import('@/lib/seedAnalyzer');
            // Remove motelyApi import if not used elsewhere in handleAnalyze

            let rawResult = null;
            let currentSource: 'WASM' | 'API' | null = null;

            // 1. Try WASM
            try {
                console.log("Try WASM:");
                rawResult = await analyzeSeedWasm(targetSeed, deckSlug || 'erratic', stakeSlug || 'white', 1, 8);
                if (rawResult) currentSource = 'WASM';
            } catch (wasmError) {
                console.warn("WASM analysis failed:", wasmError);
            }

            // 2. Try API (Removed - WASM First!)
            /*
            if (!rawResult) {
                try {
                    rawResult = await motelyApi.analyze(targetSeed, deckSlug || 'erratic', stakeSlug || 'white');
                    if (rawResult) currentSource = 'API';
                } catch (apiError) {
                    console.error("API analysis failed:", apiError);
                }
            }
            */

            if (rawResult) {
                const data = normalizeAnalysis(rawResult);
                setAnalysis(data);
                setSource(currentSource);
                // setShowStrategyModal(true); // User requested NOT to show this by default
            } else {
                throw new Error("Analysis failed on all engines.");
            }
        } catch (err: any) {
            console.error("Manual analysis error:", err);
            setError("Analysis failed: " + (err.message || String(err)));
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={cn(
            "balatro-panel border-white/10 flex flex-col gap-3 p-4 transition-all hover:border-white/20 bg-[var(--balatro-black)] shadow-balatro relative overflow-visible",
            !isMatch && "opacity-60 grayscale-[0.3]", // Dim fail matches
            className
        )}>
            {/* Header: Seed & Basic Info */}
            <div className="flex justify-between items-center bg-black/20 -m-4 p-4 mb-2 border-b-2 border-black/40 rounded-t-xl">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0 filter drop-shadow-md">
                        <DeckSprite deck={deckSlug as any} stake={stakeSlug as any} size={42} />
                    </div>
                    <div>
                        <div
                            className={cn(
                                "font-header text-2xl text-white tracking-[0.2em] flex items-center gap-2 group transition-colors",
                                !isLocked && "cursor-pointer hover:text-[var(--balatro-gold)]"
                            )}
                            onClick={handleCopy}
                        >
                            {displaySeed}
                            {!isLocked && (copied ? <Check size={16} className="text-[var(--balatro-green)]" /> : <Copy size={14} className="opacity-20 group-hover:opacity-60" />)}
                        </div>
                        <div className="font-pixel text-[11px] text-[var(--balatro-gold)] uppercase flex gap-3 tracking-tighter items-center">
                            {!isLocked && <span>Score: {displayScore.toLocaleString()}</span>}
                            {!isMatch && !isLocked && <span className="text-[var(--balatro-red)] animate-pulse">(MISMATCH)</span>}

                            {/* Help Button Restored */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onShowHowTo?.(); }}
                                className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
                                title="How to Play"
                            >
                                <Info size={12} className="text-[var(--balatro-blue)]" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isLocked ? (
                        <div className="px-3 py-1 bg-white/5 rounded border border-white/10 font-pixel text-[10px] text-white/30 flex items-center gap-2">
                            <span>HIDDEN</span>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className={cn(
                                    "balatro-button !py-1 !px-4 text-base font-header",
                                    analysis ? "balatro-button-green" : "balatro-button-blue"
                                )}
                            >
                                {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : analysis ? 'DETAILS' : 'ANALYZE'}
                            </button>
                            {analysis && (
                                <button
                                    onClick={() => setShowSnapshotModal(true)}
                                    className="balatro-button balatro-button-gold !py-1 !px-4 text-base font-header"
                                >
                                    SNAPSHOT
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && <div className="text-[var(--balatro-red)] font-pixel text-xs bg-red-900/20 p-2 rounded border border-red-500/20">{error}</div>}

            {/* Breakdown Panel */}
            {analysis && (
                <div className="mt-2 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">

                    {/* Key Sections with Rotated Labels */}
                    <div className="flex flex-col gap-3">
                        {/* DECK */}
                        {/* DECK */}
                        <DeckPanel analysis={analysis} />

                        <div className="grid grid-cols-2 gap-3">
                            {/* TAGS */}
                            <TagsPanel analysis={analysis} />

                            {/* BOSSES */}
                            <BossPanel analysis={analysis} />
                        </div>
                    </div>

                    {/* JAML Highlights / Journey Map */}
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--balatro-gold)]"></div>
                        <div className="flex justify-between items-center mb-3 pl-1">
                            <div className="text-[var(--balatro-gold)] font-header text-[11px] uppercase tracking-widest">Ritual Journey Map</div>
                            <div className="font-pixel text-[8px] text-white/30 uppercase tracking-tighter">Seed Routing v1.0</div>
                        </div>

                        <JamlJourneyMap evaluation={evaluation} maxMatches={10} />
                    </div>
                </div>
            )}

            {!analysis && (
                <div className="flex flex-col items-center justify-center py-12 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sprite name="joker" width={48} className="grayscale" />
                    <span className="font-pixel text-[10px] uppercase mt-4 tracking-widest leading-none">Awaiting Analysis</span>
                </div>
            )}

            <div className="absolute bottom-1 right-2 pointer-events-none flex items-center gap-2">
                {source && (
                    <span className={cn(
                        "font-pixel text-[8px] px-1.5 py-0.5 rounded border uppercase",
                        source === 'WASM'
                            ? "bg-[var(--balatro-blue)]/20 border-[var(--balatro-blue)]/50 text-[var(--balatro-blue)] shadow-[0_0_5px_var(--balatro-blue)]"
                            : "bg-[var(--balatro-gold)]/20 border-[var(--balatro-gold)]/50 text-[var(--balatro-gold)]"
                    )}>
                        {source}
                    </span>
                )}
                <span className="font-pixel text-[7px] italic text-white/50 opacity-40">v1.1-MOTELY-WASM</span>
            </div>

            {showStrategyModal && analysis && (
                <SeedStrategyModal
                    analysis={analysis}
                    onClose={() => setShowStrategyModal(false)}
                />
            )}

            {showSnapshotModal && analysis && (
                <SeedSnapshotModal
                    analysis={analysis}
                    onClose={() => setShowSnapshotModal(false)}
                />
            )}
        </div>
    );
}
