"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, List, Play } from 'lucide-react';
import { AgnosticSeedCard } from './AgnosticSeedCard';
import { cn } from '@/lib/utils';

interface AnalyzerSeedReviewProps {
    seeds: string[];
    initialIndex?: number;
    onClose: () => void;
    jamlConfig?: string;
}

export function AnalyzerSeedReview({ seeds, initialIndex = 0, onClose, jamlConfig }: AnalyzerSeedReviewProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [showList, setShowList] = useState(false);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex(prev => (prev < seeds.length - 1 ? prev + 1 : prev));
    }, [seeds.length]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrev, handleNext, onClose]);

    const currentSeed = seeds[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--jimbo-panel-edge)] bg-[var(--jimbo-panel-edge)]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-sm transition-colors text-[var(--jimbo-grey)] hover:text-white"
                        title="Close Review"
                    >
                        <X size={24} />
                    </button>
                    <div>
                        <h2 className="font-header text-xl text-white tracking-widest uppercase mb-1">Analyzer Review</h2>
                        <p className="font-pixel text-[10px] text-[var(--jimbo-gold)] uppercase tracking-tighter">
                            Seed {currentIndex + 1} of {seeds.length}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowList(!showList)}
                        className={cn(
                            "jimbo-btn !py-1 !px-4 !text-[10px] flex items-center gap-2",
                            showList ? "jimbo-btn-gold" : "jimbo-btn-blue"
                        )}
                    >
                        <List size={14} />
                        LIST
                    </button>

                    <div className="flex bg-[#111] border border-[var(--jimbo-panel-edge)] p-1 ml-4 gap-1">
                        <button
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="p-2 disabled:opacity-20 hover:text-[var(--jimbo-red)] transition-colors text-[var(--jimbo-grey)]"
                            title="Previous Seed"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="w-px bg-[var(--jimbo-panel-edge)] my-1"></div>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === seeds.length - 1}
                            className="p-2 disabled:opacity-20 hover:text-[var(--jimbo-red)] transition-colors text-[var(--jimbo-grey)]"
                            title="Next Seed"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Side List Panel */}
                <div className={cn(
                    "w-80 border-r border-[var(--jimbo-panel-edge)] bg-[var(--jimbo-panel-edge)] flex flex-col transition-all duration-300 absolute md:relative h-full z-10",
                    showList ? "translate-x-0" : "-translate-x-full md:-ml-80"
                )}>
                    <div className="p-4 border-b border-[var(--jimbo-panel-edge)] font-header text-xs text-[var(--jimbo-grey)] uppercase tracking-widest">
                        Seed Queue
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {seeds.map((seed, idx) => (
                            <button
                                key={`${seed}-${idx}`}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "w-full p-3 text-left transition-all flex items-center justify-between group border border-transparent",
                                    currentIndex === idx
                                        ? "bg-[var(--jimbo-red)] shadow-lg translate-x-1 border-white/20"
                                        : "hover:bg-white/5 opacity-60 hover:opacity-100"
                                )}
                            >
                                <span className="font-header text-sm text-white tracking-widest">{seed}</span>
                                <span className="font-pixel text-[8px] text-white/30 group-hover:text-white/60">#{idx + 1}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Review Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex justify-center items-start">
                    <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300" key={currentSeed}>
                        <AgnosticSeedCard
                            seed={currentSeed}
                            jamlConfig={jamlConfig}
                            className="w-full !max-w-none !shadow-2xl"
                        />

                        {/* Keyboard Tip */}
                        <div className="mt-8 flex justify-center gap-8 font-pixel text-[10px] text-[var(--jimbo-grey)] uppercase tracking-widest">
                            <span className="flex items-center gap-2"><div className="px-1 border border-[var(--jimbo-panel-edge)] rounded-sm">←</div> Prev</span>
                            <span className="flex items-center gap-2"><div className="px-1 border border-[var(--jimbo-panel-edge)] rounded-sm">→</div> Next</span>
                            <span className="flex items-center gap-2"><div className="px-1 border border-[var(--jimbo-panel-edge)] rounded-sm">ESC</div> Close</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
