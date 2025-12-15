"use client";

import { SeedData } from "@/lib/types";
import { ChevronLeft, ChevronRight, Star, Trophy, HeartHandshake } from "lucide-react";
import { SeedCard } from "./SeedCard";
import { useState, useEffect } from "react";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";
import Image from "next/image";


// Day calculation
const EPOCH = new Date('2025-12-16T00:00:00Z').getTime(); // Dec 16 = Day 1
// If today is Dec 15, result is 0.
const getDayNumber = () => Math.floor((Date.now() - EPOCH) / (24 * 60 * 60 * 1000)) + 1;

export function DailyWee() {
    const [seeds, setSeeds] = useState<SeedData[]>([]);
    const [viewingDay, setViewingDay] = useState<number>(1);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'main' | 'wisdom'>('main');

    // Convert setter to update URL
    const updateDay = (day: number | ((prev: number) => number)) => {
        setViewingDay(prev => {
            const newDay = typeof day === 'function' ? day(prev) : day;
            const url = new URL(window.location.href);
            url.searchParams.set('day', newDay.toString());
            window.history.pushState({}, '', url);
            return newDay;
        });
    };

    useEffect(() => {
        // Init from URL or today
        const params = new URLSearchParams(window.location.search);
        const dayParam = params.get('day');
        if (dayParam) {
            const dayNum = parseInt(dayParam, 10);
            if (!isNaN(dayNum)) {
                setViewingDay(dayNum);
            }
        } else {
            setViewingDay(getDayNumber());
        }
        setMounted(true);

        // Fetch the seed for the current viewingDay via server API
        fetch(`/api/daily?day=${viewingDay}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch seed');
                return res.json();
            })
            .then((seedData: SeedData) => {
                // Keep seeds as an array for existing rendering logic
                setSeeds([seedData]);
            })
            .catch(error => {
                console.error('Seed fetch error:', error);
                setSeeds([]);
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
        <div className="h-[100dvh] w-full relative overflow-hidden bg-[var(--balatro-black)]">
            {/* MAIN VIEW */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden">
                {/* HERO STAGE - TIGHT LAYOUT */}
                <div className="h-[100dvh] w-full relative z-10 flex flex-col items-center justify-center pb-2">
                    {/* Header */}
                    <div className="text-center w-full relative z-20 mb-1 shrink-0">
                        <div className="flex justify-between w-full max-w-sm mx-auto text-xs font-pixel text-white/90 tracking-widest border-b border-white/30 pb-1 mb-1 uppercase px-4 drop-shadow-md">
                            <span>Vol. 1</span>
                            <span>{viewingDay < 1 ? 'WEEPOCH' : `No. ${viewingDay}`}</span>
                            <span>200 Chips</span>
                        </div>
                        <div className="font-header text-6xl sm:text-7xl text-white tracking-widest drop-shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase leading-none mb-1 select-none">
                            THE DAILY WEE
                        </div>
                        <div className="w-full max-w-sm mx-auto border-t-2 border-b-2 border-white/30 py-0.5 mb-1 px-4">
                            <div className="flex justify-between items-center py-0.5 border-t border-b border-white/20 text-xs font-pixel text-white/80 uppercase tracking-[0.2em] shadow-sm">
                                <span>{getDayDisplay(viewingDay)}</span>
                                <span className="italic normal-case tracking-normal opacity-90 hidden sm:inline">"All the 2s"</span>
                                <span>Est. 2025</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Interaction Area - FULL HEIGHT ROW */}
                    <div className="flex flex-row items-stretch justify-center gap-2 sm:gap-4 w-full max-w-[95vw] sm:max-w-3xl mx-auto px-0 sm:px-4 relative z-30 grow mb-2 min-h-0">
                        {/* Left Nav */}
                        <button onClick={() => canGoBack && updateDay(v => v - 1)} disabled={!canGoBack}
                            className={`hidden sm:flex items-center justify-center w-14 flex-shrink-0 rounded-xl transition-all duration-75 ease-out border-[2px] border-black/20 ${!canGoBack ? 'opacity-0 cursor-default pointer-events-none' : 'bg-[#D04035] shadow-[0_4px_0_#000] hover:bg-[#B03025] hover:brightness-110 active:shadow-none active:translate-y-[2px]'}`}
                        >
                            <ChevronLeft size={36} className="text-white drop-shadow-md" strokeWidth={5} />
                        </button>
                        {/* Mobile Left Nav */}
                        <button onClick={() => canGoBack && updateDay(v => v - 1)} disabled={!canGoBack}
                            className={`sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-24 rounded-r-xl flex items-center justify-center transition-all duration-75 ease-out border-y-[2px] border-r-[2px] border-black/20 ${!canGoBack ? 'opacity-0 cursor-default pointer-events-none' : 'bg-[#D04035] shadow-[0_4px_0_#000] hover:bg-[#B03025] active:shadow-none active:translate-y-[2px]'}`}
                        >
                            <ChevronLeft size={32} className="text-white drop-shadow-md" strokeWidth={4} />
                        </button>

                        {/* Central Stage */}
                        <div className="relative w-full max-w-[22rem] sm:max-w-[24rem] z-20 px-2 sm:px-0 flex flex-col grow min-h-0">
                            {isWeepoch ? (
                                // WEEPOCH CARD
                                <div className="w-full bg-black/40 backdrop-blur-sm rounded-xl border-[4px] border-white/20 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 grow">
                                    <div className="text-8xl mb-6">🌌</div>
                                    <div className="font-header text-4xl text-[var(--balatro-gold)] mb-4">BEGINNING</div>
                                    <p className="font-pixel text-white/60 text-sm mb-6 max-w-[80%] mx-auto leading-relaxed">
                                        Project Zero Point.<br />Idea has been rattling around pifreak's head for quite a while!<br />Inspired by daylatro (tfausk) &amp; Wordle.
                                    </p>
                                    <button onClick={() => updateDay(1)}
                                        className="bg-[var(--balatro-blue)] text-white font-header text-xl px-8 py-3 rounded-xl shadow-[0_4px_0_#000] hover:bg-[var(--balatro-blue-dark)] active:shadow-none active:translate-y-[2px] transition-all duration-75 ease-out"
                                    >
                                        GO TO DAY 1
                                    </button>
                                </div>
                            ) : isTomorrow ? (
                                // TOMORROW CARD
                                <div className="w-full bg-black/40 backdrop-blur-sm rounded-xl border-[4px] border-white/20 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 group grow">
                                    <div className="relative z-20 flex flex-col items-center">
                                        <div className="mb-4 text-white/50">
                                            <div className="bg-black/50 p-6 rounded-2xl border-2 border-white/10">
                                                {/* Padlock Icon Logic - Fallback to built-in lock if specific sprite missing */}
                                                <div className="w-16 h-16 flex items-center justify-center text-white/40">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="font-header text-4xl text-white mb-2 tracking-widest text-shadow-lg uppercase">DAY {viewingDay}</div>
                                        <div className="font-pixel text-[var(--balatro-text-grey)] text-lg mb-6">LOCKED UNTIL TOMORROW</div>
                                        <div className="bg-black/80 px-6 py-3 rounded-xl border border-white/20 shadow-inner">
                                            <div className="font-header text-3xl text-[var(--balatro-gold)] tracking-widest tabular-nums animate-pulse">
                                                {timeLeft || "--:--:--"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // SEED CARD (real data) - FULL HEIGHT
                                <div className="w-full h-full relative group/card flex flex-col grow min-h-0">
                                    {seed && (
                                        <SeedCard
                                            seed={seed}
                                            dayNumber={viewingDay}
                                            className="w-full h-full grow flex flex-col"
                                            onAnalyze={() => setShowHowTo(true)} // 'Play' button now opens HowToPlay
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Nav */}
                        <button onClick={() => canGoForward && updateDay(v => v + 1)} disabled={!canGoForward}
                            className={`hidden sm:flex items-center justify-center w-14 flex-shrink-0 rounded-xl transition-all duration-75 ease-out border-[2px] border-black/20 ${!canGoForward ? 'opacity-0 cursor-default pointer-events-none' : 'bg-[#D04035] shadow-[0_4px_0_#000] hover:bg-[#B03025] hover:brightness-110 active:shadow-none active:translate-y-[2px]'}`}
                        >
                            <ChevronRight size={36} className="text-white drop-shadow-md" strokeWidth={5} />
                        </button>
                        {/* Mobile Right Nav */}
                        <button onClick={() => canGoForward && updateDay(v => v + 1)} disabled={!canGoForward}
                            className={`sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-24 rounded-l-xl flex items-center justify-center transition-all duration-75 ease-out border-y-[2px] border-l-[2px] border-black/20 ${!canGoForward ? 'opacity-0 cursor-default pointer-events-none' : 'bg-[#D04035] shadow-[0_4px_0_#000] hover:bg-[#B03025] active:shadow-none active:translate-y-[2px]'}`}
                        >
                            <ChevronRight size={32} className="text-white drop-shadow-md" strokeWidth={4} />
                        </button>
                    </div>

                    {/* "FAKE BANNER AD" FOOTER */}
                    <div className="w-full max-w-[95vw] sm:max-w-2xl px-2 sm:px-0 z-40 shrink-0">
                        <button onClick={() => setViewMode('wisdom')}
                            className="w-full group relative overflow-hidden bg-[var(--balatro-grey)] border-[3px] border-white/40 hover:border-white/80 rounded-xl shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[2px] transition-all p-3 sm:p-4 flex flex-row items-center justify-between gap-4"
                        >
                            <div className="flex flex-col items-start text-left">
                                <span className="font-header text-[var(--balatro-gold)] text-lg sm:text-xl uppercase tracking-wider leading-none mb-1 drop-shadow-sm">
                                    So, you like The Daily Wee, huh?
                                </span>
                                <span className="font-pixel text-[10px] sm:text-xs text-white/80">
                                    FREE challenge seeds at: <span className="text-white underline decoration-dashed underline-offset-2">ErraticDeck.app</span>
                                </span>
                            </div>
                            <div className="hidden sm:flex bg-black/30 px-3 py-1.5 rounded border border-white/20 text-[10px] font-pixel text-white/50 uppercase tracking-widest shrink-0">
                                AD
                            </div>
                        </button>
                    </div>
                </div>
            </div>      {/* VIEW 2: WEE WISDOM (Fixed Overlay Slide-Up) */}
            <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-500 ease-in-out bg-black/95 backdrop-blur-none pointer-events-auto"
                style={{ transform: viewMode === 'wisdom' ? 'translateY(0)' : 'translateY(120vh)' }}
            >
                <div className="scale-110 w-full max-w-2xl px-6 flex flex-col items-center">
                    <WeeWisdom onBack={() => setViewMode('main')} />
                </div>
            </div>

            {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} onSubmit={() => { setShowHowTo(false); setShowSubmit(true); }} />}
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

function WeeWisdom({ onBack }: { onBack: () => void }) {
    return (
        <div className="w-full">
            <div className="bg-[var(--balatro-grey)] border-[3px] border-white rounded-xl p-8 flex flex-col gap-6 items-center shadow-[0_8px_0_#000] relative overflow-hidden">

                {/* Header Row: Sprite + Text */}
                <div className="flex items-center gap-4 w-full justify-center">
                    <Sprite name="weejoker" width={48} className="drop-shadow-lg" />
                    <h3 className="text-[var(--balatro-blue)] font-header text-3xl uppercase tracking-widest drop-shadow-md">
                        Wee Wisdom
                    </h3>
                </div>

                <div className="space-y-4 text-center">
                    <p className="font-pixel text-white/90 leading-relaxed text-sm">
                        &quot;Every time you play a rank 2 card, I level up. <span className="text-[var(--balatro-blue)] font-header">+8 Chips</span>.&quot;
                    </p>
                    <p className="font-pixel text-white/90 leading-relaxed text-sm">
                        Did you know? Research shows that just <span className="text-[var(--balatro-blue)] font-header">8 minutes</span> of conversation with a friend can significantly reduce feelings of depression and loneliness.
                    </p>
                    <p className="font-pixel text-white/60 italic text-xs border-l-2 border-[var(--balatro-blue)] pl-2 text-left mx-auto max-w-md">
                        Just like in Balatro, small connections stack up to big results.
                    </p>

                    <div className="pt-4 border-t-2 border-dashed border-white/20 flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                        <span className="text-xs font-pixel text-white/60 italic">
                            Got 8 minutes? Call a friend today.
                        </span>
                        <a
                            href="https://findahelpline.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[var(--balatro-blue)] text-white hover:brightness-110 px-4 py-2 rounded-lg transition-transform border border-white/50 font-header text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_2px_0_#000] active:shadow-none active:translate-y-[2px]"
                        >
                            <HeartHandshake size={16} />
                            Lonely? FIND SUPPORT
                        </a>
                    </div>
                </div>

                {/* Back Button - Full Width Orange Style */}
                <button
                    onClick={onBack}
                    className="w-full bg-[var(--balatro-orange)] text-white font-header text-xl px-8 py-3 rounded-lg shadow-[0_4px_0_#000] hover:brightness-110 border-[3px] border-white active:shadow-none active:translate-y-[4px] transition-all duration-75 ease-out uppercase tracking-widest mt-2"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
