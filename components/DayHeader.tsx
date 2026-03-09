"use client";

import React from "react";
import { ritualConfig } from "@/lib/config";

interface DayHeaderProps {
    dayNumber: number;
    displayDate: string;
    title?: string;
}

export function DayHeader({ dayNumber, displayDate, title = ritualConfig.title }: DayHeaderProps) {
    return (
        <div className="flex-shrink-0 w-full flex items-center justify-center pt-0 min-h-0 overflow-hidden">
            <div className="text-center w-full relative z-20 px-2 md:px-4">
                <div className="font-header font-normal text-xl md:text-3xl text-white tracking-wider leading-none mb-1 select-none balatro-text-shadow-hard">
                    {title}
                </div>
                <div className="w-full max-w-xs md:max-w-sm mx-auto flex flex-col gap-0.5 md:gap-1">
                    <div className="flex justify-between items-center py-0.5 md:py-1 border-y border-white/10 text-[11px] md:text-[13px] font-pixel text-white/40 tracking-[0.1em] md:tracking-[0.2em]">
                        <span>{displayDate}</span>
                        <span className="text-[var(--balatro-gold)]">No. {dayNumber < 1 ? 1 : dayNumber}</span>
                        <span>Est. 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
