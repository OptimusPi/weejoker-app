"use client";

import React, { useState } from 'react';
import { Sprite } from '@/components/Sprite';
import { AnalyzerSeedReview } from '@/components/AnalyzerSeedReview';
import { Play, Clipboard, Trash2 } from 'lucide-react';

export default function AnalyzerReviewPage() {
    const [input, setInput] = useState<string>('');
    const [seeds, setSeeds] = useState<string[]>([]);
    const [isReviewing, setIsReviewing] = useState(false);

    const handleLoad = () => {
        const list = input
            .split(/[\n,]+/) // Split by newline or comma
            .map(s => s.trim().toUpperCase())
            .filter(s => /^[A-Z0-9]{7,8}$/.test(s));

        if (list.length > 0) {
            setSeeds(list);
            setIsReviewing(true);
        }
    };

    const handleClear = () => {
        setInput('');
        setSeeds([]);
    };

    return (
        <div className="min-h-screen p-8 font-balatro bg-[var(--balatro-black)] relative overflow-hidden">
            {/* Background Texture/Flavor */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-dots-grid"></div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-6 bg-black/40 p-8 rounded-3xl border-2 border-[var(--balatro-gold)] shadow-2xl backdrop-blur-md">
                    <Sprite name="analyzer" width={80} className="animate-pulse" />
                    <div>
                        <h1 className="font-header text-5xl text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)] tracking-widest uppercase">
                            Curator Review
                        </h1>
                        <p className="font-pixel text-[var(--balatro-gold)] text-sm tracking-[0.2em] opacity-80 uppercase mt-1">
                            High-Performance Seed Orchestration
                        </p>
                    </div>
                </div>

                {/* Main Input Area */}
                <div className="balatro-panel p-8 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-end">
                        <label className="font-header text-2xl text-white uppercase tracking-wider">
                            Seed Batch Input
                        </label>
                        <span className="font-pixel text-[10px] text-white/30 uppercase">Supports Newlines or Commas</span>
                    </div>

                    <div className="relative group">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full h-64 bg-black/60 border-2 border-white/10 rounded-2xl p-6 font-header text-2xl text-white placeholder-white/10 focus:outline-none focus:border-[var(--balatro-gold)] transition-all resize-none uppercase tracking-[0.2em] shadow-inner"
                            placeholder="PASTE SEEDS HERE...&#10;ABCDEFGH&#10;12345678, WEESOUP"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={handleClear}
                                className="p-2 bg-red-900/40 hover:bg-red-900/60 rounded-lg text-red-500 transition-colors"
                                title="Clear Input"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleLoad}
                            disabled={!input.trim()}
                            className="flex-1 bg-[var(--balatro-red)] hover:bg-red-500 disabled:opacity-30 disabled:grayscale text-white font-header text-3xl py-6 rounded-2xl shadow-[0_6px_0_#7f1d1d] active:shadow-none active:translate-y-1.5 transition-all uppercase tracking-widest flex items-center justify-center gap-4 group"
                        >
                            <Play fill="currentColor" size={24} className="group-hover:scale-110 transition-transform" />
                            Launch Review
                        </button>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-4">
                        <Clipboard size={20} className="text-[var(--balatro-blue)] shrink-0 mt-1" />
                        <div className="font-pixel text-xs text-white/70 leading-relaxed uppercase tracking-wide">
                            <span className="text-[var(--balatro-blue)]">Pro Tip:</span> Enter as many seeds as you like. The analyzer review uses Motely SIMD WASM to pre-calculate results as you flip through the list.
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Modal Overlay */}
            {isReviewing && (
                <AnalyzerSeedReview
                    seeds={seeds}
                    onClose={() => setIsReviewing(false)}
                />
            )}
        </div>
    );
}
