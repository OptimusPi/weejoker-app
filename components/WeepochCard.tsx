"use client";

import React from "react";
import { Sprite } from "./Sprite";

interface WeepochCardProps {
    onShowHowTo: () => void;
    onEnterRitual: () => void;
}

export function WeepochCard({ onShowHowTo, onEnterRitual }: WeepochCardProps) {
    return (
        <div className="balatro-panel p-6 flex flex-col items-center justify-center text-center relative h-full">
            <div className="absolute top-2 right-2 opacity-20">
                <Sprite name="weejoker" width={32} />
            </div>
            <div className="text-4xl mb-4 drop-shadow-2xl grayscale brightness-150">
                <Sprite name="weejoker" width={64} />
            </div>
            <h3 className="font-header text-3xl text-[var(--balatro-gold)] mb-2 uppercase tracking-[0.2em] drop-shadow-md">WEEPOCH (Day 0)</h3>
            <div className="w-12 h-0.5 bg-[var(--balatro-gold)]/30 mb-4" />

            <div className="font-pixel text-white/50 text-[10px] max-w-[90%] mx-auto leading-relaxed mb-6 space-y-3">
                <p>
                    Inspired in part by <a href="https://daylatro.fly.dev/" target="_blank" className="text-[var(--balatro-blue)] hover:underline">Daylatro</a> and <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" className="text-[var(--balatro-blue)] hover:underline">Wordle</a>.
                </p>
                <p>
                    Seeds curated by <span className="text-[var(--balatro-red)]">pifreak</span> using “dungmot”, “balatro seed oracle”, and “Motely”.
                </p>
                <p>
                    Motely originally by <a href="https://github.com/Tacodiva/Motely" target="_blank" className="text-[var(--balatro-orange)] hover:underline">tacodiva</a>.
                </p>
            </div>

            {/* Action Buttons for Intro Card */}
            <div className="flex gap-2 w-full mt-auto">
                <button
                    onClick={onShowHowTo}
                    className="flex-1 balatro-button balatro-button-blue text-[10px] py-3 leading-tight uppercase"
                >
                    How do I<br />play?
                </button>
                <button
                    onClick={onEnterRitual}
                    className="flex-1 balatro-button balatro-button-gold text-[10px] py-3 leading-tight uppercase"
                >
                    Enter<br />Ritual
                </button>
            </div>
        </div>
    );
}
