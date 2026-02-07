"use client";

import React, { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { Sprite } from '../Sprite';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
 * Refactored to "One Ante Per Page" with 5-card grid.
 */
export function JamlJourneyMap({ evaluation, className, maxMatches = 50, compact = false }: JamlJourneyMapProps) {
    const [page, setPage] = useState(0);

    const groupedData = useMemo(() => {
        if (!evaluation || !evaluation.matches) return [];

        // key: ante number, value: matches
        const groups = new Map<number, typeof evaluation.matches>();

        evaluation.matches.forEach(match => {
            const list = groups.get(match.ante) || [];
            list.push(match);
            groups.set(match.ante, list);
        });

        // Convert to array of { ante: number, items: [...] } sorted by ante
        return Array.from(groups.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([ante, items]) => ({ ante, items }));

    }, [evaluation]);

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

    if (groupedData.length === 0) return null;

    // Ensure page is valid
    const safePage = Math.min(Math.max(0, page), groupedData.length - 1);
    const currentAnteGroup = groupedData[safePage];

    const canPrev = safePage > 0;
    const canNext = safePage < groupedData.length - 1;

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {/* Header / Navigation */}
            <div className="flex items-center justify-between bg-black/40 rounded-lg p-1 border border-white/5">
                <button
                    onClick={() => setPage(p => p - 1)}
                    disabled={!canPrev}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-colors"
                >
                    <ChevronLeft size={14} />
                </button>

                <div className="flex flex-col items-center">
                    <span className="font-header text-[var(--balatro-blue)] tracking-widest text-sm">
                        ANTE {currentAnteGroup.ante}
                    </span>
                    <span className="text-[8px] font-pixel uppercase text-white/40 tracking-tighter">
                        {currentAnteGroup.items.length} Items Found
                    </span>
                </div>

                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!canNext}
                    className="p-1 hover:bg-white/10 rounded disabled:opacity-20 transition-colors"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Grid Content: 5 Cards Wide (Mobile optimized) */}
            <div className="grid grid-cols-5 gap-2 p-1.5 md:p-2 bg-black/20 rounded-xl border border-white/5 min-h-[100px] md:min-h-[120px]">
                {currentAnteGroup.items.map((match, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 group/card relative">
                        {/* Source Label (Shop/Pack) */}
                        <div className="bottom-0 left-0 right-0 text-[6px] text-center font-pixel uppercase text-white/30 truncate px-0.5 pb-0.5">
                            {match.source.replace('Shop', '').replace('Pack', 'Pk').trim() || 'Shop'}
                        </div>

                        {/* Card Sprite */}
                        <div className="relative cursor-pointer transition-transform hover:scale-110 z-10">
                            <Sprite
                                name={match.item.name}
                                width={compact ? 36 : 48} // Slightly larger for grid view
                                className={cn(
                                    "drop-shadow-md",
                                    match.priority === 'mustNot' && "grayscale opacity-50"
                                )}
                            />
                            {/* Slot Indicator */}
                            {match.item.slot && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-black/80 rounded-full border border-white/20 flex items-center justify-center text-[8px] font-pixel text-[var(--balatro-gold)]">
                                    {match.item.slot}
                                </div>
                            )}
                        </div>

                        {/* Priority Dot */}
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full mt-1",
                            match.priority === 'must' ? "bg-[var(--balatro-green)] shadow-[0_0_5px_green]" :
                                match.priority === 'should' ? "bg-[var(--balatro-blue)] shadow-[0_0_5px_blue]" :
                                    "bg-[var(--balatro-red)]"
                        )} />
                    </div>
                ))}

                {/* Fill empty cells if needed for perfect grid look? Optional */}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1 mt-1">
                {groupedData.map((_, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "w-1 h-1 rounded-full transition-all",
                            idx === safePage ? "bg-white w-2" : "bg-white/20"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
