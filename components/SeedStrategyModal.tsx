"use client";
import React, { useState } from 'react';
import { AnalyzedSeed } from '@/lib/seedAnalyzer';
import { X, ChevronRight, ShoppingCart, PackageOpen, Award, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeedStrategyModalProps {
    analysis: AnalyzedSeed;
    onClose: () => void;
}

export function SeedStrategyModal({ analysis, onClose }: SeedStrategyModalProps) {
    const [activeAnte, setActiveAnte] = useState(1);
    const maxAnte = analysis.bosses.length || 8;
    const anteData = analysis.antes?.[activeAnte];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-200">
            <div className="balatro-panel w-full max-w-4xl h-[90vh] flex flex-col relative bg-[var(--balatro-black)] border-2 border-[var(--balatro-blue)]/50 shadow-2xl">

                {/* Header */}
                <div className="shrink-0 p-4 border-b border-white/10 flex justify-between items-center bg-[var(--balatro-light-black)]">
                    <div>
                        <div className="text-[var(--balatro-blue)] font-header text-2xl tracking-widest drop-shadow-md">
                            SEED STRATEGY
                        </div>
                        <div className="text-white/50 font-pixel text-xs mt-1">
                            {analysis.seed} • {analysis.deck} • {analysis.stake}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="balatro-button balatro-button-red !py-1 !px-3 font-header text-xl"
                    >
                        X
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Ante Navigation Sidebar */}
                    <div className="w-32 bg-black/20 border-r border-white/10 overflow-y-auto custom-scrollbar flex flex-col gap-1 p-2">
                        {Array.from({ length: maxAnte }).map((_, i) => {
                            const ante = i + 1;
                            const isActive = activeAnte === ante;
                            const boss = analysis.bosses.find(b => b.ante === ante)?.boss;

                            return (
                                <button
                                    key={ante}
                                    onClick={() => setActiveAnte(ante)}
                                    className={cn(
                                        "w-full text-left px-3 py-3 rounded-lg font-header text-lg transition-all border-l-4",
                                        isActive
                                            ? "bg-[var(--balatro-blue)]/20 border-[var(--balatro-blue)] text-white"
                                            : "hover:bg-white/5 border-transparent text-white/50"
                                    )}
                                >
                                    <div className="text-xs font-pixel uppercase opacity-50 mb-1">Ante {ante}</div>
                                    <div className="truncate text-sm opacity-80">{boss || "???"}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Ante Analysis Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black/40">
                        {anteData ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

                                {/* Boss & Voucher */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="balatro-panel p-4 bg-[var(--balatro-red)]/10 border-[var(--balatro-red)]/30">
                                        <div className="flex items-center gap-2 mb-2 text-[var(--balatro-red)]">
                                            <Award size={18} />
                                            <span className="font-header text-xl uppercase">Boss Blind</span>
                                        </div>
                                        <div className="text-2xl font-header text-white tracking-wide">
                                            {anteData.boss}
                                        </div>
                                    </div>

                                    <div className="balatro-panel p-4 bg-[var(--balatro-orange)]/10 border-[var(--balatro-orange)]/30">
                                        <div className="flex items-center gap-2 mb-2 text-[var(--balatro-orange)]">
                                            <Tag size={18} />
                                            <span className="font-header text-xl uppercase">Voucher</span>
                                        </div>
                                        <div className="text-2xl font-header text-white tracking-wide">
                                            {anteData.voucher || "None"}
                                        </div>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div>
                                    <div className="font-pixel text-[10px] uppercase text-white/40 mb-2 tracking-widest">Tags</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {anteData.tags.map((tag, i) => (
                                            <div key={i} className="px-3 py-1 bg-[var(--balatro-yellow)]/10 border border-[var(--balatro-yellow)]/30 rounded text-[var(--balatro-yellow)] font-pixel text-xs">
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shop Queue */}
                                <div>
                                    <div className="font-pixel text-[10px] uppercase text-white/40 mb-2 tracking-widest flex items-center gap-2">
                                        <ShoppingCart size={12} />
                                        Shop Queue
                                    </div>
                                    <div className="bg-black/20 rounded-lg p-3 border border-white/5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {anteData.shopQueue.map((item, i) => (
                                            <div key={i} className={cn(
                                                "p-2 rounded border text-center transition-all hover:scale-105 cursor-default group relative",
                                                item.type === 'Joker' ? "bg-[var(--balatro-light-black)] border-[var(--balatro-red)]/20" :
                                                    item.type === 'Tarot' ? "bg-purple-900/20 border-purple-500/20" :
                                                        item.type === 'Planet' ? "bg-blue-900/20 border-blue-500/20" :
                                                            item.type === 'Spectral' ? "bg-cyan-900/20 border-cyan-500/20" :
                                                                "bg-white/5 border-white/10"
                                            )}>
                                                <div className="font-pixel text-[10px] text-white/70 truncate">{item.name}</div>
                                                {item.edition && (
                                                    <div className={cn(
                                                        "absolute top-0 right-0 px-1 py-0.5 text-[8px] font-pixel rounded-bl bg-black/80",
                                                        item.edition.includes('Negative') ? "text-purple-400" :
                                                            item.edition.includes('Polychrome') ? "text-pink-400" :
                                                                item.edition.includes('Holographic') ? "text-blue-400" :
                                                                    item.edition.includes('Foil') ? "text-blue-200" : "text-white"
                                                    )}>
                                                        {item.edition.replace(' Edition', '')}
                                                    </div>
                                                )}
                                                {item.type === 'Joker' && (
                                                    <div className="text-[var(--balatro-red)]/50 absolute top-[2px] left-[4px] text-[8px] font-pixel">J</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Packs */}
                                <div>
                                    <div className="font-pixel text-[10px] uppercase text-white/40 mb-2 tracking-widest flex items-center gap-2">
                                        <PackageOpen size={12} />
                                        Packs
                                    </div>
                                    <div className="space-y-3">
                                        {anteData.packs.map((pack, i) => (
                                            <div key={i} className="balatro-panel p-3 border-white/5 bg-white/5">
                                                <div className="font-header text-lg text-[var(--balatro-blue)] mb-2">{pack.name}</div>
                                                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                                    {pack.cards.map((card, ci) => (
                                                        <div key={ci} className="shrink-0 w-24 h-32 bg-black/40 border border-white/10 rounded flex items-center justify-center p-2 text-center text-xs font-pixel text-white/80 hover:border-white/30 transition-colors">
                                                            {card.name}
                                                            {card.edition && (
                                                                <div className="block mt-1 text-[8px] text-[var(--balatro-gold)]">{card.edition}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        {anteData.packs.length === 0 && (
                                            <div className="text-white/20 font-pixel text-xs italic">No packs opened this ante.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Deck Draws */}
                                {anteData.deckDraws && (
                                    <div>
                                        <div className="font-pixel text-[10px] uppercase text-white/40 mb-2 tracking-widest flex items-center gap-2">
                                            <Award size={12} className="rotate-180" />
                                            Deck draws
                                        </div>
                                        <div className="space-y-4">
                                            {Object.entries(anteData.deckDraws).map(([round, cards]) => (
                                                <div key={round} className="balatro-panel p-3 border-[var(--balatro-blue)]/20 bg-[var(--balatro-blue)]/5">
                                                    <div className="font-header text-lg text-[var(--balatro-blue)] mb-2 uppercase tracking-wider">{round} Sequence</div>
                                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                        {cards.map((card, i) => (
                                                            <div key={i} className="shrink-0 w-16 h-24 bg-black/60 border border-white/10 rounded flex flex-col items-center justify-center p-1 text-center hover:border-[var(--balatro-blue)]/50 transition-colors">
                                                                <div className="font-pixel text-[8px] text-white/60 mb-1">#{i + 1}</div>
                                                                <div className="font-pixel text-[10px] text-white break-words w-full">{card.name}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-white/30 font-header text-2xl">
                                NO DATA FOR ANTE {activeAnte}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
