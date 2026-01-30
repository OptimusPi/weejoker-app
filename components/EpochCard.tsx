"use client";

import React from "react";

interface EpochCardProps {
    onShowHowTo: () => void;
    onGoToToday: () => void;
    title?: string;
    tagline?: string;
}

/**
 * EpochCard - The "Day 0" / Welcome Card
 * Shows before the user enters the daily ritual
 * 
 * JAZM-powered: Configuration can be driven by ritual config data
 */
export function EpochCard({ onShowHowTo, onGoToToday, title = "The Daily Wee", tagline = "A curated daily Balatro ritual" }: EpochCardProps) {
    return (
        <div className="balatro-panel p-4 flex flex-col items-center justify-center text-center relative h-full w-full overflow-hidden">

            {/* Background Glow */}
            <div className="absolute inset-0 bg-radial-gradient from-[var(--balatro-gold)]/10 to-transparent opacity-50 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full h-full justify-center gap-6">

                {/* Header - Simple title, no forced caps */}
                <div className="flex flex-col items-center gap-1">
                    <h3 className="font-header text-5xl text-[var(--balatro-gold)] tracking-tight drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                        {title}
                    </h3>
                    <div className="font-pixel text-white/60 text-sm tracking-[0.15em] mt-2">
                        {tagline}
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1 min-h-8" />

                {/* Flavor Text - no forced caps, no bold */}
                <div className="font-pixel text-white/50 text-base max-w-[300px] leading-relaxed tracking-wide">
                    Join thousands of players in today's seed challenge.
                    Compare your score with the community.
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Actions - Single prominent button */}
                <div className="flex w-full max-w-[320px] mb-6">
                    <button
                        onClick={onGoToToday}
                        className="flex-1 balatro-button balatro-button-blue py-6 text-2xl tracking-widest shadow-lg hover:brightness-110 transition-all leading-tight"
                    >
                        TODAY'S RITUAL
                    </button>
                </div>

            </div>
        </div>
    );
}
