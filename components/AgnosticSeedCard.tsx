"use client";

import React, { useState, useEffect } from 'react';
import { openSingleSeedContext } from '@/lib/motelyWasm';
import { normalizeAnalysis } from '@/lib/seedAnalyzer';
import { evaluateSeed, type EvaluationResult } from '@/lib/jaml/jamlEvaluator';
import { JamlFilter, parseJamlToFilter } from '@/lib/hooks/useJamlFilter';
import { cn } from '@/lib/utils';
import { DeckSprite } from './DeckSprite';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';

export interface AgnosticSeedCardProps {
    seed: string;
    /** Prefer passing a pre-parsed filter. Passing raw JAML string is a fallback. */
    jamlFilter?: JamlFilter;
    jamlConfig?: string;
    /** When provided, skips WASM re-analysis and uses this result directly. */
    result?: EvaluationResult | null;
    /** Override deck/stake derived from the JAML filter. */
    deck?: string;
    stake?: string;
    className?: string;
    onClick?: () => void;
    isLocked?: boolean;
    dayNumber?: number;
}

export function AgnosticSeedCard({
    seed,
    jamlFilter,
    jamlConfig,
    result,
    deck,
    stake,
    isLocked,
    dayNumber,
    className,
    onClick,
}: AgnosticSeedCardProps) {
    const resolvedFilter = React.useMemo(
        () => jamlFilter ?? parseJamlToFilter(jamlConfig || ''),
        [jamlFilter, jamlConfig],
    );

    const deckSlug = deck || resolvedFilter.deck || 'Erratic';
    const stakeSlug = stake || resolvedFilter.stake || 'White';

    // Only run WASM analysis when the caller hasn't already supplied a result.
    const needsAnalysis = result === undefined;
    const [loading, setLoading] = useState(needsAnalysis);
    const [evaluation, setEvaluation] = useState<EvaluationResult | null>(result ?? null);

    // When a pre-computed result flows in, use it immediately — no WASM required.
    useEffect(() => {
        if (!needsAnalysis) {
            setEvaluation(result ?? null);
            setLoading(false);
        }
    }, [result, needsAnalysis]);

    // WASM analysis only when the caller provides no result.
    // Debounced 80ms: rapid swiping skips intermediate seeds — only the seed
    // you pause on gets analyzed. WASM singleton has no startup overhead but
    // is single-threaded, so queuing 50 analyses for skipped seeds is wasteful.
    useEffect(() => {
        if (!needsAnalysis) return;
        let active = true;

        // Show loading immediately when seed changes (instant UI feedback)
        setLoading(true);
        setEvaluation(null);

        const timer = setTimeout(async () => {
            if (!active) return;
            try {
                const rawData = await openSingleSeedContext(seed, deckSlug, stakeSlug);
                const normalized = normalizeAnalysis(rawData);
                if (active) setEvaluation(evaluateSeed(normalized, resolvedFilter));
            } catch (err) {
                console.error('[AgnosticSeedCard] Analysis failed:', err);
            } finally {
                if (active) setLoading(false);
            }
        }, 80);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [seed, deckSlug, stakeSlug, resolvedFilter, needsAnalysis]);

    if (isLocked) {
        return (
            <div
                className={cn(
                    "flex flex-col items-center justify-center text-center",
                    "w-[315px] h-[340px] shrink-0",
                    "border-dashed border-[var(--jimbo-panel-edge)] bg-[var(--jimbo-panel-edge)] opacity-60 grayscale",
                    "animate-sway",
                    className
                )}
            >
                <div className="mb-4">
                    <DeckSprite deck={deckSlug} stake={stakeSlug} size={84} />
                </div>
                <h3 className="font-header text-2xl text-[var(--jimbo-grey)] tracking-widest uppercase mb-2">PREVIEW ONLY</h3>
                <p className="font-pixel text-[10px] text-white/30 max-w-[200px]">
                    This seed unlocks tomorrow. You can view the deck, but the strategy is hidden!
                </p>
                <div className="mt-6 px-3 py-1.5 bg-[#111] border border-[var(--jimbo-panel-edge)]">
                    <span className="font-header text-sm text-[var(--jimbo-gold)]">UNLOCKS DAY {dayNumber}</span>
                </div>
            </div>
        );
    }

    const primaryMatch = evaluation?.matches?.[0]?.item?.name ?? "N/A";
    const simScore = evaluation?.score?.toLocaleString() ?? "0";

    return (
        <div
            className={cn(
                "flex flex-col cursor-pointer bg-gradient-to-br from-[#1c2e27] to-[#151c19] border-y-2 border-t-[#224536] border-b-[#0b120f] shadow-lg",
                "w-[315px] h-[340px] shrink-0 p-4",
                "animate-sway relative overflow-hidden",
                className
            )}
            onClick={onClick}
        >
            {/* Header */}
            <div className="flex items-start gap-3 pb-4 border-b border-[var(--jimbo-panel-edge)]">
                <div className="animate-juice-pop">
                    <DeckSprite deck={deckSlug} stake={stakeSlug} size={64} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-header text-3xl text-white leading-tight mb-1 truncate">{seed}</h3>
                    <p className="font-pixel text-xs text-white/40 tracking-wider uppercase">
                        {deckSlug} • {stakeSlug}
                    </p>
                </div>
                {loading
                    ? <Loader2 className="animate-spin text-[var(--jimbo-gold)] shrink-0" size={28} />
                    : <Sparkles className="text-[var(--jimbo-gold)] shrink-0" size={28} />
                }
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 py-6">
                <div className="bg-[#111] p-5 border border-[var(--jimbo-panel-edge)] flex flex-col items-center justify-center">
                    <span className="block text-[11px] font-pixel text-[var(--jimbo-grey)] mb-2 uppercase">PRIMARY MATCH</span>
                    <div className="font-header text-xl text-[var(--jimbo-blue)] leading-tight text-center">
                        {primaryMatch}
                    </div>
                </div>
                <div className="bg-[#111] p-5 border border-[var(--jimbo-panel-edge)] flex flex-col items-center justify-center">
                    <span className="block text-[11px] font-pixel text-[var(--jimbo-grey)] mb-2 uppercase">SIM SCORE</span>
                    <div className="font-header text-xl text-[var(--jimbo-dark-green)] leading-tight text-center">
                        {simScore}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-4 border-t border-[var(--jimbo-panel-edge)]">
                <button className="flex items-center gap-2 font-header text-sm text-[var(--jimbo-gold)] hover:brightness-125 transition-all active:scale-95 py-2 px-3 -mr-3">
                    VIEW STRATEGY <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
