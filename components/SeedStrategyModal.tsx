"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnalyzedSeed } from '@/lib/seedAnalyzer';
import { Award, ShoppingCart, PackageOpen, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JimboPanel, JimboInnerPanel } from '@/components/JimboPanel';

interface SeedStrategyModalProps {
    analysis: AnalyzedSeed;
    onClose: () => void;
}

export function SeedStrategyModal({ analysis, onClose }: SeedStrategyModalProps) {
    const [activeAnte, setActiveAnte] = useState(1);
    const [mounted, setMounted] = useState(false);

    const maxAnte = analysis.bosses.length || 8;
    const anteData = analysis.antes?.[activeAnte];

    useEffect(() => {
        setMounted(true);
        // Prevent background scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        }
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <JimboPanel className="w-full max-w-4xl h-[90vh] flex flex-col relative !p-0 overflow-hidden" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="shrink-0 p-4 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
                    <div>
                        <div className="text-[var(--jimbo-blue)] font-header text-2xl tracking-widest drop-shadow-md uppercase">
                            SEED STRATEGY
                        </div>
                        <div className="text-[var(--jimbo-grey)] font-pixel text-xs mt-1 uppercase">
                            {analysis.seed} • {analysis.deck} • {analysis.stake}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Close"
                        aria-label="Close"
                        className="jimbo-btn jimbo-btn-red !py-1 !px-3 font-header text-xl uppercase"
                    >
                        <X size={20} className="inline-block" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Ante Navigation Sidebar */}
                    <div className="w-32 bg-[var(--jimbo-panel-edge)] overflow-y-auto custom-scrollbar flex flex-col gap-1 p-2">
                        {Array.from({ length: maxAnte }).map((_, i) => {
                            const ante = i + 1;
                            const isActive = activeAnte === ante;
                            const boss = analysis.bosses.find(b => b.ante === ante)?.boss;

                            return (
                                <button
                                    key={ante}
                                    onClick={() => setActiveAnte(ante)}
                                    className={cn(
                                        "w-full text-left px-3 py-3 rounded-lg font-header text-lg transition-all border-l-4 uppercase",
                                        isActive
                                            ? "bg-[var(--jimbo-blue)] border-[var(--jimbo-blue)] text-white"
                                            : "hover:bg-[#222] border-transparent text-[var(--jimbo-grey)]"
                                    )}
                                >
                                    <div className="text-xs font-pixel uppercase opacity-80 mb-1">Ante {ante}</div>
                                    <div className="truncate text-sm opacity-100 text-white uppercase">{boss || "???"}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Ante Analysis Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-transparent">
                        {anteData ? (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

                                {/* Boss & Voucher */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <JimboInnerPanel className="p-4 border-[var(--jimbo-red)] bg-[#411]">
                                        <div className="flex items-center gap-2 mb-2 text-[var(--jimbo-red)]">
                                            <Award size={18} />
                                            <span className="font-header text-xl uppercase">Boss Blind</span>
                                        </div>
                                        <div className="text-2xl font-header text-white tracking-wide uppercase">
                                            {anteData.boss}
                                        </div>
                                    </JimboInnerPanel>

                                    <JimboInnerPanel className="p-4 border-[var(--jimbo-orange)] bg-[#631]">
                                        <div className="flex items-center gap-2 mb-2 text-[var(--jimbo-orange)]">
                                            <Tag size={18} />
                                            <span className="font-header text-xl uppercase">Voucher</span>
                                        </div>
                                        <div className="text-2xl font-header text-white tracking-wide uppercase">
                                            {anteData.voucher || "None"}
                                        </div>
                                    </JimboInnerPanel>
                                </div>

                                {/* Tags */}
                                <div>
                                    <div className="font-pixel text-[10px] uppercase text-[var(--jimbo-grey)] mb-2 tracking-widest">Tags</div>
                                    <div className="flex gap-2 flex-wrap">
                                        {anteData.tags.map((tag, i) => (
                                            <div key={i} className="px-3 py-1 bg-[#441] border border-[var(--jimbo-gold)] rounded text-[var(--jimbo-gold)] font-pixel text-xs uppercase">
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shop Queue */}
                                <div>
                                    <div className="font-pixel text-[10px] uppercase text-[var(--jimbo-border-silver)] mb-2 tracking-widest flex items-center gap-2 uppercase">
                                        <ShoppingCart size={12} />
                                        Shop Queue
                                    </div>
                                    <JimboInnerPanel className="p-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {anteData.shopQueue.map((item, i) => (
                                            <div key={i} className={cn(
                                                "p-2 rounded border text-center transition-all hover:scale-105 cursor-default group relative",
                                                item.type === 'Joker' ? "bg-[#222] border-[var(--jimbo-red)]" :
                                                    item.type === 'Tarot' ? "bg-[#313] border-[#a5f]" :
                                                        item.type === 'Planet' ? "bg-[#124] border-[#5af]" :
                                                            item.type === 'Spectral' ? "bg-[#133] border-[#5ff]" :
                                                                "bg-[#333] border-transparent"
                                            )}>
                                                <div className="font-pixel text-[10px] text-[var(--jimbo-border-silver)] truncate uppercase">{item.name}</div>
                                                {item.edition && (
                                                    <div className={cn(
                                                        "absolute top-0 right-0 px-1 py-0.5 text-[8px] font-pixel rounded-bl bg-black/80 uppercase",
                                                        item.edition.includes('Negative') ? "text-purple-400" :
                                                            item.edition.includes('Polychrome') ? "text-pink-400" :
                                                                item.edition.includes('Holographic') ? "text-blue-400" :
                                                                    item.edition.includes('Foil') ? "text-blue-200" : "text-white"
                                                    )}>
                                                        {item.edition.replace(' Edition', '')}
                                                    </div>
                                                )}
                                                {item.type === 'Joker' && (
                                                    <div className="text-[var(--jimbo-red)] absolute top-[2px] left-[4px] text-[8px] font-pixel">J</div>
                                                )}
                                            </div>
                                        ))}
                                    </JimboInnerPanel>
                                </div>

                                {/* Packs */}
                                <div>
                                    <div className="font-pixel text-[10px] uppercase text-[var(--jimbo-border-silver)] mb-2 tracking-widest flex items-center gap-2">
                                        <PackageOpen size={12} />
                                        Packs
                                    </div>
                                    <div className="space-y-3">
                                        {anteData.packs.map((pack, i) => (
                                            <JimboInnerPanel key={i} className="p-3 bg-[#111]">
                                                <div className="font-header text-lg text-[var(--jimbo-blue)] mb-2 uppercase">{pack.name}</div>
                                                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                                                    {pack.cards.map((card, ci) => (
                                                        <div key={ci} className="shrink-0 w-24 h-32 bg-[#222] border border-transparent rounded flex items-center justify-center p-2 text-center text-xs font-pixel text-[#eee] transition-colors uppercase">
                                                            {card.name}
                                                            {card.edition && (
                                                                <div className="block mt-1 text-[8px] text-[var(--jimbo-gold)] uppercase">{card.edition}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </JimboInnerPanel>
                                        ))}
                                        {anteData.packs.length === 0 && (
                                            <div className="text-[var(--jimbo-grey)] font-pixel text-xs italic uppercase">No packs opened this ante.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Deck Draws */}
                                {(anteData as any).deckDraws && (
                                    <div>
                                        <div className="font-pixel text-[10px] uppercase text-[var(--jimbo-border-silver)] mb-2 tracking-widest flex items-center gap-2">
                                            <Award size={12} className="rotate-180" />
                                            Deck draws
                                        </div>
                                        <div className="space-y-4">
                                            {Object.entries((anteData as any).deckDraws).map(([round, cards]: [string, any]) => (
                                                <JimboInnerPanel key={round} className="p-3 bg-[#124] border-[#5af]">
                                                    <div className="font-header text-lg text-[var(--jimbo-blue)] mb-2 uppercase tracking-wider">{round} Sequence</div>
                                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                                        {cards.map((card: any, i: number) => (
                                                            <div key={i} className="shrink-0 w-16 h-24 bg-[#111] border border-transparent rounded flex flex-col items-center justify-center p-1 text-center hover:border-[var(--jimbo-blue)] transition-colors">
                                                                <div className="font-pixel text-[8px] text-[var(--jimbo-grey)] mb-1">#{i + 1}</div>
                                                                <div className="font-pixel text-[10px] text-white break-words w-full uppercase">{card.name}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </JimboInnerPanel>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-[var(--jimbo-grey)] font-header text-2xl uppercase">
                                NO DATA FOR ANTE {activeAnte}
                            </div>
                        )}
                    </div>
                </div>
            </JimboPanel>
        </div>,
        document.body
    );
}
