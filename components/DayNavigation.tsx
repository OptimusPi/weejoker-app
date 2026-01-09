"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayNavigationProps {
    onPrev: () => void;
    onNext: () => void;
    canPrev: boolean;
    canNext: boolean;
    children: React.ReactNode;
}

export function DayNavigation({ onPrev, onNext, canPrev, canNext, children }: DayNavigationProps) {
    return (
        <div className="flex flex-row items-stretch justify-center gap-2 w-full max-w-md mx-auto p-0 relative z-30 h-[460px] shrink-0">
            {/* Left Nav Button */}
            <button
                onClick={onPrev}
                disabled={!canPrev}
                className="balatro-nav-button"
            >
                <ChevronLeft size={24} className="text-white" strokeWidth={4} />
            </button>

            {/* Central Stage - FLEXIBLE HEIGHT */}
            <div className="relative flex-1 z-20 flex flex-col min-w-0 shadow-[0_4px_0_rgba(0,0,0,0.2)]">
                {children}
            </div>

            {/* Right Nav Button */}
            <button
                onClick={onNext}
                disabled={!canNext}
                className="balatro-nav-button"
            >
                <ChevronRight size={24} className="text-white" strokeWidth={4} />
            </button>
        </div>
    );
}
