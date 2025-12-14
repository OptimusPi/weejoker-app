'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import dailySeeds from '@/lib/dailySeeds.json';

// Epoch: Dec 14 2025 UTC (Day 1 of Content - Launch Day)
const WEEJOKER_EPOCH_MS = Date.UTC(2025, 11, 14);

const JAML_ACRONYMS = [
    "Jimbo's Absolutely Magnificent Loot",
    "Joker Acquisition & Management Ledger",
    "Just Add More Legendaries",
    "Jackpot Amplification Multiplier Language",
    "Jester's Algorithmic Money Laundering",
    "Justice Against Mime Lovers",
    "Jimbo Appreciates My Loyalty",
    "Jokers Are My Life",
    "Juiced Aces, Maximum Luck"
];

function getWeeJokerDay(date: Date = new Date()): number {
    const todayUTC = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate()
    );
    // If Dec 13 is Day 1, then difference 0 means Day 1.
    return Math.floor((todayUTC - WEEJOKER_EPOCH_MS) / (24 * 60 * 60 * 1000)) + 1;
}

const getDailySeed = (dayNumber: number) => {
    // dayNumber 1 = index 0
    if (dayNumber < 1) return null; // JAML Territory
    const index = (dayNumber - 1) % dailySeeds.length;
    return dailySeeds[index] || dailySeeds[0];
};

export default function DailyWeePage() {
    const [currentDay, setCurrentDay] = useState(1); // Defaults to 1 until client hydration
    const [viewOffset, setViewOffset] = useState(0); // 0 = Today, 1 = Tomorrow, -1 = Yesterday
    const [jamlText, setJamlText] = useState(JAML_ACRONYMS[0]);
    const [seed, setSeed] = useState<any>(dailySeeds[0]);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");

    // Initialize Day
    useEffect(() => {
        const today = getWeeJokerDay();
        setCurrentDay(today);
    }, []);

    // Update View Data
    const viewDay = currentDay + viewOffset;
    const isFuture = viewOffset > 0;
    const isJaml = viewDay < 1; // "Day 0" or prior

    useEffect(() => {
        if (isFuture) {
            // Countdown Logic
            const timer = setInterval(() => {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setUTCDate(now.getUTCDate() + 1);
                tomorrow.setUTCHours(0, 0, 0, 0);
                const diff = tomorrow.getTime() - now.getTime();

                const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
                setTimeLeft(`${h}:${m}:${s}`);
            }, 1000);
            return () => clearInterval(timer);
        } else if (isJaml) {
            // JAML Randomizer
            const random = JAML_ACRONYMS[Math.floor(Math.random() * JAML_ACRONYMS.length)];
            setJamlText(random);
        } else {
            // Seed Loading
            setSeed(getDailySeed(viewDay));
        }
    }, [viewDay, isFuture, isJaml]);

    const copyToClipboard = () => {
        if (isFuture || isJaml) return;
        navigator.clipboard.writeText(seed.seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">

            {/* Header / Navigation */}
            <div className="text-center space-y-2 relative z-10 w-full max-w-2xl flex flex-col items-center">
                <div className="flex items-center justify-between w-full px-4">
                    <button
                        onClick={() => setViewOffset(o => o - 1)}
                        className="p-2 hover:text-balatro-blue transition-colors disabled:opacity-30 text-white/50"
                        disabled={viewDay <= 0} // Stop at Day 0 (JAML)
                    >
                        <ChevronLeft size={48} />
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="inline-block bg-black/40 px-4 py-1 rounded-full border border-white/10 backdrop-blur-sm mb-2">
                            <span className="text-lg text-balatro-blue uppercase tracking-widest text-shadow">
                                {isJaml ? "LEGACY ARCHIVE" : isFuture ? "COMING SOON" : "High Score Challenge"}
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl text-white font-header drop-shadow-[4px_4px_0_black] tracking-wide">
                            {isJaml ? "THE SOURCE" : "THE DAILY WEE"}
                        </h1>
                        <p className="text-xl text-balatro-gold uppercase tracking-wider text-shadow">
                            {isJaml ? "???" : isFuture ? "TOMORROW" : `#${viewDay} • ${new Date().toLocaleDateString()}`}
                        </p>
                    </div>

                    <button
                        onClick={() => setViewOffset(o => o + 1)}
                        className="p-2 hover:text-balatro-blue transition-colors disabled:opacity-30 text-white/50"
                        disabled={isFuture} // Only show 1 future card
                    >
                        <ChevronRight size={48} />
                    </button>
                </div>
            </div>

            {/* THE CARD */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={viewDay}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative group cursor-pointer perspective-1000"
                    onClick={copyToClipboard}
                >
                    {/* Render different cards based on State */}

                    {/* 1. FUTURE CARD (TEASER) */}
                    {isFuture && (
                        <div className="relative w-[340px] md:w-[400px] aspect-[2.5/3.5] bg-[#334155] rounded-xl border-[6px] border-white/20 shadow-[12px_12px_0_rgba(0,0,0,0.4)] flex flex-col items-center p-4 overflow-hidden opacity-90 grayscale-[0.3]">
                            {/* Overlay Countdown */}
                            <div className="absolute inset-0 z-20 bg-black/60 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                <Clock size={48} className="text-balatro-blue mb-2 animate-pulse" />
                                <span className="font-header text-5xl text-white tracking-widest">{timeLeft}</span>
                                <span className="text-balatro-gold/80 text-sm mt-2 uppercase tracking-widest">Unlocks at Midnight UTC</span>
                            </div>

                            {/* Inner Pattern (Dimmed) */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

                            {/* Badges (VISIBLE) */}
                            <div className="absolute top-4 left-4 bg-balatro-gold text-black uppercase font-bold px-3 py-1 rounded shadow-md border border-white/50 text-sm tracking-wider z-10 opacity-50">Legendary</div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-4 z-10 relative px-4 blur-[2px]">
                                <div className="text-center space-y-1 w-full">
                                    <span className="text-balatro-blue uppercase tracking-[0.2em] text-[10px] font-bold bg-black/30 px-2 py-0.5 rounded-full border border-balatro-blue/30">Erratic Deck</span>
                                    <div className="bg-black/60 px-4 py-3 rounded-lg border-2 border-white/20 shadow-inner w-full flex justify-center">
                                        <span className="font-header text-5xl text-white tracking-widest drop-shadow-md select-all filter blur-md">
                                            ????????
                                        </span>
                                    </div>
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest">Hidden</span>
                                </div>

                                {/* Features (TEASER - VISIBLE but Dimmed) */}
                                <div className="w-full space-y-1 px-4 opacity-75">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-white/20 flex-1"></div>
                                        <span className="text-[10px] font-pixel text-balatro-orange uppercase tracking-wider">Ante 1 Findings</span>
                                        <div className="h-px bg-white/20 flex-1"></div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {seed?.wee_a1_cheap && <div className="bg-balatro-grey-dark border border-white px-2 py-1 rounded text-xs font-bold text-balatro-blue shadow-[0_2px_0_rgba(0,0,0,0.4)]">WEE JOKER</div>}
                                        {seed?.hack_a1 && <div className="bg-balatro-grey-dark border border-white px-2 py-1 rounded text-xs font-bold text-balatro-red shadow-[0_2px_0_rgba(0,0,0,0.4)]">HACK</div>}
                                        {seed?.copy_jokers_a1 && <div className="bg-balatro-grey-dark border border-white px-2 py-1 rounded text-xs font-bold text-balatro-green shadow-[0_2px_0_rgba(0,0,0,0.4)]">COPY</div>}
                                        {!seed?.wee_a1_cheap && !seed?.hack_a1 && !seed?.copy_jokers_a1 && <span className="text-white/30 text-xs italic font-mono">No rare jokers found</span>}
                                    </div>
                                </div>

                                {/* Stats (Hidden or Visible? Let's hide stats to prevent math-ing the seed) */}
                                <div className="w-full bg-black/30 rounded-lg p-3 border border-white/10 flex justify-between items-center text-center mt-2 mx-4 opacity-50">
                                    <div className="flex flex-col items-center w-1/2 border-r border-white/10">
                                        <span className="text-xl font-header text-balatro-red text-shadow blur-sm">999</span>
                                        <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Score</span>
                                    </div>
                                    <div className="flex flex-col items-center w-1/2">
                                        <span className="text-xl font-header text-balatro-blue text-shadow blur-sm">99</span>
                                        <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Twos Count</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. JAML CARD */}
                    {isJaml && (
                        <div className="relative w-[340px] md:w-[400px] aspect-[2.5/3.5] bg-[#0f0f0f] rounded-xl border-[6px] border-balatro-gold/50 shadow-[12px_12px_0_rgba(0,0,0,0.4)] flex flex-col items-center justify-center p-4">
                            <div className="absolute top-4 left-4 bg-red-900 text-white uppercase font-bold px-3 py-1 rounded text-xs">ERRor</div>

                            <span className="font-header text-8xl text-balatro-red tracking-widest drop-shadow-[4px_4px_0_rgba(255,0,0,0.2)]">JAML</span>

                            <div className="mt-8 px-6 py-4 bg-black/50 rounded border border-white/10 text-center">
                                <p className="text-balatro-orange font-pixel text-lg leading-tight">
                                    {jamlText}
                                </p>
                            </div>
                            <span className="text-white/20 text-xs mt-8 uppercase font-mono tracking-widest">System Origin // NULL</span>
                        </div>
                    )}

                    {/* 3. STANDARD SEED CARD */}
                    {!isFuture && !isJaml && (
                        <div className="relative w-[340px] md:w-[400px] aspect-[2.5/3.5] bg-[#334155] rounded-xl border-[6px] border-white shadow-[12px_12px_0_rgba(0,0,0,0.4)] flex flex-col items-center p-4 transition-transform duration-200 group-hover:-translate-y-2 group-hover:shadow-[16px_16px_0_rgba(0,0,0,0.4)] overflow-hidden">
                            {/* Inner Pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>

                            {/* Badges */}
                            <div className="absolute top-4 left-4 bg-balatro-gold text-black uppercase font-bold px-3 py-1 rounded shadow-md border border-white/50 text-sm tracking-wider z-10">Legendary</div>
                            {copied && (
                                <div className="absolute top-4 right-4 bg-balatro-green text-white uppercase font-bold px-3 py-1 rounded shadow-md border border-white/50 text-sm tracking-wider animate-bounce z-10">COPIED!</div>
                            )}

                            {/* Content */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full space-y-4 z-10 relative px-4">
                                <div className="text-center space-y-1 w-full">
                                    <span className="text-balatro-blue uppercase tracking-[0.2em] text-[10px] font-bold bg-black/30 px-2 py-0.5 rounded-full border border-balatro-blue/30">Erratic Deck</span>
                                    <div className="bg-black/60 px-4 py-3 rounded-lg border-2 border-white/20 backdrop-blur-sm shadow-inner w-full flex justify-center">
                                        <span className="font-header text-5xl text-white tracking-widest drop-shadow-md select-all">
                                            {seed.seed}
                                        </span>
                                    </div>
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest">Click to Copy</span>
                                </div>

                                {/* Features */}
                                <div className="w-full space-y-1 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-px bg-white/20 flex-1"></div>
                                        <span className="text-[10px] font-pixel text-balatro-orange uppercase tracking-wider">Ante 1 Findings</span>
                                        <div className="h-px bg-white/20 flex-1"></div>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {seed.wee_a1_cheap && <div className="bg-balatro-grey-dark border border-white px-2 py-1 rounded text-xs font-bold text-balatro-blue shadow-[0_2px_0_rgba(0,0,0,0.4)]">WEE JOKER</div>}
                                        {seed.hack_a1 && <div className="bg-balatro-grey-dark border border-white px-2 py-1 rounded text-xs font-bold text-balatro-red shadow-[0_2px_0_rgba(0,0,0,0.4)]">HACK</div>}
                                        {seed.copy_jokers_a1 && <div className="bg-balatro-grey-dark border border-white px-2 py-1 rounded text-xs font-bold text-balatro-green shadow-[0_2px_0_rgba(0,0,0,0.4)]">COPY</div>}
                                        {!seed.wee_a1_cheap && !seed.hack_a1 && !seed.copy_jokers_a1 && <span className="text-white/30 text-xs italic font-mono">No rare jokers found</span>}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="w-full bg-black/30 rounded-lg p-3 border border-white/10 flex justify-between items-center text-center mt-2 mx-4">
                                    <div className="flex flex-col items-center w-1/2 border-r border-white/10">
                                        <span className="text-xl font-header text-balatro-red text-shadow">{seed.score || 0}</span>
                                        <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Score</span>
                                    </div>
                                    <div className="flex flex-col items-center w-1/2">
                                        <span className="text-xl font-header text-balatro-blue text-shadow">{seed.twos || 0}</span>
                                        <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Twos Count</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-4 relative z-10 w-full max-w-md justify-center mt-4">
                <button className="balatro-btn w-full flex items-center justify-center gap-2" disabled={isJaml || isFuture}>
                    <Camera size={24} /> Submit Run
                </button>
            </div>

        </main>
    )
}
