"use client";
import React, { useState, useEffect } from 'react';
import { SearchResult } from '@/lib/api/motelyApi';
import { cn } from '@/lib/utils';
import { Loader2, ChevronRight, Copy, Check, Info } from 'lucide-react';
import { DeckSprite } from './DeckSprite';
import { AnalyzedSeed } from '@/lib/seedAnalyzer';
import { CardFan } from './CardFan';
import { SeedStrategyModal } from './SeedStrategyModal';
import { SeedSnapshotModal } from './SeedSnapshotModal';
import { Sprite } from './Sprite';
import { evaluateSeed } from '@/lib/jamlEvaluator';
import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { DeckPanel, TagsPanel, BossPanel } from './cards/SeedComponents';

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

    // JAML Evaluation State
    const [evaluation, setEvaluation] = useState<any>(null); // TODO: Type this properly
    const { setFromJaml, filter } = useJamlFilter(jamlConfig || '');

    // Sync analysis prop if it changes
    useEffect(() => {
        if (initialAnalysis) {
            setAnalysis(initialAnalysis);
            if (jamlConfig) {
                // Run evaluation immediately if we have both data and rules
                // Note: filter is async/state based in useJamlFilter, might need to ensure it's ready.
                // Actually parsing on the fly is safer for this stateless component.
                // We'll trust the hook to parse jamlConfig into `filter`.
            }
        }
    }, [initialAnalysis, jamlConfig]);

    // Recalculate evaluation when analysis or filter changes
    useEffect(() => {
        if (analysis && filter) {
            const evalResult = evaluateSeed(analysis, filter);
            setEvaluation(evalResult);
        }
    }, [analysis, filter]);

    const displaySeed = seed || result?.seed || "UNKNOWN";
    const displayScore = evaluation ? evaluation.score : (result?.score || 0);
    const isMatch = evaluation ? evaluation.isMatch : true; // Default to true if no rules

    const handleCopy = () => {
        navigator.clipboard.writeText(displaySeed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAnalyze = async () => {
        if (analysis) {
            setShowStrategyModal(true);
            return;
        }

        const targetSeed = displaySeed;
        if (!targetSeed || targetSeed === 'UNKNOWN') return;

        setIsAnalyzing(true);
        setError(null);
        try {
            // Wait a tiny bit for UI
            await new Promise(r => setTimeout(r, 50));

            // Call our TS analyzer
            const result = (window as any).analyzeSeed ? (window as any).analyzeSeed(targetSeed) : null;

            // Note: Since analyzeSeed is a library function, we might need to import it or ensure it's available.
            // Actually, we imported it at the top of the file!
            const { analyzeSeed } = await import('@/lib/seedAnalyzer');
            const data = analyzeSeed(targetSeed, deckSlug || 'erratic', stakeSlug || 'white', 8);

            setAnalysis(data);
            setShowStrategyModal(true);
        } catch (err: any) {
            console.error("Local analysis error:", err);
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
                            className="font-header text-2xl text-white tracking-[0.2em] cursor-pointer hover:text-[var(--balatro-gold)] flex items-center gap-2 group transition-colors"
                            onClick={handleCopy}
                        >
                            {displaySeed}
                            {copied ? <Check size={16} className="text-[var(--balatro-green)]" /> : <Copy size={14} className="opacity-20 group-hover:opacity-60" />}
                        </div>
                        <div className="font-pixel text-[11px] text-[var(--balatro-gold)] uppercase flex gap-3 tracking-tighter items-center">
                            <span>Score: {displayScore.toLocaleString()}</span>
                            {!isMatch && <span className="text-[var(--balatro-red)] animate-pulse">(MISMATCH)</span>}

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
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className={cn(
                            "balatro-button !py-1 !px-4 text-xs font-header",
                            analysis ? "balatro-button-green" : "balatro-button-blue"
                        )}
                    >
                        {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : analysis ? 'DETAILS' : 'ANALYZE'}
                    </button>
                    {analysis && (
                        <button
                            onClick={() => setShowSnapshotModal(true)}
                            className="balatro-button balatro-button-gold !py-1 !px-4 text-xs font-header"
                        >
                            SNAPSHOT
                        </button>
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

                    {/* JAML Highlights / Recommendations */}
                    <div className="p-3 rounded-lg bg-black/30 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[var(--balatro-blue)]"></div>
                        <div className="text-[var(--balatro-blue)] font-header text-[11px] uppercase mb-2 tracking-widest pl-1">Strategic Findings</div>

                        <div className="space-y-2">
                            {evaluation?.matches?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {evaluation.matches.slice(0, 8).map((match: any, i: number) => (
                                        <div key={i} className="relative group/card cursor-pointer">
                                            <Sprite
                                                name={match.item.name}
                                                width={48}
                                                className={cn(
                                                    "transition-transform hover:scale-110 drop-shadow-md",
                                                    match.priority === 'mustNot' && "grayscale opacity-50"
                                                )}
                                            />
                                            {/* Ante Badge */}
                                            <div className="absolute -top-1.5 -right-1.5 bg-black/80 text-white font-pixel text-[8px] w-4 h-4 flex items-center justify-center rounded-sm border border-white/20 shadow-sm z-10">
                                                A{match.ante}
                                            </div>
                                            {/* Name Tooltip (simple) */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-[9px] font-pixel whitespace-nowrap rounded border border-white/10 opacity-0 group-hover/card:opacity-100 pointer-events-none z-20 transition-opacity">
                                                {match.item.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {analysis.jokers.filter(j => j.ante <= 4).slice(0, 8).map((j, i) => (
                                        <div key={i} className="relative group/card cursor-pointer">
                                            <Sprite
                                                name={j.name}
                                                width={48}
                                                className="transition-transform hover:scale-110 drop-shadow-md"
                                                edition={j.edition as any}
                                            />
                                            {/* Ante Badge */}
                                            <div className="absolute -top-1.5 -right-1.5 bg-black/80 text-white font-pixel text-[8px] w-4 h-4 flex items-center justify-center rounded-sm border border-white/20 shadow-sm z-10">
                                                A{j.ante}
                                            </div>
                                            {/* Name Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-[9px] font-pixel whitespace-nowrap rounded border border-white/10 opacity-0 group-hover/card:opacity-100 pointer-events-none z-20 transition-opacity">
                                                {j.name}
                                                {j.edition && <span className="text-[var(--balatro-gold)] ml-1">({j.edition})</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {!analysis && (
                <div className="flex flex-col items-center justify-center py-12 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sprite name="joker" width={48} className="grayscale" />
                    <span className="font-pixel text-[10px] uppercase mt-4 tracking-widest leading-none">Awaiting Analysis</span>
                </div>
            )}

            <div className="absolute bottom-1 right-2 pointer-events-none opacity-20">
                <span className="font-pixel text-[7px] italic text-white/50">v1.0-TS-BLUEPRINT</span>
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
