"use client";

import React from 'react';
import { cn } from '../../lib/utils';
import { Sprite } from '../Sprite';

interface JamlJourneyMapProps {
    evaluation: {
        matches: Array<{
            ante: number;
            source: string;
            priority: 'must' | 'should' | 'mustNot';
            item: {
                name: string;
                slot?: number;
            };
        }>;
    } | null;
    className?: string;
    maxMatches?: number;
    compact?: boolean;
}

/**
 * JamlJourneyMap
 * Visualizes the JAML routing for a seed.
 */
export function JamlJourneyMap({ evaluation, className, maxMatches = 20, compact = false }: JamlJourneyMapProps) {
    if (!evaluation || !evaluation.matches || evaluation.matches.length === 0) {
        return (
            <div className={cn(
                "py-8 flex flex-col items-center justify-center opacity-30 italic font-pixel text-[10px] text-white/50 border-2 border-dashed border-white/5 rounded-lg",
                className
            )}>
                <span>No JAML Routing Available</span>
                <span className="text-[8px] mt-1 scale-75 uppercase">Verify filter or check analysis data</span>
            </div>
        );
    }

    const matches = evaluation.matches.slice(0, maxMatches);

    return (
        <div className={cn("space-y-3 relative", className)}>
            {/* Vertical Line for Journey */}
            <div className="absolute left-[34px] top-6 bottom-6 w-0.5 bg-white/5 z-0"></div>

            <div className="flex flex-col gap-4">
                {matches.map((match, i) => (
                    <div key={i} className="flex items-center gap-4 group/match relative z-10">
                        {/* Step Number / Ante */}
                        <div className="w-10 flex flex-col items-center">
                            <div className="font-header text-sm text-[var(--balatro-blue)]">A{match.ante}</div>
                            {!compact && <div className="h-4 w-px bg-white/10 my-1"></div>}
                        </div>

                        {/* Item Sprite */}
                        <div className="relative group/card cursor-pointer shrink-0">
                            <Sprite
                                name={match.item.name}
                                width={compact ? 32 : 40}
                                className={cn(
                                    "transition-transform group-hover/match:scale-110 drop-shadow-md",
                                    match.priority === 'mustNot' && "grayscale opacity-50"
                                )}
                            />
                        </div>

                        {/* Location Info */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className={cn(
                                "font-header text-white leading-tight uppercase group-hover/match:text-[var(--balatro-gold)] transition-colors",
                                compact ? "text-[11px]" : "text-[13px]"
                            )}>
                                {match.item.name}
                            </div>
                            <div className="font-pixel text-[9px] text-white/40 flex items-center gap-2 mt-0.5">
                                <span className="text-[var(--balatro-blue)]/60">{match.source.replace(/_/g, ' ')}</span>
                                {match.item.slot && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                        <span className="text-[var(--balatro-gold)]/60">Slot {match.item.slot}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* MUST/SHOULD Indicator */}
                        <div className={cn(
                            "px-1.5 py-0.5 rounded border text-[7px] font-pixel shrink-0 uppercase tracking-tighter",
                            match.priority === 'must' ? "border-[var(--balatro-green)] text-[var(--balatro-green)] bg-green-900/10" :
                                match.priority === 'should' ? "border-[var(--balatro-blue)] text-[var(--balatro-blue)] bg-blue-900/10" :
                                    "border-[var(--balatro-red)] text-[var(--balatro-red)] bg-red-900/10"
                        )}>
                            {match.priority}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
