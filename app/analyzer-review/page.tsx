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
        <div className="min-h-screen p-8 text-white font-pixel bg-[#111] relative overflow-hidden">
            {/* Background Texture/Flavor */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-6 bg-[#111] p-8 rounded-sm border-2 border-[var(--jimbo-panel-edge)] shadow-2xl">
                    <Sprite name="analyzer" width={80} className="animate-pulse" />
                    <div>
                        <h1 className="font-header text-5xl text-white drop-shadow-lg tracking-widest uppercase">
                            Curator Review
                        </h1>
                        <p className="font-pixel text-[var(--jimbo-gold)] text-sm tracking-[0.2em] opacity-80 uppercase mt-1">
                            High-Performance Seed Orchestration
                        </p>
                    </div>
                </div>

                {/* Main Input Area */}
                <div className="jimbo-panel p-8 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
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
                            className="w-full h-64 jimbo-input p-6 font-header text-2xl resize-none uppercase shadow-inner"
                            placeholder="PASTE SEEDS HERE...&#10;ABCDEFGH&#10;12345678, WEESOUP"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={handleClear}
                                className="p-2 bg-[var(--jimbo-panel-edge)] hover:bg-[#111] rounded-sm text-[var(--jimbo-red)] transition-colors"
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
                            className="flex-1 jimbo-btn jimbo-btn-red !py-6 text-3xl flex items-center justify-center gap-4 group"
                        >
                            <Play fill="currentColor" size={24} className="group-hover:scale-110 transition-transform" />
                            Launch Review
                        </button>
                    </div>

                    <div className="mt-4 p-4 rounded-sm bg-[var(--jimbo-panel-edge)] border border-[#111] flex items-start gap-4">
                        <Clipboard size={20} className="text-[var(--jimbo-blue)] shrink-0 mt-1" />
                        <div className="font-pixel text-xs text-[var(--jimbo-grey)] leading-relaxed uppercase tracking-wide">
                            <span className="text-[var(--jimbo-blue)]">Pro Tip:</span> Enter as many seeds as you like. The analyzer review uses Motely SIMD WASM to pre-calculate results as you flip through the list.
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
