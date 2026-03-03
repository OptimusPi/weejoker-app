"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnalyzedSeed } from '@/lib/seedAnalyzer';
import { Sprite } from './Sprite';
import { X, Trophy, ShoppingCart, Award, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JimboPanel, JimboInnerPanel } from '@/components/JimboPanel';

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

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        }
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <JimboPanel
                className="w-full max-w-5xl max-h-[90vh] flex flex-col relative !p-0 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 p-6 border-b-2 border-white/10 flex justify-between items-center bg-[#1a1a1a]">
                    <div className="flex items-center gap-4">
                        <div className="bg-[var(--jimbo-gold)] p-2 rounded-lg rotate-3 shadow-lg">
                            <Hash size={32} className="text-black" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-header text-white tracking-widest drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)] leading-none uppercase">
                                Seed Snapshot
                            </h2>
                            <p className="text-[var(--jimbo-gold)] font-pixel text-sm mt-1 uppercase tracking-tighter opacity-80">
                                {analysis.seed} • {analysis.deck} • {analysis.stake}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="jimbo-btn jimbo-btn-red !py-2 !px-5 font-header text-2xl uppercase"
                    >
                        Close
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-transparent">

                    {/* Bosses Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="text-[var(--jimbo-red)]" size={24} />
                            <h3 className="font-header text-2xl text-white uppercase tracking-wider">Boss Blinds</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {analysis.bosses.map((b, i) => (
                                <JimboInnerPanel key={i} className="p-2 flex flex-col items-center group hover:scale-105 transition-transform duration-200">
                                    <div className="w-full text-center border-b border-white/10 mb-2 pb-1">
                                        <span className="font-pixel text-[10px] text-[var(--jimbo-border-silver)] uppercase">Ante {b.ante}</span>
                                    </div>
                                    <div className="relative mb-1">
                                        <Sprite name={b.boss} width={48} className="drop-shadow-md" />
                                    </div>
                                    <span className="font-pixel text-[9px] text-white text-center leading-tight h-8 flex items-center justify-center uppercase">
                                        {b.boss}
                                    </span>
                                </JimboInnerPanel>
                            ))}
                        </div>
                    </section>

                    {/* Vouchers Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingCart className="text-[var(--jimbo-orange)]" size={24} />
                            <h3 className="font-header text-2xl text-white uppercase tracking-wider">Vouchers</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {analysis.vouchers.map((v, i) => (
                                <JimboInnerPanel key={i} className="p-2 flex flex-col items-center group hover:scale-105 transition-transform duration-200">
                                    <div className="w-full text-center border-b border-white/10 mb-2 pb-1">
                                        <span className="font-pixel text-[10px] text-[var(--jimbo-border-silver)] uppercase">Ante {v.ante}</span>
                                    </div>
                                    <div className="relative mb-1">
                                        <Sprite name={v.name} width={42} className="drop-shadow-md" />
                                    </div>
                                    <span className="font-pixel text-[9px] text-white text-center leading-tight h-8 flex items-center justify-center uppercase">
                                        {v.name}
                                    </span>
                                </JimboInnerPanel>
                            ))}
                        </div>
                    </section>

                    {/* Jokers Section */}
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Trophy className="text-[var(--jimbo-gold)]" size={24} />
                            <h3 className="font-header text-2xl text-white uppercase tracking-wider">Unique Jokers</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {uniqueJokers.map((j, i) => (
                                <div key={i} className="group relative">
                                    <JimboInnerPanel className="p-3 flex flex-col items-center hover:bg-[#333] transition-all duration-200 cursor-help">
                                        <div className="relative mb-3">
                                            <Sprite name={j.name} width={71} className="drop-shadow-xl group-hover:scale-110 transition-transform duration-200" />
                                            <div className="absolute -top-2 -right-2 bg-[var(--jimbo-red)] text-white font-header text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                                                {j.count}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="font-header text-sm text-white uppercase truncate w-full mb-1">{j.name}</div>
                                            <div className="font-pixel text-[9px] text-[var(--jimbo-gold)] uppercase opacity-60">First: Ante {j.firstAnte}</div>
                                        </div>
                                    </JimboInnerPanel>

                                    {/* Tooltip on Hover */}
                                    <div className="absolute z-50 invisible group-hover:visible bg-[var(--jimbo-dark-blue)] border-2 border-[var(--jimbo-border-silver)] p-3 rounded-lg shadow-2xl w-56 -translate-y-2 left-1/2 -translate-x-1/2 top-full mt-2 pointer-events-none transition-all duration-200 animate-in zoom-in-95 fill-mode-forwards">
                                        <div className="font-header text-[var(--jimbo-gold)] border-b border-white/10 pb-1 mb-2 text-center uppercase tracking-wider">{j.name}</div>
                                        <div className="space-y-1.5 font-pixel text-[10px]">
                                            <div className="flex justify-between uppercase">
                                                <span className="text-[var(--jimbo-border-silver)]">Total Count:</span>
                                                <span className="text-white">{j.count}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/5 uppercase text-[var(--jimbo-grey)] text-[8px] mb-1">Found At:</div>
                                            <div className="max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                                {j.locations.map((loc, li) => (
                                                    <div key={li} className="flex justify-between items-center py-0.5 border-b border-white/5 last:border-0">
                                                        <span className="text-[#eee] uppercase">A{loc.ante} {loc.source.split(' ')[1] || 'Shop'}</span>
                                                        {loc.edition && <span className="text-[var(--jimbo-blue)] text-[8px] ml-1 uppercase">{loc.edition.replace(' Edition', '')}</span>}
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
            </JimboPanel>
        </div>,
        document.body
    );
}
