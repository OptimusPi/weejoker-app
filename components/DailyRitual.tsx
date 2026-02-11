"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DayHeader } from "./DayHeader";
import { RitualChallengeBoard } from "./RitualChallengeBoard";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { cn } from "@/lib/utils";

import { ritualConfig } from "@/lib/config";

export const getDayNumber = (epoch: number) => {
    if (!epoch) return 0;
    const now = Date.now();
    const diff = now - epoch;
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
};

export function DailyRitual({ ritualId: propId, initialDay = 0 }: { ritualId?: string, initialDay?: number }) {
    const defaultRitualId = propId || ritualConfig.id;
    const [ritualId, setRitualId] = useState(defaultRitualId);
    const [configLoading, setConfigLoading] = useState(true);
    const [serverToday, setServerToday] = useState(1);

    // Initialize specific viewing day from server prop (SSR safe)
    const [viewingDay, setViewingDay] = useState<number>(initialDay);

    const [mounted, setMounted] = useState(false);
    const [seedsList, setSeedsList] = useState<string[]>([]);
    const [jamlConfig, setJamlConfig] = useState<string | null>(null);
    const [ritualTitle, setRitualTitle] = useState(ritualConfig.title);
    const [ritualTagline, setRitualTagline] = useState(ritualConfig.tagline);
    const [activeEpoch, setActiveEpoch] = useState(ritualConfig.epoch);
    const [defaultObjective, setDefaultObjective] = useState(ritualConfig.defaultObjective);

    // Simplified: always use serverToday if available, or compute locally (as backup)
    const todayNumber = serverToday || getDayNumber(activeEpoch);

    // Cache to prevent redundant re-fetches
    const [ritualCache, setRitualCache] = useState<Record<number, { seed: string, jaml: string }>>({});

    // Modals
    const [showSubmit, setShowSubmit] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Mount Effect
    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync URL when viewingDay changes (skip initial mount if it matches)
    useEffect(() => {
        if (!mounted) return;
        const url = new URL(window.location.href);
        const currentParam = url.searchParams.get('day');
        if (currentParam !== viewingDay.toString()) {
            url.searchParams.set('day', viewingDay.toString());
            window.history.pushState({}, '', url);
        }
    }, [viewingDay, mounted]);

    // Load Ritual Config
    useEffect(() => {
        setConfigLoading(true);

        async function loadConfig() {
            try {
                // Determine day to fetch: viewingDay > 0 ? viewingDay : null (latest)
                const fetchDay = viewingDay > 0 ? viewingDay : null;

                // 0. Check Cache First
                if (fetchDay && ritualCache[fetchDay]) {
                    const cached = ritualCache[fetchDay];
                    setJamlConfig(cached.jaml);
                    setSeedsList([cached.seed]);
                    // setViewingDay(fetchDay); // Don't self-update if we are already here
                    setConfigLoading(false);
                    return;
                }

                // 1. Fetch Ritual Config
                const url = `/api/rituals/${ritualId}${fetchDay ? `?day=${fetchDay}` : ''}`;
                const configRes = await fetch(url);
                if (!configRes.ok) {
                    const errorData = await configRes.json();
                    throw new Error(errorData.error || "Failed to load ritual");
                }
                const config = await configRes.json();

                setRitualTitle(config.title);
                setRitualTagline(config.tagline);
                const epoch = new Date(config.epoch).getTime();
                setActiveEpoch(epoch);
                setServerToday(config.today || 1);

                setJamlConfig(config.jamlConfig);
                setSeedsList(Array.isArray(config.seeds) && config.seeds.length > 0 ? config.seeds : (config.currentSeed ? [config.currentSeed] : []));

                // Only update viewingDay if we were in "latest" mode (0) and got a specific day
                if (viewingDay === 0 && config.dayNumber) {
                    setViewingDay(config.dayNumber);
                }

                // Update Cache
                if (config.currentSeed && config.dayNumber) {
                    setRitualCache(prev => ({
                        ...prev,
                        [config.dayNumber]: {
                            seed: config.currentSeed,
                            jaml: config.jamlConfig,
                            title: config.title,
                            tagline: config.tagline
                        }
                    }));
                }

            } catch (err: any) {
                console.error("Ritual Fetch Error:", err);
                if (err.message.includes("future")) {
                    setSeedsList([]);
                }
            } finally {
                setConfigLoading(false);
            }
        }

        loadConfig();
    }, [ritualId, viewingDay]);

    // Get Current Seed
    const currentSeedId = useMemo(() => {
        // If we have history, lookup by day index (1-based -> 0-based)
        if (seedsList.length > 1 && viewingDay > 0) {
            return seedsList[viewingDay - 1] || null;
        }
        // Fallback for single-seed mode
        return seedsList[0] || (viewingDay <= todayNumber ? (seedsList.length > 0 ? seedsList[0] : null) : null);
    }, [seedsList, viewingDay, todayNumber]);

    // Run Analyzer - Guard against LOCKED
    const analyzerSeed = currentSeedId === 'LOCKED' ? null : currentSeedId;
    const { data: analysisData, loading: analysisLoading, error: analysisError } = useSeedAnalyzer(analyzerSeed);

    // Objectives Parsing
    const objectives = useMemo(() => {
        if (!jamlConfig) return ["Wee Joker"];
        const mustBlock = jamlConfig.split('must:')[1]?.split('should:')[0]?.split('mustNot:')[0];
        if (mustBlock) {
            const values: string[] = [];
            const valueMatches = mustBlock.matchAll(/value:\s*([^ \n#]+)/g);
            for (const match of valueMatches) {
                values.push(match[1].trim());
            }
            return values.length > 0 ? values : ["Wee Joker"];
        }
        return ["Wee Joker"];
    }, [jamlConfig]);

    const handleCopySeed = useCallback(() => {
        if (currentSeedId) {
            navigator.clipboard.writeText(currentSeedId);
        }
    }, [currentSeedId]);

    // Simplified: always use serverToday if available, or compute locally (as backup)
    const canGoBack = viewingDay > 0;
    const canGoForward = viewingDay < todayNumber + 1;

    const displayDate = viewingDay > 0
        ? new Date(activeEpoch + (viewingDay - 1) * 86400000).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
        : "PRE-LAUNCH";



    // Helper to update day and ensure we scroll top or reset state if needed
    const updateDay = (newDay: number) => {
        setViewingDay(newDay);
    };



    return (
        <div className="ritual-locked-layout h-[100svh] overflow-hidden flex flex-col">
            {/* Header */}
            <header className="w-full max-w-5xl px-4 py-4 shrink-0 z-20 mx-auto">
                <DayHeader
                    dayNumber={viewingDay}
                    displayDate={displayDate}
                />
            </header>

            {/* Main Content Areas */}
            <main className="match-height-content z-10 flex-1 min-h-0 relative">
                {viewingDay <= 0 && !configLoading ? (
                    <div className="w-full max-w-xl aspect-[4/3] flex flex-col items-center justify-center p-12 text-center">
                        <div className="balatro-panel border-white/10 bg-black/20 p-8">
                            <h3 className="font-header text-3xl text-[var(--balatro-gold)] mb-4">{ritualTitle}</h3>
                            <div className="flex justify-between items-center py-1 border-y border-white/10 text-[13px] font-pixel text-white/40 tracking-[0.2em]">
                                The Weepoch begins {new Date(activeEpoch).toLocaleDateString()}
                            </div>
                            <div className="flex flex-col gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowHowTo(true)}
                                    className="balatro-button balatro-button-blue text-sm w-full"
                                >
                                    How to Play
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateDay(Math.max(1, todayNumber))}
                                    className="balatro-button balatro-button-grey text-sm w-full"
                                >
                                    Go to Today (Day {Math.max(1, todayNumber)})
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full px-4 max-w-4xl h-full min-h-0 flex flex-col justify-center">
                        {configLoading || analysisLoading ? (
                            <div className="flex flex-col items-center gap-8 py-20 animate-pulse">
                                <div className="animate-spin text-white/10 grayscale">
                                    <Sprite name="weejoker" width={64} />
                                </div>
                                <div className="font-pixel text-white/20 text-xs tracking-[0.4em]">
                                    {configLoading ? "Connecting to Ritual Factory..." : "Reading Seed Data..."}
                                </div>
                            </div>
                        ) : viewingDay > todayNumber + 1 ? (
                            // HYPE CARD: Day 3+ (Future Preview)
                            <div className="balatro-panel border-blue-500/20 bg-blue-950/10 p-12 text-center max-w-md mx-auto">
                                <div className="mb-6 opacity-50"><Sprite name="eternal" width={64} /></div>
                                <h3 className="font-header text-blue-400 text-2xl uppercase mb-3 tracking-[0.2em]">Future Vision</h3>
                                <p className="font-pixel text-blue-300/40 text-xs leading-relaxed mb-6">
                                    The spirits are still gathering energy for Day {viewingDay}.<br />
                                    This ritual has not yet manifested in our timeline.
                                </p>
                                <div className="font-pixel text-[10px] text-white/20 uppercase tracking-[0.3em]">
                                    Coming Soon
                                </div>
                            </div>
                        ) : analysisError || !currentSeedId ? (
                            <div className="balatro-panel border-red-500/20 bg-red-950/20 p-12 text-center max-w-md mx-auto">
                                <h3 className="font-header text-red-400 text-2xl uppercase mb-3">Ritual Lost</h3>
                                <p className="font-pixel text-red-300/40 text-xs leading-relaxed">
                                    The spirits failed to provide data for Day {viewingDay}. <br />
                                    Check your connection or return to today.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => updateDay(todayNumber)}
                                    className="balatro-button balatro-button-blue mt-6 text-sm"
                                >
                                    Back to Today
                                </button>
                            </div>
                        ) : (
                            <RitualChallengeBoard
                                seed={currentSeedId}
                                objectives={objectives}
                                onCopy={handleCopySeed}
                                onShowHowTo={() => setShowHowTo(true)}
                                onOpenSubmit={() => setShowSubmit(true)}
                                onOpenLeaderboard={() => setShowLeaderboard(true)}
                                isLocked={viewingDay > todayNumber}
                                dayNumber={viewingDay}
                                ritualId={ritualId}
                                onPrevDay={() => updateDay(Math.max(0, viewingDay - 1))}
                                onNextDay={() => updateDay(Math.min(todayNumber + 1, viewingDay + 1))}
                                canGoBack={canGoBack}
                                canGoForward={canGoForward}
                            />
                        )}
                    </div>
                )}
            </main>

            {/* Modals */}
            <HowToPlay
                isOpen={showHowTo}
                onClose={() => setShowHowTo(false)}
                seedId={currentSeedId || undefined}
                objectiveName={defaultObjective}
            />

            {showSubmit && currentSeedId && (
                <SubmitScoreModal
                    seed={currentSeedId}
                    ritualId={ritualId}
                    onClose={() => setShowSubmit(false)}
                    onSuccess={() => {
                        setShowSubmit(false);
                        setShowLeaderboard(true);
                    }}
                />
            )}

            {showLeaderboard && (
                <LeaderboardModal
                    ritualId={ritualId}
                    seed={currentSeedId || "UNKNOWN"}
                    onClose={() => setShowLeaderboard(false)}
                />
            )}
        </div>
    );
}
