"use client";

import { SeedData } from "@/lib/types";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { SeedCard } from "./SeedCard";
import { useState, useEffect } from "react";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import Image from "next/image";

// Day calculation
const EPOCH = new Date('2025-12-13T00:00:00Z').getTime(); // Dec 13 = Day 1
const getDayNumber = () => Math.floor((Date.now() - EPOCH) / (24 * 60 * 60 * 1000)) + 1;

export function DailyWee({ seeds }: { seeds: SeedData[] }) {
    const [viewingDay, setViewingDay] = useState<number>(1);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setViewingDay(getDayNumber());
        setMounted(true);
    }, []);

    const [showSubmit, setShowSubmit] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);

    if (!mounted) return null;

    const todayNumber = getDayNumber(); // Navigation logic
    const isToday = viewingDay === todayNumber;
    const isTomorrow = viewingDay === todayNumber + 1;
    const isWeepoch = viewingDay < 1;
    const canGoBack = viewingDay > 0;
    const canGoForward = viewingDay <= todayNumber + 1; // Allow going to tomorrow

    const seed = seeds[viewingDay - 1];

    // Countdown Logic
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
        if (!isTomorrow) return;
        const interval = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setUTCHours(24, 0, 0, 0); // Next UTC midnight
            const diff = tomorrow.getTime() - now.getTime();

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [isTomorrow]);

    const getDayDisplay = (day: number) => {
        if (day < 1) return "EPOCH START";
        if (day === todayNumber + 1) return "TOMORROW";
        const date = new Date(EPOCH + (day - 1) * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <>
            {/* Navigation Header - Minimal */}
            <div className="flex flex-col items-center gap-6 w-full max-w-7xl mx-auto px-4 py-8 min-h-[80vh] justify-center">

                {/* Header Text */}
                <div className="text-center mb-4">
                    <div className="font-header text-6xl text-white tracking-widest drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase">
                        {isWeepoch ? "THE WEEPOCH" : (isTomorrow ? "FUTURE" : (isToday ? "TODAY" : `DAY #${viewingDay}`))}
                    </div>
                    <div className="font-pixel text-[var(--balatro-text-grey)] text-xl uppercase tracking-[0.2em] mt-2">
                        {getDayDisplay(viewingDay)}
                    </div>
                </div>

                {/* Main Row: Arrow | Card | Arrow */}
                <div className="flex items-center justify-center gap-8 w-full">

                    {/* Left Nav */}
                    <button
                        onClick={() => canGoBack && setViewingDay(v => v - 1)}
                        disabled={!canGoBack}
                        className={`
                            p-6 rounded-2xl border-b-4 transition-all transform hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-1
                            ${!canGoBack ? 'opacity-0 cursor-default' : 'bg-[var(--balatro-red)] border-[var(--balatro-red-dark)] shadow-xl cursor-pointer'}
                        `}
                    >
                        <ChevronLeft size={48} className="text-white" />
                    </button>

                    {/* Central Stage */}
                    <div className="relative z-10 transform hover:scale-105 transition-transform duration-300 w-full max-w-sm md:max-w-md">
                        {isWeepoch ? (
                            /* WEEPOCH CARD */
                            <div className="bg-[var(--balatro-grey-dark)] p-12 rounded-3xl border-[3px] border-[var(--balatro-border)] text-center shadow-2xl relative overflow-hidden aspect-[2/3] flex flex-col items-center justify-center">
                                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                                <div className="text-8xl mb-6">🌌</div>
                                <div className="font-header text-4xl text-[var(--balatro-gold)] mb-4">BEGINNING</div>
                                <button
                                    onClick={() => setViewingDay(1)}
                                    className="bg-[var(--balatro-blue)] text-white font-header text-xl px-8 py-3 rounded shadow-lg hover:brightness-110 border-b-4 border-[var(--balatro-blue-dark)] active:border-b-0 active:translate-y-1 transition-all"
                                >
                                    GO TO DAY 1
                                </button>
                            </div>
                        ) : isTomorrow ? (
                            /* TOMORROW CARD */
                            <div className="bg-[var(--balatro-grey)] p-8 rounded-3xl border-[6px] border-[var(--balatro-border)] text-center shadow-2xl relative overflow-hidden aspect-[2/3] flex flex-col items-center justify-center group">
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10"></div>
                                {/* Filtered SeedCard in Background */}
                                {seed && <div className="absolute inset-0 blur-md opacity-50 scale-105"><SeedCard seed={seed} /></div>}

                                <div className="relative z-20 flex flex-col items-center">
                                    <div className="text-6xl mb-4">🔒</div>
                                    <div className="font-header text-4xl text-white mb-2 tracking-widest text-shadow-lg">LOCKED</div>
                                    <div className="font-pixel text-[var(--balatro-text-grey)] text-lg mb-6">Available in:</div>
                                    <div className="bg-black/60 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                                        <div className="font-header text-3xl text-[var(--balatro-gold)] tracking-widest tabular-nums animate-pulse">
                                            {timeLeft || "--:--:--"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* SEED CARD - Scaled Up */
                            /* Passing className to stretch the card */
                            <div className="relative">
                                {seed && (
                                    <SeedCard
                                        seed={seed}
                                        className="w-full text-lg shadow-2xl border-[6px] border-white/20 hover:-translate-y-0" // Reset standard hover translation as we handle scale
                                        onAnalyze={() => setShowSubmit(true)} // Reusing analyze button for score submit or details
                                    />
                                )}
                                {/* Quick Action for Score */}
                                <div className="absolute -bottom-16 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowSubmit(true)}
                                        className="bg-[var(--balatro-green)] text-white font-header px-6 py-2 rounded-full border-2 border-white shadow-lg flex items-center gap-2 hover:scale-110 transition-transform"
                                    >
                                        <Star size={16} /> SUBMIT SCORE
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Nav */}
                    <button
                        onClick={() => canGoForward && setViewingDay(v => v + 1)}
                        disabled={!canGoForward}
                        className={`
                            p-6 rounded-2xl border-b-4 transition-all transform hover:scale-105 active:scale-95 active:border-b-0 active:translate-y-1
                            ${!canGoForward ? 'opacity-0 cursor-default' : 'bg-[var(--balatro-red)] border-[var(--balatro-red-dark)] shadow-xl cursor-pointer'}
                        `}
                    >
                        <ChevronRight size={48} className="text-white" />
                    </button>
                </div>

                {/* Footer Message */}
                {!isWeepoch && !isTomorrow && (
                    <div className="font-pixel text-[var(--balatro-text-grey)]/60 text-lg animate-pulse mt-8 flex flex-col items-center gap-2">
                        <span>Click 'DETAILS' on card to submit score</span>
                        <div className="flex gap-4 mt-2">
                            <div className="flex items-center gap-1">
                                <Image src="/assets/wee_joker.png" width={32} height={32} alt="Wee" className="opacity-80" />
                                <span className="text-[var(--balatro-blue)]">Wee Joker</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Image src="/assets/hack.png" width={32} height={32} alt="Hack" className="opacity-80" />
                                <span className="text-[var(--balatro-red)]">Hack</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
            {showSubmit && seed && (
                <SubmitScoreModal
                    seed={seed.seed}
                    dayNumber={viewingDay}
                    onClose={() => setShowSubmit(false)}
                    onSuccess={() => alert("Score submitted! 🏆")}
                />
            )}
        </>
    );
}
