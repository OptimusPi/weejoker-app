"use client";
import React from 'react';
import { AnalyzedSeed } from '@/lib/seedAnalyzer';
import { Sprite } from './Sprite';
import { X, Trophy, ShoppingCart, Award, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeedSnapshotModalProps {
    analysis: AnalyzedSeed;
    onClose: () => void;
}

export function SeedSnapshotModal({ analysis, onClose }: SeedSnapshotModalProps) {
    // Process unique jokers and their counts/locations
    const uniqueJokers = React.useMemo(() => {
        const map = new Map<string, {
            name: string;
            id: string;
            count: number;
            locations: Array<{ ante: number; source: string; edition?: string }>;
            firstAnte: number;
            rarityWeight: number;
        }>();

        const JOKER_WEIGHTS: Record<string, number> = {
            "Blueprint": 100,
            "Brainstorm": 100,
            "Perkeo": 100,
            "Triboulet": 100,
            "Yorick": 100,
            "Baron": 90,
            "Mime": 90,
            "Wee Joker": 80,
            "The Duo": 70,
            "The Trio": 70,
            "The Family": 70,
            "The Order": 70,
            "The Tribe": 70,
            "Invisible Joker": 60,
        };

        analysis.jokers.forEach(j => {
            if (!map.has(j.name)) {
                map.set(j.name, {
                    name: j.name,
                    id: j.id,
                    count: 0,
                    locations: [],
                    firstAnte: j.ante,
                    rarityWeight: JOKER_WEIGHTS[j.name] || 0
                });
            }
            const data = map.get(j.name)!;
            data.count++;
            data.locations.push({ ante: j.ante, source: j.source, edition: j.edition });
            if (j.ante < data.firstAnte) data.firstAnte = j.ante;
        });

        return Array.from(map.values()).sort((a, b) => {
            if (b.rarityWeight !== a.rarityWeight) return b.rarityWeight - a.rarityWeight;
            return a.firstAnte - b.firstAnte;
        });
    }, [analysis]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/95 animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="balatro-panel w-full max-w-5xl max-h-[90vh] flex flex-col relative bg-[var(--balatro-black)] border-4 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 p-6 border-b-4 border-black/40 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="bg-[var(--balatro-gold)] p-2 rounded-lg rotate-3 shadow-lg">
                            <Hash size={32} className="text-black" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-header text-white tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] leading-none uppercase">
                                Seed Snapshot
                            </h2>
                            <p className="text-[var(--balatro-gold)] font-pixel text-sm mt-1 uppercase tracking-tighter opacity-80">
                                {analysis.seed} • {analysis.deck} Deck • {analysis.stake} Stake
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="balatro-button balatro-button-red !py-2 !px-5 font-header text-2xl"
                    >
                        CLOSE
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-black/10">

                    {/* Bosses Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="text-[var(--balatro-red)]" size={24} />
                            <h3 className="font-header text-2xl text-white uppercase tracking-wider">Boss Blinds</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {analysis.bosses.map((b, i) => (
                                <div key={i} className="balatro-panel p-2 bg-black/40 border-white/5 flex flex-col items-center group hover:scale-105 transition-transform duration-200">
                                    <div className="w-full text-center border-b border-white/10 mb-2 pb-1">
                                        <span className="font-pixel text-[10px] text-white/40 uppercase">Ante {b.ante}</span>
                                    </div>
                                    <div className="relative mb-1">
                                        <Sprite name={b.boss} width={48} className="drop-shadow-md" />
                                    </div>
                                    <span className="font-pixel text-[9px] text-white text-center leading-tight h-8 flex items-center justify-center uppercase">
                                        {b.boss}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Vouchers Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingCart className="text-[var(--balatro-orange)]" size={24} />
                            <h3 className="font-header text-2xl text-white uppercase tracking-wider">Vouchers</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {analysis.vouchers.map((v, i) => (
                                <div key={i} className="balatro-panel p-2 bg-black/40 border-white/5 flex flex-col items-center group hover:scale-105 transition-transform duration-200">
                                    <div className="w-full text-center border-b border-white/10 mb-2 pb-1">
                                        <span className="font-pixel text-[10px] text-white/40 uppercase">Ante {v.ante}</span>
                                    </div>
                                    <div className="relative mb-1">
                                        <Sprite name={v.name} width={42} className="drop-shadow-md" />
                                    </div>
                                    <span className="font-pixel text-[9px] text-white text-center leading-tight h-8 flex items-center justify-center uppercase">
                                        {v.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Jokers Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Trophy className="text-[var(--balatro-gold)]" size={24} />
                            <h3 className="font-header text-2xl text-white uppercase tracking-wider">Unique Jokers</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {uniqueJokers.map((j, i) => (
                                <div key={i} className="group relative">
                                    <div className="balatro-panel p-3 bg-black/40 border-white/10 flex flex-col items-center hover:bg-black/60 transition-all duration-200 cursor-help">
                                        <div className="relative mb-3">
                                            <Sprite name={j.name} width={71} className="drop-shadow-xl group-hover:scale-110 transition-transform duration-200" />
                                            <div className="absolute -top-2 -right-2 bg-[var(--balatro-red)] text-white font-header text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-black/40 shadow-md">
                                                {j.count}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-header text-sm text-white uppercase truncate w-full mb-1">{j.name}</div>
                                            <div className="font-pixel text-[9px] text-[var(--balatro-gold)] uppercase opacity-60">First: Ante {j.firstAnte}</div>
                                        </div>
                                    </div>

                                    {/* Tooltip on Hover */}
                                    <div className="absolute z-50 invisible group-hover:visible bg-[var(--balatro-light-black)] border-2 border-[var(--balatro-outline-light)] p-3 rounded-lg shadow-2xl w-56 -translate-y-2 left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none transition-all duration-200 animate-in zoom-in-95 fill-mode-forwards">
                                        <div className="font-header text-[var(--balatro-gold)] border-b border-white/10 pb-1 mb-2 text-center uppercase tracking-wider">{j.name}</div>
                                        <div className="space-y-1.5 font-pixel text-[10px]">
                                            <div className="flex justify-between uppercase">
                                                <span className="text-white/40">Total Count:</span>
                                                <span className="text-white">{j.count}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/5 uppercase text-white/40 text-[8px] mb-1">Found At:</div>
                                            <div className="max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                                {j.locations.map((loc, li) => (
                                                    <div key={li} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                                                        <span className="text-white/80">A{loc.ante} {loc.source.split(' ')[1] || 'Shop'}</span>
                                                        {loc.edition && <span className="text-blue-400 text-[8px] ml-1">{loc.edition.replace(' Edition', '')}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="shrink-0 p-4 border-t-2 border-white/5 bg-black/40 flex justify-center">
                    <div className="text-[var(--balatro-gold)] font-pixel text-[10px] uppercase tracking-[0.2em] animate-pulse">
                        Powered by Antigravity Engine
                    </div>
                </div>
            </div>
        </div>
    );
}
