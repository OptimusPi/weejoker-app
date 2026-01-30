"use client";

import React, { useState } from 'react';
import { AgnosticSeedCard } from '@/components/AgnosticSeedCard';
import { Sprite } from '@/components/Sprite';

export default function SeedViewerPage() {
    const [input, setInput] = useState<string>('');
    const [seeds, setSeeds] = useState<string[]>([]);

    const handleLoad = () => {
        const seedList = input
            .split('\n')
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0);
        setSeeds(seedList);
    };

    return (
        <div className="min-h-screen p-8 font-balatro">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 bg-black/40 p-6 rounded-2xl border-2 border-[var(--balatro-blue)] shadow-xl backdrop-blur-sm">
                    <Sprite name="joker" width={64} className="animate-bounce-slow" />
                    <div>
                        <h1 className="font-header text-4xl text-white drop-shadow-[0_2px_0_rgba(0,0,0,1)] tracking-widest uppercase">
                            Seed Viewer
                        </h1>
                        <p className="font-pixel text-[var(--balatro-blue)] text-sm tracking-widest opacity-80 uppercase">
                            Analyzer & Shop Item Debugger
                        </p>
                    </div>
                </div>

                {/* Input Section */}
                <div className="bg-black/20 p-6 rounded-2xl border-2 border-white/10 backdrop-blur-sm">
                    <label className="block font-header text-xl text-[var(--balatro-gold)] mb-2 uppercase tracking-wider">
                        Enter Seeds (One per line)
                    </label>
                    <div className="flex gap-4 items-start">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 h-32 bg-black/60 border-2 border-white/20 rounded-xl p-4 font-pixel text-lg text-white placeholder-white/20 focus:outline-none focus:border-[var(--balatro-blue)] transition-colors resize-none uppercase tracking-widest"
                            placeholder="12345678&#10;ABCDEFGH&#10;WEESOUP"
                        />
                        <button
                            onClick={handleLoad}
                            className="h-32 px-8 bg-[var(--balatro-blue)] hover:bg-blue-600 text-white font-header text-2xl rounded-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all uppercase tracking-widest shadow-lg"
                        >
                            Load
                            <br />
                            Seeds
                        </button>
                    </div>
                </div>

                {/* Grid Display */}
                {seeds.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {seeds.map((seed, idx) => (
                            <AgnosticSeedCard
                                key={`${seed}-${idx}`}
                                seed={seed}
                                className="w-full"
                                // Default props for testing
                                deckSlug="red_deck"
                                stakeSlug="white_stake"
                            />
                        ))}
                    </div>
                )}

                {seeds.length === 0 && (
                    <div className="text-center opacity-30 py-20">
                        <p className="font-header text-2xl text-white uppercase tracking-widest">No Seeds Loaded</p>
                    </div>
                )}
            </div>
        </div>
    );
}
