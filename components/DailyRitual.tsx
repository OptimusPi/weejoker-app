"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { RitualChallengeBoard } from "./RitualChallengeBoard";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { cn } from "@/lib/utils";

import { ritualConfig } from "@/lib/config";

type RitualCacheEntry = {
    seed: string;
    jaml: string;
    title: string;
    tagline: string;
    defaultObjective: string;
};

export const getDayNumber = (epoch: number) => {
    if (!epoch) return 0;
    const now = Date.now();
    const diff = now - epoch;
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
};

export function DailyRitual({ ritualId: propId, initialDay = 0 }: { ritualId?: string, initialDay?: number }) {
    const defaultRitualId = propId || ritualConfig.id;
    const [ritualId] = useState(defaultRitualId);
    const [configLoading, setConfigLoading] = useState(false);
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
    const [ritualCache, setRitualCache] = useState<Record<number, RitualCacheEntry>>({});

    // Modals
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
                    setJamlConfig(cached.jaml);
                    setSeedsList([cached.seed]);
                    setRitualTitle(cached.title);
                    setRitualTagline(cached.tagline);
                    setDefaultObjective(cached.defaultObjective);
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

                console.log(`[DailyRitual] Received config:`, {
                    title: config.title,
                    seedCount: config.seeds?.length,
                    hasJaml: !!config.jamlConfig,
                    today: config.today,
                    dayNumber: config.dayNumber,
                    currentSeed: config.currentSeed,
                    seedsIsArray: Array.isArray(config.seeds),
                    firstFewSeeds: config.seeds?.slice(0, 3)
                });

                setRitualTitle(config.title);
                setRitualTagline(config.tagline);
                setDefaultObjective(config.defaultObjective || ritualConfig.defaultObjective);
                const epoch = new Date(config.epoch).getTime();
                setActiveEpoch(epoch);
                setServerToday(config.today || 1);

                setJamlConfig(config.jamlConfig);

                // Set seeds list - ensure we're using the full array
                if (Array.isArray(config.seeds) && config.seeds.length > 0) {
                    console.log(`[DailyRitual] Setting ${config.seeds.length} seeds`);
                    setSeedsList(config.seeds);
                } else if (config.currentSeed) {
                    console.log(`[DailyRitual] Fallback to single currentSeed: ${config.currentSeed}`);
                    setSeedsList([config.currentSeed]);
                } else {
                    console.warn(`[DailyRitual] No seeds available!`);
                    setSeedsList([]);
                }

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
                    setSeedsList([]);
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
        // If we have history, lookup by day index (1-based -> 0-based)
        if (seedsList.length > 1 && viewingDay > 0) {
            const seed = seedsList[viewingDay - 1] || null;
            console.log(`[DailyRitual] Looking up seed for day ${viewingDay} from ${seedsList.length} seeds: ${seed}`);
            return seed;
        }
        // Fallback for single-seed mode
        const fallback = seedsList[0] || (viewingDay <= todayNumber ? (seedsList.length > 0 ? seedsList[0] : null) : null);
        console.log(`[DailyRitual] Using fallback seed: ${fallback}, seedsList length: ${seedsList.length}`);
        return fallback;
    }, [seedsList, viewingDay, todayNumber]);

    // Run Analyzer - Guard against LOCKED
    const analyzerSeed = currentSeedId === 'LOCKED' ? null : currentSeedId;
    const { data: analysisData, loading: analysisLoading, error: analysisError } = useSeedAnalyzer(analyzerSeed);

    const showLoading = configLoading || analysisLoading;

    // Objectives Parsing
    const objectives = useMemo(() => {
        if (!jamlConfig) return [defaultObjective];
        const mustBlock = jamlConfig.split('must:')[1]?.split('should:')[0]?.split('mustNot:')[0];
        if (mustBlock) {
            const values: string[] = [];
            const valueMatches = mustBlock.matchAll(/value:\s*([^ \n#]+)/g);
            for (const match of valueMatches) {
                values.push(match[1].trim());
            }
            return values.length > 0 ? values : [defaultObjective];
        }
        return [defaultObjective];
    }, [defaultObjective, jamlConfig]);

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
        <div className="flex flex-col h-full min-h-0">
            {/* Main Content Areas - Mobile First Scaling */}
            <main className="z-10 flex-1 min-h-0 relative overflow-auto">
                {viewingDay <= 0 && !configLoading ? (
                    <div className="w-full max-w-full md:max-w-xl aspect-[4/3] flex flex-col items-center justify-center p-4 md:p-12 text-center">
                        <div className="jimbo-panel p-4 md:p-8">
                            <h3 className="font-header text-2xl md:text-3xl text-[var(--jimbo-gold)] mb-2 md:mb-4">{ritualTitle}</h3>
                            <div className="flex justify-between items-center py-1 border-y border-[var(--jimbo-panel-edge)] text-[11px] md:text-[13px] font-pixel text-[var(--jimbo-grey)] tracking-[0.1em] md:tracking-[0.2em]">
                                The Weepoch begins {new Date(activeEpoch).toLocaleDateString()}
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
                                    onClick={() => updateDay(Math.max(1, todayNumber))}
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
                                    onClick={() => updateDay(todayNumber)}
                                    className="jimbo-btn jimbo-btn-blue mt-4 md:mt-6 text-xs md:text-sm"
                                >
                                    Back to Today
                                </button>
                            </div>
                        ) : (
                            <RitualChallengeBoard
                                seed={currentSeedId || 'LOCKED'}
                                objectives={objectives}
                                ritualTitle={ritualTitle}
                                onCopy={handleCopySeed}
                                onShowHowTo={() => setShowHowTo(true)}
                                onOpenSubmit={() => setShowSubmit(true)}
                                onOpenLeaderboard={() => setShowLeaderboard(true)}
                                isLocked={viewingDay > todayNumber}
                                dayNumber={viewingDay}
                                ritualId={ritualId}
                                onPrevDay={() => updateDay(Math.max(0, viewingDay - 1))}
                                onNextDay={() => updateDay(Math.min(todayNumber + 1, viewingDay + 1))}
                                jamlConfig={jamlConfig || ''}
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
