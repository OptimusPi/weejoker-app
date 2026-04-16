"use client";

import React from "react";
import { Sprite } from "./Sprite";

interface WeepochCardProps {
    onShowHowTo: () => void;
    onEnterRitual: () => void;
}

export function WeepochCard({ onShowHowTo, onEnterRitual }: WeepochCardProps) {
    return (
        <div className="balatro-panel p-3 flex flex-col items-center justify-start text-center relative h-full overflow-hidden balatro-sway min-h-[345px]">
            <div className="relative z-10 flex flex-col items-center w-full h-full">
                {/* Hero Section */}
                <div className="bg-black/20 rounded-xl p-2 border border-black/10 shadow-md mb-2 mt-1 shrink-0">
                    <Sprite name="weejoker" width={50} className="brightness-110 drop-shadow-md" />
                </div>

                <div className="mb-2 shrink-0">
                    <h3 className="font-header text-2xl text-[var(--balatro-gold)] uppercase tracking-tight drop-shadow-md">
                        WEEPOCH
                    </h3>
                    <div className="font-pixel text-[var(--balatro-blue)] text-[7px] mt-0.5 opacity-60 uppercase tracking-widest">
                        RITUAL DAY 0
                    </div>
                </div>

                {/* Simplified Patterned Credits */}
                <div className="w-full bg-black/10 border-y border-white/5 py-1.5 mb-2 shrink-0 overflow-hidden">
                    <div className="font-pixel text-white/40 text-[7px] leading-tight space-y-1 max-w-[180px] mx-auto uppercase">
                        <div className="flex justify-between border-b border-white/5 pb-0.5">
                            <span>Inspiration</span>
                            <div className="flex gap-2 text-[var(--balatro-blue)]">
                                <a href="https://daylatro.fly.dev/" target="_blank" className="hover:underline">Daylatro</a>
                                <a href="https://nytimes.com/games/wordle" target="_blank" className="hover:underline">Wordle</a>
                            </div>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-0.5">
                            <span>Curation</span>
                            <span className="text-[var(--balatro-red)]">PIFREAK</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Engine</span>
                            <a href="https://github.com/Tacodiva/Motely" target="_blank" className="text-[var(--balatro-orange)] hover:underline">Motely</a>
                        </div>
                    </div>
                </div>

                {/* Flat Action Buttons */}
                <div className="flex gap-2 w-full mt-auto mb-1 px-1 shrink-0">
                    <button
                        onClick={onShowHowTo}
                        className="flex-1 balatro-button balatro-button-blue py-3 text-[10px] uppercase leading-none"
                    >
                        How do I<br />play?
                    </button>
                    <button
                        onClick={onEnterRitual}
                        className="flex-1 balatro-button balatro-button-gold py-3 text-[10px] uppercase leading-none"
                    >
                        Enter<br />Ritual
                    </button>
                </div>
            </div>
        </div>
    );
}
