"use client";

import { SeedData } from "@/lib/types";
import { ChevronLeft, ChevronRight, Star, Trophy, HeartHandshake } from "lucide-react";
import { SeedCard } from "./SeedCard";
import { useState, useEffect, useRef } from "react";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";

import { AdRotator } from "./AdRotator";
import Image from "next/image";


// Day calculation
const EPOCH = new Date('2025-12-18T00:00:00Z').getTime(); // Dec 18 = Day 1
// If today is Dec 15, result is 0.
const getDayNumber = () => Math.floor((Date.now() - EPOCH) / (24 * 60 * 60 * 1000)) + 1;

export function DailyWee() {
    const [seeds, setSeeds] = useState<SeedData[]>([]);
    const [viewingDay, setViewingDay] = useState<number>(1);
    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'main' | 'wisdom'>('main');
    const [error, setError] = useState<string | null>(null);

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

    const [schedule, setSchedule] = useState<any[]>([]);

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

        // Fetch Schedule Once
        fetch('/daily_ritual.json')
            .then(res => {
                if (!res.ok) throw new Error("Missing Schedule");
                return res.json();
            })
            .then(data => setSchedule(data))
            .catch(e => {
                console.error("Schedule Error", e);
                // Fallback or empty
            });

    }, []);

    const [topScore, setTopScore] = useState<{ name: string; score: number } | null>(null);

    useEffect(() => {
        if (!mounted) return;

        const loadDayData = async (day: number) => {
            // 1. Get Seed from Local Schedule
            // Schedule is 0-indexed (Day 1 = Index 0)
            const seedRaw = schedule[day - 1];

            if (day > getDayNumber()) {
                // Future Hype Mode: Load data but it will be visually locked
                if (!seedRaw) {
                    setSeeds([]);
                    if (schedule.length > 0) setError("Future seed not found.");
                } else {
                    // Map Data typically
                    const seedData: SeedData = {
                        seed: seedRaw.id,
                        score: seedRaw.score,
                        twos: seedRaw.twos,
                        WeeJoker_Ante1: seedRaw.wj1,
                        WeeJoker_Ante2: seedRaw.wj2,
                        HanginChad_Ante1: seedRaw.hc1,
                        HanginChad_Ante2: seedRaw.hc2,
                        Hack_Ante1: seedRaw.hk1,
                        Hack_Ante2: seedRaw.hk2,
                        blueprint_early: seedRaw.bp,
                        brainstorm_early: seedRaw.bs,
                        Showman_Ante1: seedRaw.sh,
                        red_Seal_Two: seedRaw.rs
                    };
                    setSeeds([seedData]);
                    setError(null);
                }
            } else if (!seedRaw) {
                setSeeds([]);
                // If schedule didn't load yet, don't error, just wait?
                if (schedule.length > 0) setError("Seed not found.");
            } else {
                // Map Minified JSON to Full Types
                const seedData: SeedData = {
                    seed: seedRaw.id,
                    score: seedRaw.score,
                    twos: seedRaw.twos,
                    WeeJoker_Ante1: seedRaw.wj1,
                    WeeJoker_Ante2: seedRaw.wj2,
                    HanginChad_Ante1: seedRaw.hc1,
                    HanginChad_Ante2: seedRaw.hc2,
                    Hack_Ante1: seedRaw.hk1,
                    Hack_Ante2: seedRaw.hk2,
                    blueprint_early: seedRaw.bp,
                    brainstorm_early: seedRaw.bs,
                    Showman_Ante1: seedRaw.sh,
                    red_Seal_Two: seedRaw.rs
                };
                setSeeds([seedData]);
                setError(null);
            }

            // 2. Fetch Score (Still API)
            try {
                const scoreRes = await fetch(`/api/scores?day=${day}`);
                if (scoreRes.ok) {
                    const scoreData = await scoreRes.json();
                    if (scoreData.scores && scoreData.scores.length > 0) {
                        const top = scoreData.scores[0];
                        setTopScore({ name: top.playerName || top.player_name || top.name, score: top.score });
                    } else {
                        setTopScore(null);
                    }
                } else {
                    setTopScore(null);
                }
            } catch (e) {
                console.error("Score fetch error", e);
                setTopScore(null);
            }
        };

        loadDayData(viewingDay);
    }, [viewingDay, mounted, schedule]);


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

    // For static daily loading, seeds array will contain a single item or be empty
    const seed = seeds.length > 0 ? seeds[0] : null;

    // Derived Logic from User's JAML Columns
    const hasHack = (seed?.Hack_Ante1 ?? 0) > 0 || (seed?.Hack_Ante2 ?? 0) > 0;
    const hasChad = (seed?.HanginChad_Ante1 ?? 0) > 0 || (seed?.HanginChad_Ante2 ?? 0) > 0;
    const hasCopy = (seed?.blueprint_early ?? 0) > 0 || (seed?.brainstorm_early ?? 0) > 0;
    const hasShowman = (seed?.Showman_Ante1 ?? 0) > 0;
    const redSealCount = seed?.red_Seal_Two ?? 0;
    const hasWee = (seed?.WeeJoker_Ante1 ?? 0) > 0 || (seed?.WeeJoker_Ante2 ?? 0) > 0;

    const getDayDisplay = (day: number) => {
        // if (day < 1) return "EPOCH START"; // Removed per user request
        const date = new Date(EPOCH + (day - 1) * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
    };

    if (!mounted) return null;

    return (
        <div className="h-[100dvh] w-full relative overflow-hidden bg-[var(--balatro-black)]">
            {/* MAIN VIEW */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center overflow-hidden">
                {/* HERO STAGE - TIGHT LAYOUT */}
                <div className="h-[100dvh] w-full relative z-10 flex flex-col items-center justify-between pb-4 pt-12 sm:pt-8">
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
                        <div className="w-full max-w-sm mx-auto mb-1 px-4">
                            <div className="flex justify-between items-center py-1 border-y border-white/20 text-xs font-pixel text-white uppercase tracking-[0.2em] shadow-sm">
                                <span>{getDayDisplay(viewingDay)}</span>
                                <span className="italic normal-case tracking-normal hidden sm:inline">&quot;All the 2s&quot;</span>
                                <span>Est. 2025</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Interaction Area - FULL HEIGHT ROW */}
                    <div className="flex flex-row items-stretch justify-center gap-2 sm:gap-4 w-full max-w-[95vw] sm:max-w-3xl mx-auto px-0 sm:px-4 relative z-30 grow mb-2 min-h-0">
                        {/* Left Nav */}
                        <button onClick={() => canGoBack && updateDay(v => v - 1)} disabled={!canGoBack}
                            className={`hidden sm:flex items-center justify-center w-14 flex-shrink-0 rounded-xl transition-all duration-75 ease-out border-[2px] border-black/20 ${!canGoBack ? 'bg-[#5c1a1a] shadow-[0_4px_0_#3d1111] opacity-50 cursor-not-allowed' : 'bg-[var(--balatro-red)] shadow-[0_4px_0_var(--balatro-red-dark)] hover:bg-[var(--balatro-red-dark)] hover:shadow-[0_4px_0_var(--balatro-red-darker)] hover:brightness-100 active:shadow-none active:translate-y-[4px]'}`}
                        >
                            <ChevronLeft size={36} className={!canGoBack ? "text-[#8a2e2e] drop-shadow-sm" : "text-white drop-shadow-md"} strokeWidth={5} />
                        </button>
                        {/* Mobile Left Nav */}
                        <button onClick={() => canGoBack && updateDay(v => v - 1)} disabled={!canGoBack}
                            className={`sm:hidden absolute left-0 top-0 bottom-0 z-40 w-12 flex items-center justify-center transition-all duration-75 ease-out rounded-l-md ${!canGoBack ? 'bg-[#5c1a1a]/90 backdrop-blur-sm opacity-50 cursor-not-allowed' : 'bg-black/10 hover:bg-black/30 active:bg-black/50'}`}
                        >
                            <ChevronLeft size={48} className={!canGoBack ? "text-[#8a2e2e] drop-shadow-sm" : "text-white drop-shadow-md"} strokeWidth={4} />
                        </button>

                        {/* Central Stage */}
                        <div className="relative w-full max-w-[22rem] sm:max-w-[24rem] z-20 px-2 sm:px-0 flex flex-col grow min-h-0">
                            {isWeepoch ? (
                                // WEEPOCH CARD (Day 0)
                                <div className="w-full bg-black/40 backdrop-blur-sm rounded-xl border-[4px] border-white/20 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8 grow">
                                    <div className="text-8xl mb-6">🌌</div>
                                    <div className="font-header text-4xl text-[var(--balatro-gold)] mb-4">BEGINNING</div>
                                    <p className="font-pixel text-white/60 text-sm mb-6 max-w-[80%] mx-auto leading-relaxed">
                                        Project Zero Point.<br />Idea has been rattling around pifreak&apos;s head for quite a while!<br />Inspired by daylatro (tfausk) &amp; Wordle.
                                    </p>
                                    <button onClick={() => updateDay(1)}
                                        className="bg-[var(--balatro-blue)] text-white font-header text-xl px-8 py-3 rounded-xl shadow-[0_4px_0_#000] hover:bg-[var(--balatro-blue-dark)] active:shadow-none active:translate-y-[2px] transition-all duration-75 ease-out"
                                    >
                                        GO TO DAY 1
                                    </button>
                                </div>
                            ) : (
                                // STANDARD CARD (Past, Present, or Future Hype)
                                <div className="w-full h-full relative group/card flex flex-col grow min-h-0">
                                    {seed ? (
                                        <SeedCard
                                            seed={seed}
                                            dayNumber={viewingDay}
                                            className="w-full h-full grow flex flex-col"
                                            onAnalyze={() => setShowHowTo(true)}
                                            isLocked={viewingDay > todayNumber}
                                        />
                                    ) : (
                                        // Loading or Error State
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                            {error ? (
                                                <div className="bg-red-900/80 border border-red-500 rounded-lg p-6 max-w-sm flex flex-col items-center gap-4 shadow-xl z-50 relative pointer-events-auto">
                                                    <p className="text-red-200 font-header text-xl uppercase tracking-wider">
                                                        {error?.includes("Wait") ? "FUTURE LOCKED" : "Connection Error"}
                                                    </p>
                                                    <code className="text-xs text-red-100 font-mono break-words block bg-black/50 p-2 rounded w-full text-left">
                                                        {error}
                                                    </code>
                                                    <button
                                                        onClick={() => window.location.reload()}
                                                        className="bg-red-600 text-white font-header text-sm px-6 py-2 rounded shadow-[0_4px_0_#991b1b] hover:bg-red-500 active:shadow-none active:translate-y-[4px] transition-all"
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="animate-spin text-white/20">
                                                    <Sprite name="weejoker" width={48} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Nav */}
                        <button onClick={() => canGoForward && updateDay(v => v + 1)} disabled={!canGoForward}
                            className={`hidden sm:flex items-center justify-center w-14 flex-shrink-0 rounded-xl transition-all duration-75 ease-out border-[2px] border-black/20 ${!canGoForward ? 'bg-[#5c1a1a] shadow-[0_4px_0_#3d1111] opacity-50 cursor-not-allowed' : 'bg-[var(--balatro-red)] shadow-[0_4px_0_var(--balatro-red-dark)] hover:bg-[var(--balatro-red-dark)] hover:shadow-[0_4px_0_var(--balatro-red-darker)] hover:brightness-100 active:shadow-none active:translate-y-[4px]'}`}
                        >
                            <ChevronRight size={36} className={!canGoForward ? "text-[#8a2e2e] drop-shadow-sm" : "text-white drop-shadow-md"} strokeWidth={5} />
                        </button>
                        {/* Mobile Right Nav */}
                        <button onClick={() => canGoForward && updateDay(v => v + 1)} disabled={!canGoForward}
                            className={`sm:hidden absolute right-0 top-0 bottom-0 z-40 w-12 flex items-center justify-center transition-all duration-75 ease-out rounded-r-md ${!canGoForward ? 'bg-[#5c1a1a]/90 backdrop-blur-sm opacity-50 cursor-not-allowed' : 'bg-black/10 hover:bg-black/30 active:bg-black/50'}`}
                        >
                            <ChevronRight size={48} className={!canGoForward ? "text-[#8a2e2e] drop-shadow-sm" : "text-white drop-shadow-md"} strokeWidth={4} />
                        </button>
                    </div>

                    {/* "FAKE BANNER AD" FOOTER */}
                    <div className="w-full max-w-[95vw] sm:max-w-lg px-2 sm:px-0 z-40 shrink-0">
                        <AdRotator
                            onOpenWisdom={() => setViewMode('wisdom')}
                            onOpenLeaderboard={() => setShowLeaderboard(true)}
                            topScore={topScore}
                            isLocked={viewingDay > todayNumber}
                        />
                    </div>
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
                    className="w-full bg-[var(--balatro-orange)] text-white font-header text-xl px-8 py-3 rounded-lg shadow-[0_4px_0_#000] hover:brightness-110 border-none active:shadow-none active:translate-y-[4px] transition-all duration-75 ease-out uppercase tracking-widest mt-2"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
