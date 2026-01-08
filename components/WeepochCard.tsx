"use client";

import React from "react";
import { Sprite } from "./Sprite";

interface WeepochCardProps {
    onShowHowTo: () => void;
    onEnterRitual: () => void;
}

export function WeepochCard({ onShowHowTo, onEnterRitual }: WeepochCardProps) {
    return (
        <div className="balatro-panel p-6 flex flex-col items-center justify-start text-center relative h-full overflow-hidden">
            {/* Flat Tactile Background */}
            <div className="absolute inset-0 bg-[var(--balatro-modal-grey)] opacity-100 z-0 border-2 border-black/40" />

            <div className="relative z-10 flex flex-col items-center w-full h-full pt-4">
                {/* Lo-Fi Hero Section */}
                <div className="relative mb-6 juice-pop flex flex-col items-center">
                    <div className="bg-black/20 rounded-xl p-4 border-2 border-black/10 shadow-[4px_4px_0_rgba(0,0,0,0.1)] mb-4">
                        <Sprite name="weejoker" width={80} className="brightness-110 drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]" />
                    </div>
                </div>

                {/* Lo-Fi Header */}
                <div className="mb-6">
                    <h3 className="font-header text-4xl text-[var(--balatro-gold)] uppercase tracking-normal drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
                        WEEPOCH
                    </h3>
                    <div className="font-pixel text-[var(--balatro-blue)] text-[10px] mt-1 opacity-60 uppercase tracking-widest">
                        RITUAL DAY 0
                    </div>
                </div>

                {/* Simple Patterned Credits */}
                <div className="w-full bg-black/10 border-t-2 border-b-2 border-black/10 py-2 mb-4 shrink-0">
                    <div className="font-pixel text-white/40 text-[8px] leading-tight space-y-2 max-w-[220px] mx-auto">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-white/20 uppercase">Inspiration</span>
                            <div className="flex gap-2">
                                <a href="https://daylatro.fly.dev/" target="_blank" className="text-[var(--balatro-blue)] hover:underline">Daylatro</a>
                                <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" className="text-[var(--balatro-blue)] hover:underline">Wordle</a>
                            </div>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-white/20 uppercase">Curation</span>
                            <span className="text-[var(--balatro-red)]">PIFREAK</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/20 uppercase">Engine</span>
                            <a href="https://github.com/Tacodiva/Motely" target="_blank" className="text-[var(--balatro-orange)] hover:underline">Motely</a>
                        </div>
                    </div>
                </div>

                {/* Flat Action Buttons */}
                <div className="flex gap-3 w-full shrink-0">
                    <button
                        onClick={onShowHowTo}
                        className="flex-1 balatro-button balatro-button-blue py-2.5 border-2 border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.2)] text-[10px] uppercase"
                    >
                        How do I<br />play?
                    </button>
                    <button
                        onClick={onEnterRitual}
                        className="flex-1 balatro-button balatro-button-gold py-2.5 border-2 border-black/20 shadow-[2px_2px_0_rgba(0,0,0,0.2)] text-[10px] uppercase"
                    >
                        Enter<br />Ritual
                    </button>
                </div>
            </div>
        </div>
    );
}
