"use client";

import React from "react";

interface DayHeaderProps {
    dayNumber: number;
    displayDate: string;
    theme: {
        name: string;
        color: string;
        icon: string;
    };
}

export function DayHeader({ dayNumber, displayDate, theme }: DayHeaderProps) {
    return (
        <div className="flex-shrink-0 w-full flex items-center justify-center p-0.5 min-h-0 overflow-hidden">
            <div className="text-center w-full relative z-20 px-4">
                <div className="font-header font-normal text-2xl sm:text-3xl text-white tracking-wider uppercase leading-none mb-1 select-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                    THE DAILY WEE
                </div>
                <div className="w-full max-w-sm mx-auto flex flex-col gap-1">
                    <div className="flex justify-between items-center py-0.5 border-y border-white/10 text-[8px] font-pixel text-white/40 uppercase tracking-[0.2em]">
                        <span>{displayDate}</span>
                        <span className="text-[var(--balatro-gold)] font-bold">NO. {dayNumber < 1 ? 1 : dayNumber}</span>
                        <span>Est. 2025</span>
                    </div>
                    {/* Theme Badge */}
                    <div
                        className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-header tracking-widest self-center shadow-lg"
                        style={{ backgroundColor: theme.color, color: 'white' }}
                    >
                        <span className="drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">{theme.icon}</span>
                        <span className="mt-[2px] drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">{theme.name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
