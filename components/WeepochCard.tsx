"use client";

import React from "react";
import { Sprite } from "./Sprite";

interface WeepochCardProps {
    onShowHowTo: () => void;
    onEnterRitual: () => void;
}

export function WeepochCard({ onShowHowTo, onEnterRitual }: WeepochCardProps) {
    return (
        <div className="jimbo-panel p-3 flex flex-col items-center justify-start text-center relative h-full overflow-hidden animate-sway min-h-[345px]">
            <div className="relative z-10 flex flex-col items-center w-full h-full">
                {/* Hero Section */}
                <div className="jimbo-inner-panel p-2 mb-2 mt-1 shrink-0">
                    <Sprite name="weejoker" width={50} />
                </div>

                <div className="mb-2 shrink-0">
                    <h3 className="font-header text-2xl text-[var(--jimbo-gold)] tracking-tight">
                        WEEPOCH
                    </h3>
                    <div className="font-pixel text-[var(--jimbo-blue)] text-[7px] mt-0.5 opacity-60 tracking-widest">
                        RITUAL DAY 0
                    </div>
                </div>

                {/* Credits */}
                <div className="w-full bg-[var(--jimbo-panel-edge)] border-y border-[var(--jimbo-panel-edge)] py-1.5 mb-2 shrink-0 overflow-hidden">
                    <div className="font-pixel text-[var(--jimbo-grey)] text-[7px] leading-tight space-y-1 max-w-[180px] mx-auto">
                        <div className="flex justify-between border-b border-[var(--jimbo-panel-edge)] pb-0.5">
                            <span>Inspiration</span>
                            <div className="flex gap-2 text-[var(--jimbo-blue)]">
                                <a href="https://daylatro.fly.dev/" target="_blank" rel="noopener noreferrer" className="hover:underline">Daylatro</a>
                                <a href="https://nytimes.com/games/wordle" target="_blank" rel="noopener noreferrer" className="hover:underline">Wordle</a>
                            </div>
                        </div>
                        <div className="flex justify-between border-b border-[var(--jimbo-panel-edge)] pb-0.5">
                            <span>Curation</span>
                            <span className="text-[var(--jimbo-red)]">PIFREAK</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Engine</span>
                            <a href="https://github.com/Tacodiva/Motely" target="_blank" rel="noopener noreferrer" className="text-[var(--jimbo-gold)] hover:underline">Motely</a>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full mt-auto mb-1 px-1 shrink-0">
                    <button
                        onClick={onShowHowTo}
                        className="flex-1 jimbo-btn jimbo-btn-blue py-3 text-[10px] leading-none"
                    >
                        How do I<br />play?
                    </button>
                    <button
                        onClick={onEnterRitual}
                        className="flex-1 jimbo-btn jimbo-btn-gold py-3 text-[10px] leading-none"
                    >
                        Enter<br />Ritual
                    </button>
                </div>
            </div>
        </div>
    );
}
