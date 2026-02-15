"use client";

import React, { useState, useEffect } from 'react';
import { analyzeSeedWasm } from '@/lib/api/motelyWasm';
import { normalizeAnalysis } from '@/lib/seedAnalyzer';
import { evaluateSeed } from '@/lib/jaml/jamlEvaluator';
import { cn } from '@/lib/utils';
import { DeckSprite } from './DeckSprite';

import { Loader2, Sparkles, ChevronRight } from 'lucide-react';

interface AgnosticSeedCardProps {
    seed: string;
    deckSlug?: string;
    stakeSlug?: string;
    className?: string;
    onClick?: () => void;
    analysis?: any;
    result?: any;
    dayNumber?: number;
    ritualId?: string;
    jamlConfig?: string | null;
    isLocked?: boolean;
    onShowHowTo?: () => void;
    onOpenSubmit?: () => void;
    canSubmit?: boolean;
    filter?: any;
}

export function AgnosticSeedCard({
    seed,
    deckSlug = 'Erratic',
    stakeSlug = 'White',
    className,
    onClick,
    analysis: propAnalysis,
    result: propResult,
    filter
}: AgnosticSeedCardProps) {
    const [loading, setLoading] = useState(false);
    const [fetchedAnalysis, setFetchedAnalysis] = useState<any>(null);

    const result = propAnalysis || propResult || fetchedAnalysis;

    useEffect(() => {
        if (propAnalysis || propResult) return;

        const analyze = async () => {
            setLoading(true);
            try {
                const rawData = await analyzeSeedWasm(seed, deckSlug, stakeSlug);
                const normalized = normalizeAnalysis(rawData);

                if (filter) {
                    const evaluation = evaluateSeed(normalized, filter);
                    setFetchedAnalysis(evaluation);
                } else {
                    setFetchedAnalysis({ ...normalized, score: 0, matches: [] });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        analyze();
    }, [seed, deckSlug, stakeSlug, propAnalysis, propResult, filter]);

    return (
        <div
            className={cn("balatro-panel flex flex-col cursor-pointer", className)}
            onClick={onClick}
        >
            {/* Header - Mobile Optimized */}
            <div className="flex items-start gap-3 pb-4 border-b border-white/10">
                <DeckSprite deck={deckSlug} stake={stakeSlug} size={64} />
                <div className="flex-1 min-w-0">
                    <h3 className="font-header text-3xl text-white leading-tight mb-1 truncate">{seed}</h3>
                    <p className="font-pixel text-xs text-white/40 tracking-wider">
                        {deckSlug} • {stakeSlug}
                    </p>
                </div>
                {loading ? (
                    <Loader2 className="animate-spin text-[var(--balatro-gold)] shrink-0" size={28} />
                ) : (
                    <Sparkles className="text-[var(--balatro-gold)] shrink-0" size={28} />
                )}
            </div>

            {/* Stats Grid - Larger Touch Targets */}
            <div className="grid grid-cols-2 gap-3 py-6">
                <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                    <span className="block text-[11px] font-pixel text-white/30 mb-2">PRIMARY MATCH</span>
                    <div className="font-header text-xl text-[var(--balatro-blue)] leading-tight">
                        {result?.matches?.[0]?.name || "N/A"}
                    </div>
                </div>
                <div className="bg-black/40 rounded-xl p-5 border border-white/5">
                    <span className="block text-[11px] font-pixel text-white/30 mb-2">SIM SCORE</span>
                    <div className="font-header text-xl text-[var(--balatro-green)] leading-tight">
                        {result?.score?.toLocaleString() || "0"}
                    </div>
                </div>
            </div>

            {/* Footer - Mobile Optimized */}
            <div className="flex items-center justify-end pt-4 border-t border-white/5">
                <button className="flex items-center gap-2 font-header text-sm text-[var(--balatro-gold)] hover:brightness-125 transition-all active:scale-95 py-2 px-3 -mr-3">
                    VIEW STRATEGY <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}
