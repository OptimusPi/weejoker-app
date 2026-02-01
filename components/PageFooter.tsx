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
        }, 1500); // Cycle every 1.5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-50 py-2 px-4 bg-black backdrop-blur-sm">
            <p className="text-center text-white text-sm font-pixel tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Not affiliated with LocalThunk or PlayStack •{" "}
                <a
                    href="https://store.steampowered.com/app/2379780/Balatro/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--balatro-gold)] hover:underline"
                >
                    BUY BALATRO
                </a>
                {" "}• Created with{" "}
                <span className="inline-block animate-pulse text-[var(--balatro-red)]">
                    {SUITS[suitIndex]}
                </span>
                {" "}for the Balatro community
            </p>
        </footer>
    );
}
