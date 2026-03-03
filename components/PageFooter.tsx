"use client";

import React, { useState, useEffect } from "react";

const SUITS = ["♠️", "♥️", "♦️", "♣️"];

/**
 * PageFooter - Site-wide attribution footer
 * Shows legal disclaimer, BUY BALATRO link, and cycling suit emoji
 */
export function PageFooter() {
    const [suitIndex, setSuitIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSuitIndex((prev) => (prev + 1) % SUITS.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="w-full shrink-0 py-2 px-4 bg-black text-center font-pixel text-xs text-white/50 tracking-wider leading-relaxed select-none">
            <span className="block sm:inline">not affiliated with localthunk or playstack</span>
            <span className="hidden sm:inline"> • </span>
            <span className="block sm:inline">
                created with{" "}
                <span className="inline-block animate-pulse text-[var(--balatro-red)]">
                    {SUITS[suitIndex]}
                </span>
                {" "}for the{" "}
                <a
                    href="https://www.playbalatro.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--balatro-gold)] hover:underline"
                >
                    Balatro
                </a>
                {" "}community
            </span>
        </footer>
    );
}
