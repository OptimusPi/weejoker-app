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

        // Fetch CSV directly
        // Fetch CSV and handle DuckDB preamble
        fetch('/seeds.csv')
            .then(res => res.text())
            .then(csvText => {
                // Remove first line (DuckDB header) if it exists
                const lines = csvText.split('\n');
                const cleanCsv = lines[0].startsWith('≡') ? lines.slice(1).join('\n') : csvText;

                Papa.parse(cleanCsv, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results: any) => {
                        console.log("Parsed Seeds:", results.data.slice(0, 2)); // Debug log
                        setSeeds(results.data);
                    },
                    error: (error: any) => {
                        console.error("CSV Parse Error:", error);
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
        <div className="h-[100dvh] w-full relative">

            {/* VIEW 1: MAIN STAGE (Static Base Layer) */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-start sm:justify-center overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-12 scale-90 sm:scale-100 transform-gpu origin-center pt-4 sm:pt-0">

                {/* VIEW 1: HERO STAGE (95% Viewport Height) */}
                <div className="min-h-[95dvh] w-full relative z-10 flex flex-col items-center justify-start sm:justify-center pt-2 sm:pt-0">

                    {/* Header Text - Newspaper Masthead Style */}
                    <div className="text-center w-full relative z-20 mb-2 shrink-0">
                        {/* Top Meta Line */}
                        <div className="flex justify-between w-full max-w-md mx-auto text-[10px] sm:text-xs font-pixel text-white/60 tracking-widest border-b border-white/20 pb-1 mb-1 uppercase px-4">
                            <span>Vol. 1</span>
                            <span>{viewingDay < 1 ? 'WEEPOCH' : `No. ${viewingDay}`}</span>
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

                    {/* Main Interaction Area - Flexbox for Stretched Buttons */}
                    <div className="flex flex-row items-stretch justify-center gap-2 sm:gap-4 w-full max-w-[95vw] sm:max-w-3xl mx-auto px-0 sm:px-4 relative z-30 grow pb-32 sm:pb-12">

                        {/* Left Nav (Tall Flanking Button) */}
                        <button
                            onClick={() => canGoBack && updateDay(v => v - 1)}
                            disabled={!canGoBack}
                            className={`
                            hidden sm:flex items-center justify-center w-14 flex-shrink-0
                            rounded-xl
                            transition-all duration-75 ease-out
                            ${!canGoBack
                                    ? 'opacity-0 cursor-default pointer-events-none'
                                    : 'bg-[var(--balatro-grey)] shadow-[0_4px_0_#000] hover:bg-[var(--balatro-grey-dark)] active:shadow-none active:translate-y-[2px]'
                                }
                        `}
                        >
                            <ChevronLeft size={36} className="text-white drop-shadow-md" strokeWidth={5} />
                        </button>

                        {/* Mobile Left Nav (Floating) */}
                        <button
                            onClick={() => canGoBack && updateDay(v => v - 1)}
                            disabled={!canGoBack}
                            className={`
                            sm:hidden absolute left-0 top-1/2 -translate-y-1/2 z-40
                            w-12 h-24 rounded-r-xl
                            flex items-center justify-center transition-all duration-75 ease-out
                            ${!canGoBack
                                    ? 'opacity-0 cursor-default pointer-events-none'
                                    : 'bg-[var(--balatro-grey)] shadow-[0_4px_0_#000] hover:bg-[var(--balatro-grey-dark)] active:shadow-none active:translate-y-[2px]'
                                }
                        `}
                        >
                            <ChevronLeft size={32} className="text-white drop-shadow-md" strokeWidth={4} />
                        </button>


                        {/* Central Stage (Card) */}
                        <div className="relative w-full max-w-[22rem] sm:max-w-[24rem] z-20 px-2 sm:px-0 flex flex-col grow">

                            {isWeepoch ? (
                                /* WEEPOCH CARD */
                                <div className="w-full bg-black/30 backdrop-blur-lg rounded-3xl border-[3px] border-white/20 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 grow">
                                    <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                                    <div className="text-8xl mb-6">🌌</div>
                                    <div className="font-header text-4xl text-[var(--balatro-gold)] mb-4">BEGINNING</div>
                                    <p className="font-pixel text-white/60 text-sm mb-6 max-w-[80%] mx-auto leading-relaxed">
                                        Project Zero Point. <br />
                                        Idea has been rattling around pifreak&apos;s head for quite a while! <br />
                                        Inspired by daylatro (tfausk) & Wordle.
                                    </p>
                                    <button
                                        onClick={() => updateDay(1)}
                                        className="bg-[var(--balatro-blue)] text-white font-header text-xl px-8 py-3 rounded-xl shadow-[0_4px_0_#000] hover:bg-[var(--balatro-blue-dark)] active:shadow-none active:translate-y-[2px] transition-all duration-75 ease-out"
                                    >
                                        GO TO DAY 1
                                    </button>
                                </div>
                            ) : isTomorrow ? (
                                /* TOMORROW CARD */
                                <div className="w-full bg-black/30 backdrop-blur-lg rounded-3xl border-[6px] border-white/20 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 group grow">
                                    <div className="absolute inset-0 bg-black/40 z-10"></div>

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
                                <div className="w-full relative group/card flex flex-col grow">
                                    {seed && (
                                        <SeedCard
                                            seed={seed}
                                            className="w-full text-lg shadow-2xl hover:-translate-y-0 grow flex flex-col"
                                            onAnalyze={() => setShowSubmit(true)}
                                        />
                                    )}
                                    {/* Helper Buttons - Pushed down and ensured z-index */}
                                    <div className="mt-8 flex justify-center gap-4 opacity-100 transition-opacity z-50 relative pb-4">
                                        <button
                                            onClick={() => setShowHowTo(true)}
                                            className="bg-[var(--balatro-orange)] text-white font-header px-4 py-2 rounded-xl shadow-[0_4px_0_#000] flex items-center gap-2 hover:bg-[#D04035] hover:brightness-100 transition-transform active:translate-y-[2px] active:shadow-none text-sm"
                                        >
                                            ? HOW TO PLAY
                                        </button>
                                        <button
                                            onClick={() => setShowLeaderboard(true)}
                                            className="bg-[var(--balatro-blue)] text-white font-header px-4 py-2 rounded-xl shadow-[0_4px_0_#000] flex items-center gap-2 hover:bg-[var(--balatro-blue-dark)] transition-transform active:translate-y-[2px] active:shadow-none text-sm"
                                        >
                                            <Trophy size={16} className="text-white" />
                                            HIGH SCORES
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Nav (Tall Flanking Button) */}
                        <button
                            onClick={() => canGoForward && updateDay(v => v + 1)}
                            disabled={!canGoForward}
                            className={`
                            hidden sm:flex items-center justify-center w-14 flex-shrink-0
                            rounded-xl
                            transition-all duration-75 ease-out
                            ${!canGoForward
                                    ? 'opacity-0 cursor-default pointer-events-none'
                                    : 'bg-[var(--balatro-grey)] shadow-[0_4px_0_#000] hover:bg-[var(--balatro-grey-dark)] active:shadow-none active:translate-y-[2px]'
                                }
                        `}
                        >
                            <ChevronRight size={36} className="text-white drop-shadow-md" strokeWidth={5} />
                        </button>

                        {/* Mobile Right Nav (Floating) */}
                        <button
                            onClick={() => canGoForward && updateDay(v => v + 1)}
                            disabled={!canGoForward}
                            className={`
                            sm:hidden absolute right-0 top-1/2 -translate-y-1/2 z-40
                            w-12 h-24 rounded-l-xl
                            flex items-center justify-center transition-all duration-75 ease-out
                            ${!canGoForward
                                    ? 'opacity-0 cursor-default pointer-events-none'
                                    : 'bg-[var(--balatro-grey)] shadow-[0_4px_0_#000] hover:bg-[var(--balatro-grey-dark)] active:shadow-none active:translate-y-[2px]'
                                }
                        `}
                        >
                            <ChevronRight size={32} className="text-white drop-shadow-md" strokeWidth={4} />
                        </button>
                    </div>

                    {/* Bottom Trigger for Wee Wisdom - Fixed Bottom Tab - Solid Stone Style */}
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 pb-0">
                        <button
                            onClick={() => setViewMode('wisdom')}
                            className="group flex flex-col items-center py-4 sm:py-6 px-12 sm:px-16 bg-[var(--balatro-grey)] rounded-t-xl hover:bg-[var(--balatro-grey-dark)] transition-all cursor-pointer relative top-0 shadow-[0_-4px_0_#000] active:shadow-none active:translate-y-[2px]"
                        >
                            <div className="flex flex-col items-center gap-1">
                                <span className="font-header text-white uppercase tracking-widest text-base sm:text-lg drop-shadow-md">
                                    A Wee Bit of Wisdom
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* VIEW 2: WEE WISDOM (Fixed Overlay Slide-Up) */}
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-500 ease-in-out bg-black/95 backdrop-blur-none pointer-events-auto"
                    style={{ transform: viewMode === 'wisdom' ? 'translateY(0)' : 'translateY(120vh)' }}
                >
                    <div className="scale-110 w-full max-w-2xl px-6 flex flex-col items-center">
                        <WeeWisdom onBack={() => setViewMode('main')} />
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
