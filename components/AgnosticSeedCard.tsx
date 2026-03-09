"use client";

import React, { useState, useEffect } from 'react';
import { analyzeSeedWasm } from '@/lib/api/motelyWasm';
import { normalizeAnalysis } from '@/lib/seedAnalyzer';
import { evaluateSeed } from '@/lib/jaml/jamlEvaluator';
import { JamlFilter } from '@/lib/hooks/useJamlFilter';
import { cn } from '@/lib/utils';
import { DeckSprite } from './DeckSprite';
import { Loader2, Sparkles, ChevronRight } from 'lucide-react';

interface AgnosticSeedCardProps {
    seed: string;
    jamlFilter: JamlFilter;
    className?: string;
    onClick?: () => void;
    isLocked?: boolean;
    dayNumber?: number;
}

export function AgnosticSeedCard({
    seed,
    jamlFilter,
    isLocked,
    dayNumber,
    className,
    onClick,
}: AgnosticSeedCardProps) {
    const deckSlug = jamlFilter.deck || 'Erratic';
    const stakeSlug = jamlFilter.stake || 'White';

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    useEffect(() => {
        let active = true;
        const analyze = async () => {
            setLoading(true);
            try {
                const rawData = await analyzeSeedWasm(seed, deckSlug, stakeSlug);
                const normalized = normalizeAnalysis(rawData);
                if (active) {
                    const evaluation = evaluateSeed(normalized, jamlFilter);
                    setResult(evaluation);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (active) setLoading(false);
            }
        };
        analyze();
        return () => { active = false; };
    }, [seed, deckSlug, stakeSlug, jamlFilter]);

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
                {loading ? (
                    <Loader2 className="animate-spin text-[var(--jimbo-gold)] shrink-0" size={28} />
                ) : (
                    <Sparkles className="text-[var(--jimbo-gold)] shrink-0" size={28} />
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 py-6">
                <div className="bg-[#111] p-5 border border-[var(--jimbo-panel-edge)] flex flex-col items-center justify-center">
                    <span className="block text-[11px] font-pixel text-[var(--jimbo-grey)] mb-2 uppercase">PRIMARY MATCH</span>
                    <div className="font-header text-xl text-[var(--jimbo-blue)] leading-tight text-center">
                        {result?.matches?.[0]?.item?.name || result?.matches?.[0]?.name || "N/A"}
                    </div>
                </div>
                <div className="bg-[#111] p-5 border border-[var(--jimbo-panel-edge)] flex flex-col items-center justify-center">
                    <span className="block text-[11px] font-pixel text-[var(--jimbo-grey)] mb-2 uppercase">SIM SCORE</span>
                    <div className="font-header text-xl text-[var(--jimbo-dark-green)] leading-tight text-center">
                        {result?.score?.toLocaleString() || "0"}
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
