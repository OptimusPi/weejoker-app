"use client";

import { SeedData } from "@/lib/types";
import { ChevronLeft, ChevronRight, Star, Trophy, HeartHandshake } from "lucide-react";
import { SeedCard } from "./SeedCard";
import { useState, useEffect, useRef, useCallback } from "react";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";

import { AdRotator } from "./AdRotator";
import Image from "next/image";


// Day calculation
const EPOCH = new Date('2025-12-20T00:00:00Z').getTime(); // Dec 20 = Day 1
// WEEPOCH (Day 0) = Dec 19 (UTC Today)
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

    const loadDayData = useCallback(async (day: number) => {
        // 1. Get Seed from Local Schedule
        // Schedule is 0-indexed (Day 1 = Index 0)
        const seedRaw = schedule[day - 1];

        if (day > getDayNumber()) {
            // Future Hype Mode: Load data but it will be visually locked
            if (!seedRaw) {
                setSeeds([]);
                if (schedule.length > 0) setError("Future seed not found.");
            } else {
                const seedData: SeedData = {
                    seed: seedRaw.id,
                    score: seedRaw.s,
                    twos: seedRaw.w,
                    WeeJoker_Ante1: seedRaw.wj1,
                    WeeJoker_Ante2: seedRaw.wj2,
                    HanginChad_Ante1: seedRaw.hc1,
                    HanginChad_Ante2: seedRaw.hc2,
                    Hack_Ante1: seedRaw.hk1,
                    Hack_Ante2: seedRaw.hk2,
                    blueprint_early: seedRaw.bp,
                    brainstorm_early: seedRaw.bs,
                    Showman_Ante1: seedRaw.sh,
                    red_Seal_Two: seedRaw.rs,
                    themeName: seedRaw.t,
                    themeJoker: seedRaw.j,
                    themeCardAnte1: seedRaw.t1,
                    themeCardAnte2: seedRaw.t2
                };
                setSeeds([seedData]);
                setError(null);
            }
        } else if (seedRaw) {
            // Current or Past Day
            const seedData: SeedData = {
                seed: seedRaw.id,
                score: seedRaw.s,
                twos: typeof seedRaw.w === 'number' ? seedRaw.w : (parseInt(seedRaw.w as any) || 0),
                WeeJoker_Ante1: seedRaw.wj1,
                WeeJoker_Ante2: seedRaw.wj2,
                HanginChad_Ante1: seedRaw.hc1,
                HanginChad_Ante2: seedRaw.hc2,
                Hack_Ante1: seedRaw.hk1,
                Hack_Ante2: seedRaw.hk2,
                blueprint_early: seedRaw.bp,
                brainstorm_early: seedRaw.bs,
                Showman_Ante1: seedRaw.sh,
                red_Seal_Two: seedRaw.rs,
                themeName: seedRaw.t,
                themeJoker: seedRaw.j,
                themeCardAnte1: seedRaw.t1,
                themeCardAnte2: seedRaw.t2
            };
            setSeeds([seedData]);
            setError(null);
        } else {
            setSeeds([]);
            if (schedule.length > 0) setError("Seed not found.");
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
    }, [schedule]);

    useEffect(() => {
        if (!mounted) return;
        loadDayData(viewingDay);
    }, [viewingDay, mounted, loadDayData]);


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
        const date = new Date(EPOCH + (day - 1) * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getTheme = (day: number, seedData: SeedData | null) => {
        if (seedData?.themeName) {
            const name = seedData.themeName;
            // Map Colors to Themes
            let color = "var(--balatro-gold)";
            let icon = "👁️";

            if (name.includes("Madness")) { color = "var(--balatro-red)"; icon = "🔥"; }
            else if (name.includes("Twosday")) { color = "var(--balatro-blue)"; icon = "2️⃣"; }
            else if (name.includes("Wee")) { color = "var(--balatro-green)"; icon = "🃏"; }
            else if (name.includes("Threshold")) { color = "var(--balatro-orange)"; icon = "⚖️"; }
            else if (name.includes("Foil")) { color = "var(--balatro-blue)"; icon = "📐"; }
            else if (name.includes("Weekend")) { color = "var(--balatro-gold)"; icon = "🎩"; }

            return { name, color, icon };
        }

        const date = new Date(EPOCH + (day - 1) * 24 * 60 * 60 * 1000);
        const dayOfWeek = date.getUTCDay(); // 0 is Sunday, 1 is Monday...

        const defaultThemes = [
            { name: "Weekend Ritual", color: "var(--balatro-gold)", icon: "🔥" },    // Sunday
            { name: "Madness Monday", color: "var(--balatro-red)", icon: "🔥" },    // Monday
            { name: "Twosday", color: "var(--balatro-blue)", icon: "2️⃣" },           // Tuesday
            { name: "Wee Wednesday", color: "var(--balatro-green)", icon: "🃏" },        // Wednesday
            { name: "Threshold Thursday", color: "var(--balatro-orange)", icon: "💻" }, // Thursday
            { name: "Foil Friday", color: "var(--balatro-blue)", icon: "📐" },   // Friday
            { name: "Weekend Ritual", color: "var(--balatro-gold)", icon: "🎩" },   // Saturday
        ];

        return defaultThemes[dayOfWeek] || defaultThemes[0];
    };

    const currentTheme = getTheme(viewingDay, seed);

    if (!mounted) return null;

    return (
        <div className="h-[100dvh] w-full relative overflow-hidden bg-transparent">
            {/* MAIN VIEW */}
            <div className="absolute inset-0 z-10 flex flex-col items-center overflow-hidden">
                {/* HERO STAGE - ANCHORED LAYOUT */}
                <div className="h-[100dvh] w-full relative z-10 flex flex-col items-center">

                    {/* Top Anchor Area - Centered but compact */}
                    <div className="flex-shrink-0 w-full flex items-center justify-center p-0.5 min-h-0 overflow-hidden mt-6 mb-2">
                        <div className="text-center w-full relative z-20 px-4">
                            <div className="font-header font-normal text-3xl sm:text-4xl text-white tracking-wider uppercase leading-none mb-1 select-none drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                THE DAILY WEE
                            </div>
                            <div className="w-full max-w-sm mx-auto flex flex-col gap-1">
                                <div className="flex justify-between items-center py-0.5 border-y border-white/10 text-[8px] font-pixel text-white/40 uppercase tracking-[0.2em]">
                                    <span>{getDayDisplay(viewingDay)}</span>
                                    <span>Est. 2025</span>
                                </div>
                                {/* Theme Badge */}
                                <div
                                    className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-header tracking-widest self-center shadow-lg"
                                    style={{ backgroundColor: currentTheme.color, color: 'white' }}
                                >
                                    <span>{currentTheme.icon}</span>
                                    <span className="mt-[2px]">{currentTheme.name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Interaction Area - FIXED HEIGHT NO JUMP */}
                    <div className="flex flex-row items-stretch justify-center gap-2 w-full max-w-[22rem] mx-auto p-0 relative z-30 h-[380px] shrink-0">
                        {/* Left Nav Button */}
                        <button
                            onClick={() => canGoBack && updateDay(v => v - 1)}
                            disabled={!canGoBack}
                            className="balatro-nav-button"
                        >
                            <ChevronLeft size={24} className="text-white" strokeWidth={4} />
                        </button>


                        {/* Central Stage - STRICT HEIGHT */}
                        <div className="relative flex-1 z-20 flex flex-col min-w-0 overflow-hidden shadow-[0_4px_0_rgba(0,0,0,0.2)]">
                            {viewingDay === 0 ? (
                                // WEEPOCH CARD (Day 0) - PREMIUM ACRYLIC CONTRAST
                                <div className="acrylic-card p-6 flex flex-col items-center justify-center text-center relative h-full">
                                    <div className="text-4xl mb-4 drop-shadow-2xl grayscale brightness-150">
                                        <Sprite name="weejoker" width={64} />
                                    </div>
                                    <h3 className="font-header text-4xl text-[var(--balatro-gold)] mb-2 uppercase tracking-[0.2em] drop-shadow-md">WEEPOCH</h3>
                                    <div className="w-12 h-0.5 bg-[var(--balatro-gold)]/30 mb-4" />
                                    <p className="font-pixel text-white/50 text-sm max-w-[80%] mx-auto leading-relaxed">
                                        Project Zero Point.<br />Where the ritual first began.
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full h-full relative flex flex-col">
                                    {seed ? (
                                        <SeedCard
                                            seed={seed}
                                            dayNumber={viewingDay}
                                            className="w-full h-full"
                                            onAnalyze={() => setShowHowTo(true)}
                                            onOpenSubmit={() => setShowSubmit(true)}
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
                        <button
                            onClick={() => canGoForward && updateDay(v => v + 1)}
                            disabled={!canGoForward}
                            className="balatro-nav-button"
                        >
                            <ChevronRight size={24} className="text-white" strokeWidth={4} />
                        </button>

                    </div>

                    {/* Bottom Fixed Area - Tightened spacing */}
                    <div className="w-full flex-shrink-0 pt-1 pb-2">
                        <div className="w-full max-w-[22rem] mx-auto">
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

                {showHowTo && (
                    <HowToPlay
                        onClose={() => setShowHowTo(false)}
                        themeName={currentTheme.name}
                        seedId={seed?.seed || '--------'}
                        onSubmit={() => { setShowHowTo(false); setShowSubmit(true); }}
                    />
                )}
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
            <div className="balatro-panel p-8 flex flex-col gap-6 items-center relative overflow-hidden">

                {/* Header Row: Sprite + Text */}
                <div className="flex items-center gap-4 w-full justify-center">
                    <Sprite name="weejoker" width={48} className="drop-shadow-lg" />
                    <h3 className="text-[var(--balatro-blue)] font-header text-3xl tracking-widest drop-shadow-md">
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

                    <div className="pt-4 border-t-2 border-dashed border-white/20 flex flex-col sm:flex-row gap-4 justify-between items-center w-full text-left">
                        <span className="text-xs font-pixel text-white/60 italic">
                            Got 8 minutes? Call a friend today.
                        </span>
                        <a
                            href="https://findahelpline.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="balatro-button balatro-button-blue text-xs flex items-center gap-2"
                        >
                            <HeartHandshake size={16} />
                            Find Support
                        </a>
                    </div>
                </div>

                {/* Back Button - Full Width Orange Style */}
                <button
                    onClick={onBack}
                    className="balatro-button-back mt-2"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
