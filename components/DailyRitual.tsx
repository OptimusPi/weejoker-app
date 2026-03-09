"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RitualChallengeBoard } from "./RitualChallengeBoard";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { parseJamlToFilter } from "@/lib/hooks/useJamlFilter";
import { parseJamlToObjectives } from "@/lib/jaml/jamlObjectives";
import { cn } from "@/lib/utils";
import { ritualConfig } from "@/lib/config";

type RitualCacheEntry = {
    seed: string;
    jaml: string;
    title: string;
    tagline: string;
    defaultObjective: string;
};

type RitualRuntimeState = {
    title: string;
    tagline: string;
    epoch: number;
    today: number;
    defaultObjective: string;
    jamlConfig: string;
    seeds: string[];
};

export function DailyRitual({ ritualId: propId, initialDay = 0 }: { ritualId?: string, initialDay?: number }) {
    const ritualId = propId || ritualConfig.id;
    const [configLoading, setConfigLoading] = useState(false);

    // Initialize specific viewing day from server prop (SSR safe)
    const [viewingDay, setViewingDay] = useState<number>(initialDay);

    const [mounted, setMounted] = useState(false);
    const [ritualRuntime, setRitualRuntime] = useState<RitualRuntimeState>({
        title: ritualConfig.title,
        tagline: ritualConfig.tagline,
        epoch: ritualConfig.epoch,
        today: 1,
        defaultObjective: ritualConfig.defaultObjective,
        jamlConfig: '',
        seeds: [],
    });

    const todayNumber = ritualRuntime.today;

    // Cache to prevent redundant re-fetches
    const [ritualCache, setRitualCache] = useState<Record<number, RitualCacheEntry>>({});

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

    // Load Ritual Config (with Debounced Loading State)
    useEffect(() => {
        let active = true;
        // Only show full loading spinner if it takes more than 200ms
        const timer = setTimeout(() => {
            if (active) setConfigLoading(true);
        }, 200);

        async function loadConfig() {
            try {
                // Determine day to fetch: viewingDay > 0 ? viewingDay : null (latest)
                const fetchDay = viewingDay > 0 ? viewingDay : null;

                // 0. Check Cache First
                if (fetchDay && ritualCache[fetchDay]) {
                    const cached = ritualCache[fetchDay];
                    setRitualRuntime(prev => ({
                        ...prev,
                        title: cached.title,
                        tagline: cached.tagline,
                        defaultObjective: cached.defaultObjective,
                        jamlConfig: cached.jaml,
                        seeds: [cached.seed],
                    }));
                    // setViewingDay(fetchDay); // Don't self-update if we are already here
                    if (active) {
                        clearTimeout(timer);
                        setConfigLoading(false);
                    }
                    return;
                }

                // 1. Fetch Ritual Config
                const url = `/api/rituals/${ritualId}${fetchDay ? `?day=${fetchDay}` : ''}`;
                const configRes = await fetch(url);
                if (!configRes.ok) {
                    const text = await configRes.text();
                    let errorMsg = `Failed to load ritual (${configRes.status})`;
                    try { errorMsg = JSON.parse(text).error || errorMsg; } catch { }
                    throw new Error(errorMsg);
                }
                const config = await configRes.json() as {
                    title: string;
                    tagline: string;
                    epoch: string;
                    today: number;
                    defaultObjective?: string;
                    jamlConfig: string;
                    seeds: string[];
                    currentSeed?: string;
                    dayNumber?: number;
                };

                if (!active) return;

                console.log('[DailyRitual] Received config for day', config.dayNumber, '— seeds:', config.seeds?.length);

                const nextSeeds = Array.isArray(config.seeds) && config.seeds.length > 0
                    ? config.seeds
                    : config.currentSeed
                        ? [config.currentSeed]
                        : [];

                if (nextSeeds.length === 0) {
                    console.warn(`[DailyRitual] No seeds available!`);
                }

                setRitualRuntime({
                    title: config.title,
                    tagline: config.tagline,
                    epoch: new Date(config.epoch).getTime(),
                    today: config.today || 1,
                    defaultObjective: config.defaultObjective || ritualConfig.defaultObjective,
                    jamlConfig: config.jamlConfig,
                    seeds: nextSeeds,
                });

                // Only update viewingDay if we were in "latest" mode (0) and got a specific day
                if (viewingDay === 0 && config.dayNumber) {
                    setViewingDay(config.dayNumber);
                }

                // Update Cache
                if (config.currentSeed && config.dayNumber) {
                    const dayNum = config.dayNumber;
                    setRitualCache(prev => ({
                        ...prev,
                        [dayNum]: {
                            seed: config.currentSeed!,
                            jaml: config.jamlConfig,
                            title: config.title,
                            tagline: config.tagline,
                            defaultObjective: config.defaultObjective || ritualConfig.defaultObjective
                        }
                    }));
                }

                // Cache it for today
                if (config.dayNumber) {
                    const dayNum = config.dayNumber;
                    const cachedStr = localStorage.getItem('ritual_status');
                    const cached = cachedStr ? JSON.parse(cachedStr) : {};
                    const newCache = {
                        ...cached,
                        [dayNum]: {
                            score: 0, // Placeholder
                            status: 'unlocked'
                        }
                    };
                    localStorage.setItem('ritual_status', JSON.stringify(newCache));
                }

            } catch (err: any) {
                console.error("Ritual Fetch Error:", err);
                if (err.message.includes("future")) {
                    setRitualRuntime(prev => ({ ...prev, seeds: [] }));
                }
            } finally {
                if (active) {
                    clearTimeout(timer);
                    setConfigLoading(false);
                }
            }
        }

        loadConfig();

        return () => {
            active = false;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ritualId, viewingDay]);

    // Get Current Seed
    const currentSeedId = useMemo(() => {
        const seed = ritualRuntime.seeds.length > 1 && viewingDay > 0
            ? (ritualRuntime.seeds[viewingDay - 1] ?? null)
            : (ritualRuntime.seeds[0] ?? null);
        return seed;
    }, [ritualRuntime.seeds, viewingDay]);

    const showLoading = configLoading;
    const ritualFilter = useMemo(() => parseJamlToFilter(ritualRuntime.jamlConfig || ''), [ritualRuntime.jamlConfig]);
    const ritualDeck = ritualFilter.deck || 'Erratic';
    const ritualStake = ritualFilter.stake || 'White';

    // Objectives — extract must-clause values from parsed JAML
    const objectives = useMemo(() => {
        if (!ritualRuntime.jamlConfig) return [ritualRuntime.defaultObjective];
        try {
            const parsed = parseJamlToObjectives(ritualRuntime.jamlConfig);
            return parsed.length > 0 ? parsed : [ritualRuntime.defaultObjective];
        } catch {
            return [ritualRuntime.defaultObjective];
        }
    }, [ritualRuntime.defaultObjective, ritualRuntime.jamlConfig]);

    const handleCopySeed = useCallback(() => {
        if (currentSeedId) {
            navigator.clipboard.writeText(currentSeedId);
        }
    }, [currentSeedId]);

    // Simplified: always use serverToday if available, or compute locally (as backup)
    const canGoBack = viewingDay > 0;
    const canGoForward = viewingDay < todayNumber + 1;

    const displayDate = viewingDay > 0
        ? new Date(ritualRuntime.epoch + (viewingDay - 1) * 86400000).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
        : "PRE-LAUNCH";



    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Main Content Areas - Mobile First Scaling */}
            <main className="z-10 flex-1 min-h-0 relative overflow-auto">
                {viewingDay <= 0 && !configLoading ? (
                    <div className="w-full max-w-full md:max-w-xl aspect-[4/3] flex flex-col items-center justify-center p-4 md:p-12 text-center">
                        <div className="jimbo-panel p-4 md:p-8">
                            <h3 className="font-header text-2xl md:text-3xl text-[var(--jimbo-gold)] mb-2 md:mb-4">{ritualRuntime.title}</h3>
                            <div className="flex justify-between items-center py-1 border-y border-[var(--jimbo-panel-edge)] text-[11px] md:text-[13px] font-pixel text-[var(--jimbo-grey)] tracking-[0.1em] md:tracking-[0.2em]">
                                Epoch begins {new Date(ritualRuntime.epoch).toLocaleDateString()}
                            </div>
                            <div className="flex flex-col gap-2 md:gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowHowTo(true)}
                                    className="jimbo-btn jimbo-btn-blue text-xs md:text-sm"
                                >
                                    How to Play
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewingDay(Math.max(1, todayNumber))}
                                    className="jimbo-btn bg-[var(--jimbo-grey)] text-xs md:text-sm"
                                >
                                    Go to Today (Day {Math.max(1, todayNumber)})
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={cn(
                        "w-full px-1 mx-auto h-full min-h-0 flex flex-col justify-start pt-2"
                    )}>
                        {showLoading ? (
                            <div className="flex flex-col h-full justify-center w-full">
                                <div className="jimbo-panel mx-8 md:mx-12 min-h-[500px] animate-pulse relative overflow-hidden">
                                    {/* Header Skeleton */}
                                    <div className="jimbo-inner-panel p-2 md:p-3 h-[54px] flex items-center shrink-0 mb-3">
                                        <div className="w-24 h-6 bg-[var(--jimbo-panel-edge)] rounded" />
                                    </div>

                                    {/* Body Skeleton */}
                                    <div className="flex flex-col gap-4 flex-1 w-full">
                                        {/* Deck Fan */}
                                        <div className="w-full rounded-lg aspect-[2/1] bg-[var(--jimbo-panel-edge)] border border-[var(--jimbo-panel-edge)]" />

                                        {/* Jokers */}
                                        <div className="w-full rounded-lg h-16 bg-[var(--jimbo-panel-edge)] border border-[var(--jimbo-panel-edge)]" />

                                        <div className="flex-1" />

                                        {/* Button */}
                                        <div className="w-full h-12 rounded-lg bg-[var(--jimbo-dark-blue)] border border-[var(--jimbo-blue)]" />
                                    </div>
                                </div>
                                <div className="text-center mt-6 font-pixel text-[var(--jimbo-grey)] text-[11px] md:text-xs tracking-[0.2em] md:tracking-[0.4em] animate-pulse absolute bottom-12 left-0 right-0">
                                    {configLoading ? "Connecting to Ritual Factory..." : "Reading Seed Data..."}
                                </div>
                            </div>
                        ) : (!currentSeedId && viewingDay <= todayNumber) ? (
                            <div className="jimbo-panel border-[var(--jimbo-red)] p-6 md:p-12 text-center max-w-full md:max-w-md mx-auto">
                                <h3 className="font-header text-[var(--jimbo-red)] text-xl md:text-2xl mb-2 md:mb-3 uppercase">Ritual Lost</h3>
                                <p className="font-pixel text-[var(--jimbo-grey)] text-[11px] md:text-xs leading-relaxed">
                                    The spirits failed to provide data for Day {viewingDay}. <br />
                                    Check your connection or return to today.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setViewingDay(todayNumber)}
                                    className="jimbo-btn jimbo-btn-blue mt-4 md:mt-6 text-xs md:text-sm"
                                >
                                    Back to Today
                                </button>
                            </div>
                        ) : (
                            <RitualChallengeBoard
                                seed={currentSeedId || 'LOCKED'}
                                objectives={objectives}
                                ritualTitle={ritualRuntime.title}
                                onCopy={handleCopySeed}
                                onShowHowTo={() => setShowHowTo(true)}
                                onOpenSubmit={() => setShowSubmit(true)}
                                onOpenLeaderboard={() => setShowLeaderboard(true)}
                                isLocked={viewingDay > todayNumber}
                                dayNumber={viewingDay}
                                ritualId={ritualId}
                                onPrevDay={() => setViewingDay(Math.max(0, viewingDay - 1))}
                                onNextDay={() => setViewingDay(Math.min(todayNumber + 1, viewingDay + 1))}
                                jamlConfig={ritualRuntime.jamlConfig}
                                canGoBack={canGoBack}
                                canGoForward={canGoForward}
                                displayDate={displayDate}
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
                objectiveName={ritualRuntime.defaultObjective}
                deckName={ritualDeck}
                stakeName={ritualStake}
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
