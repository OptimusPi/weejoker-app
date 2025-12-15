"use client";

import { SeedData } from "@/lib/types";
import { ChevronLeft, ChevronRight, Star, Trophy } from "lucide-react";
import { SeedCard } from "./SeedCard";
import { useState, useEffect } from "react";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";
import Image from "next/image";
import Papa from "papaparse";

// Day calculation
const EPOCH = new Date('2025-12-15T00:00:00Z').getTime(); // Dec 15 = Day 1 (Launch)
// If today is Dec 14, (Dec 14 - Dec 15) is negative => Day 0 or -1. 
// We want Dec 14 to be Day 0.
const getDayNumber = () => Math.floor((Date.now() - EPOCH) / (24 * 60 * 60 * 1000)) + 1;

export function DailyWee() {
    const [seeds, setSeeds] = useState<SeedData[]>([]);
    const [viewingDay, setViewingDay] = useState<number>(1);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'main' | 'wisdom'>('main');

    useEffect(() => {
        setViewingDay(getDayNumber());
        setMounted(true);

        // Fetch CSV directly
        fetch('/seeds.csv')
            .then(res => res.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results: any) => {
                        setSeeds(results.data);
                    }
                });
            });
    }, []);

    const [showSubmit, setShowSubmit] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const todayNumber = getDayNumber();
    const isWeepoch = viewingDay < 1;
    const isToday = viewingDay === todayNumber;
    const isTomorrow = viewingDay === todayNumber + 1;

    // Bounds Check for Navigation
    const canGoBack = viewingDay > 0; // Can go back to Day 0 (Weepoch)
    const canGoForward = viewingDay < todayNumber + 1; // Can go to Tomorrow

    const seed = seeds[viewingDay - 1];

    // Derived Logic from User's JAML Columns
    const hasHack = (seed?.Hack_Ante1 ?? 0) > 0 || (seed?.Hack_Ante2 ?? 0) > 0;
    const hasChad = (seed?.HanginChad_Ante1 ?? 0) > 0 || (seed?.HanginChad_Ante2 ?? 0) > 0;
    const hasCopy = (seed?.blueprint_early ?? 0) > 0 || (seed?.brainstorm_early ?? 0) > 0;
    const hasShowman = (seed?.Showman_Ante1 ?? 0) > 0;
    const redSealCount = seed?.red_Seal_Two ?? 0;
    const hasWee = (seed?.WeeJoker_Ante1 ?? 0) > 0 || (seed?.WeeJoker_Ante2 ?? 0) > 0;


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

    if (!mounted) return null;

    return (
        <div className="h-screen w-full relative bg-[#333]">

            {/* VIEW 1: MAIN STAGE (Static Base Layer) */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden pb-12 scale-90 sm:scale-100 transform-gpu origin-center">

                {/* Header Text - Newspaper Masthead Style */}
                <div className="text-center w-full relative z-20 mb-2">
                    {/* Top Meta Line */}
                    <div className="flex justify-between w-full max-w-md mx-auto text-[10px] sm:text-xs font-pixel text-white/60 tracking-widest border-b border-white/20 pb-1 mb-1 uppercase px-4">
                        <span>Vol. 1</span>
                        <span>No. {viewingDay}</span>
                        <span>200 Chips</span>
                    </div>

                    {/* Main Title */}
                    <div className="font-header text-5xl sm:text-6xl md:text-7xl text-white tracking-widest drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase leading-none mb-1 select-none">
                        THE DAILY WEE
                    </div>

                    {/* Slogan Line */}
                    <div className="w-full max-w-md mx-auto border-t-2 border-b-2 border-white/20 py-1 mb-2 px-4">
                        <div className="flex justify-between items-center py-1 border-t border-b border-white/10 text-[10px] sm:text-xs font-pixel text-[var(--balatro-text-grey)] uppercase tracking-[0.2em]">
                            <span>{getDayDisplay(viewingDay)}</span>
                            <span className="italic normal-case tracking-normal opacity-80 hidden sm:inline">&quot;All the 2s&quot;</span>
                            <span>Est. 2025</span>
                        </div>
                    </div>
                </div>

                {/* Main Row: Arrow | Card | Arrow */}
                <div className="flex items-center justify-center gap-4 w-full h-auto relative z-10 px-4">

                    {/* Left Nav (Flanking) */}
                    <button
                        onClick={() => canGoBack && setViewingDay(v => v - 1)}
                        disabled={!canGoBack}
                        className={`
                            hidden md:flex w-14 h-32 rounded-xl border-b-[6px] transition-all items-center justify-center flex-shrink-0
                            ${!canGoBack
                                ? 'opacity-0 cursor-default'
                                : 'bg-[var(--balatro-red)] border-[var(--balatro-red-dark)] hover:bg-[#ff3333] cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.3)] active:border-b-0 active:translate-y-1 hover:scale-105 active:scale-100'
                            }
                        `}
                    >
                        <ChevronLeft size={36} className="text-white" strokeWidth={4} />
                    </button>

                    {/* Central Stage (Card) */}
                    <div className="relative w-full max-w-[24rem] h-auto flex-shrink-0">
                        {isWeepoch ? (
                            /* WEEPOCH CARD */
                            <div className="w-full bg-[var(--balatro-grey-dark)] rounded-3xl border-[3px] border-[var(--balatro-border)] text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8">
                                <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                                <div className="text-8xl mb-6">🌌</div>
                                <div className="font-header text-4xl text-[var(--balatro-gold)] mb-4">BEGINNING</div>
                                <p className="font-pixel text-white/60 text-sm mb-6 max-w-[80%] mx-auto leading-relaxed">
                                    Project Zero Point. <br />
                                    Idea has been rattling around pifreak&apos;s head for quite a while! <br />
                                    Inspired by daylatro (tfausk) & Wordle.
                                </p>
                                <button
                                    onClick={() => setViewingDay(1)}
                                    className="bg-[var(--balatro-blue)] text-white font-header text-xl px-8 py-3 rounded shadow-lg hover:brightness-110 border-b-4 border-[var(--balatro-blue-dark)] active:border-b-0 active:translate-y-1 transition-all"
                                >
                                    GO TO DAY 1
                                </button>
                            </div>
                        ) : isTomorrow ? (
                            /* TOMORROW CARD */
                            <div className="w-full bg-[var(--balatro-grey)] rounded-3xl border-[6px] border-[var(--balatro-border)] text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 group">
                                <div className="absolute inset-0 bg-black/40 z-10"></div>
                                {/* Filtered SeedCard in Background */}
                                {seed && <div className="absolute inset-0 blur-md opacity-50"><SeedCard seed={seed} className="w-full h-full" /></div>}

                                <div className="relative z-20 flex flex-col items-center">
                                    <div className="mb-4 text-white/50">
                                        <div className="bg-black/50 p-4 rounded-xl border-2 border-white/10">
                                            <div className="w-12 h-12 border-4 border-white/30 rounded-full flex items-center justify-center">
                                                <div className="w-6 h-6 bg-white/30 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-header text-4xl text-white mb-2 tracking-widest text-shadow-lg uppercase">
                                        DAY {viewingDay}
                                    </div>
                                    <div className="font-pixel text-[var(--balatro-text-grey)] text-lg mb-6">LOCKED UNTIL TOMORROW</div>
                                    <div className="bg-black/60 px-6 py-3 rounded-xl border border-white/10 shadow-inner">
                                        <div className="font-header text-3xl text-[var(--balatro-gold)] tracking-widest tabular-nums animate-pulse">
                                            {timeLeft || "--:--:--"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* SEED CARD */
                            <div className="w-full relative group/card">
                                {seed && (
                                    <SeedCard
                                        seed={seed}
                                        className="w-full text-lg shadow-2xl border-[6px] border-white/20 hover:-translate-y-0"
                                        onAnalyze={() => setShowSubmit(true)}
                                    />
                                )}
                                {/* Helper Buttons */}
                                <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4 opacity-80 hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setShowHowTo(true)}
                                        className="bg-[var(--balatro-yellow)] text-black font-header px-4 py-2 rounded-full border-2 border-white shadow-lg flex items-center gap-2 hover:scale-110 transition-transform text-sm"
                                    >
                                        ? HOW TO PLAY
                                    </button>
                                    <button
                                        onClick={() => setShowLeaderboard(true)}
                                        className="bg-[var(--balatro-gold)] text-black font-header px-4 py-2 rounded-full border-2 border-white shadow-lg flex items-center gap-2 hover:scale-110 transition-transform text-sm"
                                    >
                                        <Trophy size={16} className="text-black" />
                                        HIGH SCORES
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Nav (Flanking) */}
                    <button
                        onClick={() => canGoForward && setViewingDay(v => v + 1)}
                        disabled={!canGoForward}
                        className={`
                            hidden md:flex w-14 h-32 rounded-xl border-b-[6px] transition-all items-center justify-center flex-shrink-0
                            ${!canGoForward
                                ? 'opacity-0 cursor-default'
                                : 'bg-[var(--balatro-red)] border-[var(--balatro-red-dark)] hover:bg-[#ff3333] cursor-pointer shadow-[0_4px_0_rgba(0,0,0,0.3)] active:border-b-0 active:translate-y-1 hover:scale-105 active:scale-100'
                            }
                        `}
                    >
                        <ChevronRight size={36} className="text-white" strokeWidth={4} />
                    </button>
                </div>

                {/* Mobile Nav (Bottom Overlay) */}
                <div className="fixed bottom-24 left-0 right-0 flex justify-between px-6 md:hidden pointer-events-none z-50">
                    <button
                        onClick={() => canGoBack && setViewingDay(v => v - 1)}
                        disabled={!canGoBack}
                        className={`
                            h-14 w-14 rounded-full border-b-[4px] transition-colors flex items-center justify-center pointer-events-auto
                            ${!canGoBack ? 'opacity-0' : 'bg-[var(--balatro-red)] border-[var(--balatro-red-dark)] shadow-lg active:translate-y-1 active:border-b-0 active:shadow-none'}
                        `}
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <button
                        onClick={() => canGoForward && setViewingDay(v => v + 1)}
                        disabled={!canGoForward}
                        className={`
                            h-14 w-14 rounded-full border-b-[4px] transition-colors flex items-center justify-center pointer-events-auto
                            ${!canGoForward ? 'opacity-0' : 'bg-[var(--balatro-red)] border-[var(--balatro-red-dark)] shadow-lg active:translate-y-1 active:border-b-0 active:shadow-none'}
                        `}
                    >
                        <ChevronRight size={24} className="text-white" />
                    </button>
                </div>

                {/* Bottom Trigger for Wee Wisdom - Acrylic Glass Style */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-center z-40">
                    <button
                        onClick={() => setViewMode('wisdom')}
                        className="group flex flex-col items-center pb-8 pt-4 px-12 bg-white/5 backdrop-blur-md border-t border-l border-r border-white/20 rounded-t-3xl hover:bg-white/10 transition-all cursor-pointer relative top-2 hover:top-0"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors animate-bounce mb-1">
                                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
                            </div>
                            <span className="font-header text-white/80 uppercase tracking-widest text-xs shadow-black drop-shadow-md">
                                A Wee Bit of Wisdom
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* VIEW 2: WEE WISDOM (Fixed Overlay Slide-Up) */}
            <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-500 ease-in-out bg-black/40 backdrop-blur-md"
                style={{ transform: viewMode === 'wisdom' ? 'translateY(0)' : 'translateY(100vh)' }}
            >
                {/* Back Button - LARGE and CLEAR */}
                <button
                    onClick={() => setViewMode('main')}
                    className="absolute top-12 left-1/2 -translate-x-1/2 group flex items-center gap-3 bg-[var(--balatro-red)] hover:bg-[#ff3333] border-b-4 border-[var(--balatro-red-dark)] px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl z-50 active:translate-y-1 active:border-b-0 cursor-pointer"
                >
                    <ChevronLeft className="rotate-90 w-6 h-6 text-white" />
                    <span className="font-header text-white uppercase tracking-widest text-xl drop-shadow-md">
                        Return to Daily Wee
                    </span>
                </button>

                <div className="scale-110">
                    <WeeWisdom />
                </div>
            </div>

            {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
            {showLeaderboard && <LeaderboardModal dayNumber={viewingDay} onClose={() => setShowLeaderboard(false)} />}
            {showSubmit && seed && (
                <SubmitScoreModal
                    seed={seed.seed}
                    dayNumber={viewingDay}
                    onClose={() => setShowSubmit(false)}
                    onSuccess={() => alert("Score submitted! 🏆")}
                />
            )}
        </div>
    );
}

function WeeWisdom() {
    return (
        <div className="w-full max-w-2xl mx-auto px-6">
            <div className="bg-[var(--balatro-grey-dark)] border-[3px] border-white/20 rounded-xl p-8 flex gap-8 items-center shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-[var(--balatro-blue)]/10 rounded-full blur-3xl"></div>
                <div className="shrink-0 pt-2">
                    <Sprite name="weejoker" width={35} />
                </div>
                <div className="space-y-4">
                    <h3 className="text-[var(--balatro-blue)] font-header text-xl uppercase tracking-widest">
                        Wee Wisdom
                    </h3>
                    <p className="font-pixel text-white/80 leading-relaxed text-sm">
                        &quot;Every time you play a rank 2 card, I level up. +8 Chips.&quot;
                    </p>
                    <p className="font-pixel text-white/80 leading-relaxed text-sm">
                        Did you know? Research shows that just <span className="text-[var(--balatro-blue)]">8 minutes</span> of conversation with a friend can significantly reduce feelings of depression and loneliness.
                    </p>
                    <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <span className="text-xs font-pixel text-white/40 italic">
                            Got 8 minutes? Call a friend today.
                        </span>
                        <a
                            href="https://findahelpline.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[var(--balatro-blue)]/10 text-[var(--balatro-blue)] hover:bg-[var(--balatro-blue)]/20 px-3 py-1.5 rounded-lg transition-colors font-header text-xs tracking-wider uppercase flex items-center gap-2"
                        >
                            Find Support (Global)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
