"use client";

import React, { useState, useEffect } from 'react';
import { analyzeSeedWasm } from '@/lib/api/motelyWasm';
import { cn } from '@/lib/utils';
import { DeckSprite } from './DeckSprite';
import { Search, Loader2, Sparkles, ChevronRight, Calculator } from 'lucide-react';

interface AgnosticSeedCardProps {
    seed: string;
    deckSlug?: string;
    stakeSlug?: string;
    className?: string;
    onClick?: () => void;
    analysis?: any;
    dayNumber?: number;
    ritualId?: string;
    jamlConfig?: string | null;
    isLocked?: boolean;
    onShowHowTo?: () => void;
    onOpenSubmit?: () => void;
    canSubmit?: boolean;
}

export function AgnosticSeedCard({ 
    seed, 
    deckSlug = 'Erratic', 
    stakeSlug = 'White', 
    className, 
    onClick,
    analysis: propAnalysis 
}: AgnosticSeedCardProps) {
    const [loading, setLoading] = useState(false);
    const [fetchedAnalysis, setFetchedAnalysis] = useState<any>(null);

    const result = propAnalysis || fetchedAnalysis;

    const handleAnalyze = async () => {
        if (propAnalysis) return; // Skip if provided
        setLoading(true);
        try {
            const data = await analyzeSeedWasm(seed, deckSlug, stakeSlug);
            setFetchedAnalysis(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleAnalyze();
    }, [seed, deckSlug, stakeSlug, propAnalysis]);

    return (
        <div
            className={cn("balatro-panel flex flex-col gap-4 !p-6 cursor-pointer", className)}
            onClick={onClick}
        >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <DeckSprite deck={deckSlug} stake={stakeSlug} size={48} />
                    <div>
                        <h3 className="font-header text-2xl text-white leading-none mb-1">{seed}</h3>
                        <p className="font-pixel text-[11px] text-white/40 uppercase tracking-widest">{deckSlug} Deck • {stakeSlug} Stake</p>
                    </div>
                </div>
                {loading ? <Loader2 className="animate-spin text-[var(--balatro-gold)]" size={24} /> : <Sparkles className="text-[var(--balatro-gold)]" size={24} />}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    <span className="block text-[10px] font-pixel text-white/30 uppercase mb-2">Primary Match</span>
                    <div className="font-header text-lg text-[var(--balatro-blue)] uppercase">
                        {result?.matches?.[0]?.name || "N/A"}
                    </div>
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    <span className="block text-[10px] font-pixel text-white/30 uppercase mb-2">Simulated Score</span>
                    <div className="font-header text-lg text-[var(--balatro-green)] uppercase">
                        {result?.score?.toLocaleString() || "0"}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                <span className="font-pixel text-[10px] text-white/20 uppercase">v1.2.8-motely-wasm</span>
                <button className="flex items-center gap-2 font-header text-xs text-[var(--balatro-gold)] hover:brightness-125 transition-all">
                    VIEW STRATEGY <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
