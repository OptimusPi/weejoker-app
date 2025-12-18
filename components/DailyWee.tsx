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
            return newDay;
        });
    };

    // Synchronize URL with viewingDay state
    useEffect(() => {
        if (!mounted) return;
        const url = new URL(window.location.href);
        if (url.searchParams.get('day') !== viewingDay.toString()) {
            url.searchParams.set('day', viewingDay.toString());
            window.history.pushState({}, '', url);
        }
    }, [viewingDay, mounted]);

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
            // Safe calculation after mount/in useEffect to avoid hydration mismatch
            setViewingDay(getDayNumber());
        }
        setMounted(true);

        // Fetch Schedule Once
        fetch('/daily_ritual.json')
            .then(res => {
                if (!res.ok) throw new Error("The ritual hasn't been baked yet.");
                return res.json();
            })
            .then(data => setSchedule(data))
            .catch(e => {
                console.error("Schedule Error", e);
                setError(e.message || "Failed to load the daily ritual.");
            });

    }, []);

    const [topScore, setTopScore] = useState<{ name: string; score: number } | null>(null);

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

    useEffect(() => {
        if (!mounted) return;
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
        <div className="h-[100dvh] w-full relative overflow-hidden bg-transparent">
            {/* MAIN VIEW */}
            <div className="absolute inset-0 z-10 flex flex-col items-center overflow-hidden">
                {/* HERO STAGE - ANCHORED LAYOUT */}
                <div className="h-[100dvh] w-full relative z-10 flex flex-col items-center">

                    {/* Top Anchor Area - Centers Header in space above card */}
                    <div className="flex-1 w-full flex items-center justify-center p-1 min-h-0 overflow-hidden">
                        <div className="text-center w-full relative z-20 px-4">
                            <div className="flex justify-between w-full max-w-sm mx-auto text-[9px] font-pixel text-white/60 tracking-widest border-b border-white/10 pb-0.5 mb-1 uppercase">
                                <span>Vol. 1</span>
                                <span>{viewingDay < 1 ? 'WEEPOCH' : `No. ${viewingDay}`}</span>
                                <span>200 Chips</span>
                            </div>
                            <div className="font-header text-3xl sm:text-4xl text-white tracking-widest uppercase leading-none mb-1 select-none">
                                THE DAILY WEE
                            </div>
                            <div className="w-full max-w-sm mx-auto">
                                <div className="flex justify-between items-center py-0.5 border-y border-white/10 text-[8px] font-pixel text-white/40 uppercase tracking-[0.2em]">
                                    <span>{getDayDisplay(viewingDay)}</span>
                                    <span>Est. 2025</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Interaction Area - FIXED HEIGHT NO JUMP */}
                    <div className="flex flex-row items-stretch justify-center gap-2 w-full max-w-[22rem] mx-auto p-0 relative z-30 h-[380px] shrink-0">
                        {/* Left Nav Button */}
                        <button onClick={() => canGoBack && updateDay(v => v - 1)} disabled={!canGoBack}
                            className={`flex items-center justify-center w-8 flex-shrink-0 rounded-lg transition-colors ${!canGoBack ? 'bg-[#1a0808] opacity-10' : 'bg-[var(--color-red)] hover:brightness-110 active:brightness-90'}`}
                        >
                            <ChevronLeft size={24} className="text-white" strokeWidth={4} />
                        </button>


                        {/* Central Stage - STRICT HEIGHT */}
                        <div className="relative flex-1 z-20 flex flex-col min-w-0 overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.2)]">
                            {viewingDay === 0 ? (
                                // WEEPOCH CARD (Day 0)
                                <div className="bg-[var(--balatro-modal-bg)] p-4 flex flex-col items-center justify-center text-center relative h-full">
                                    <div className="text-2xl mb-1">🌌</div>
                                    <div className="font-header text-lg text-[var(--balatro-gold)] mb-1 uppercase">Beginning</div>
                                    <p className="font-pixel text-white/30 text-[8px] mb-3 max-w-[80%] mx-auto leading-tight">Project Zero Point.</p>
                                    <button onClick={() => updateDay(1)}
                                        className="bg-[var(--balatro-blue)] text-white font-header text-xs px-3 py-1 rounded hover:brightness-110 active:brightness-90 transition-none"
                                    >
                                        GO TO DAY 1
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full relative flex flex-col">
                                    {seed ? (
                                        <SeedCard
                                            seed={seed}
                                            dayNumber={viewingDay}
                                            className="w-full h-full"
                                            onAnalyze={() => setShowHowTo(true)}
                                            isLocked={viewingDay > todayNumber}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[var(--balatro-grey-dark)]">
                                            {error ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-red-400 font-header text-sm uppercase">{error}</p>
                                                    <button onClick={() => window.location.reload()} className="bg-red-900 text-white font-header text-[9px] px-3 py-1 rounded">Retry</button>
                                                </div>
                                            ) : (
                                                <div className="animate-spin text-white/5"><Sprite name="weejoker" width={24} /></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Nav Button */}
                        <button onClick={() => canGoBack && canGoForward && updateDay(v => v + 1)} disabled={!canGoForward}
                            className={`flex items-center justify-center w-8 flex-shrink-0 rounded-lg transition-colors ${!canGoForward ? 'bg-[#1a0808] opacity-10' : 'bg-[var(--color-red)] hover:brightness-110 active:brightness-90'}`}
                        >
                            <ChevronRight size={24} className="text-white" strokeWidth={4} />
                        </button>

                    </div>

                    {/* Bottom Anchor Area - Centers Ad Rotator in space below card */}
                    <div className="flex-1 w-full flex items-center justify-center p-1 min-h-0">
                        <div className="w-full max-w-[90vw] sm:max-w-sm z-40">
                            <AdRotator
                                onOpenWisdom={() => setViewMode('wisdom')}
                                onOpenLeaderboard={() => setShowLeaderboard(true)}
                                topScore={topScore}
                                isLocked={viewingDay > todayNumber}
                            />
                        </div>
                    </div>
                </div>

                {/* VIEW 2: WEE WISDOM Overlay */}
                <div
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-transform duration-150 ease-out bg-black/95 backdrop-blur-none pointer-events-auto"
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
                        onSuccess={() => {
                            loadDayData(viewingDay);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function WeeWisdom({ onBack }: { onBack: () => void }) {
    return (
        <div className="w-full">
            <div className="bg-[var(--balatro-grey)] border-[3px] border-black/20 rounded-xl p-8 flex flex-col gap-6 items-center shadow-[0_4px_0_rgba(0,0,0,0.3)] relative overflow-hidden">

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
                            className="bg-[var(--balatro-blue)] text-white hover:brightness-110 px-4 py-2 rounded-lg transition-colors font-header text-xs tracking-wider uppercase flex items-center gap-2"
                        >
                            <HeartHandshake size={16} />
                            Lonely? FIND SUPPORT
                        </a>
                    </div>
                </div>

                {/* Back Button - Full Width Orange Style */}
                <button
                    onClick={onBack}
                    className="w-full bg-[var(--balatro-orange)] text-white font-header text-xl px-8 py-3 rounded-lg hover:brightness-110 active:brightness-90 transition-all uppercase tracking-widest mt-2"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
