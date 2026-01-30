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
        <div className="flex flex-row items-center justify-center gap-2 w-full max-w-7xl mx-auto p-0 relative z-30 flex-1 min-h-0">
            {/* Left Nav Button */}
            <button
                onClick={onPrev}
                disabled={!canPrev}
                className="balatro-button balatro-button-red balatro-nav-button !rounded-md h-12 w-12 !p-0 flex items-center justify-center shrink-0"
                aria-label="Previous Day"
                title="Previous Day"
            >
                <ChevronLeft size={32} className="text-white" strokeWidth={3} />
            </button>

            {/* Central Stage - FLEXIBLE HEIGHT */}
            <div className="relative flex-1 z-20 flex flex-col min-w-0 balatro-nav-stage">
                {children}
            </div>

            {/* Right Nav Button */}
            <button
                onClick={onNext}
                disabled={!canNext}
                className="balatro-button balatro-button-red balatro-nav-button !rounded-md h-12 w-12 !p-0 flex items-center justify-center shrink-0"
                aria-label="Next Day"
                title="Next Day"
            >
                <ChevronRight size={32} className="text-white" strokeWidth={3} />
            </button>
        </div>
    );
}
