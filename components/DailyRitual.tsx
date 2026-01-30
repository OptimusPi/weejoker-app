"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DayHeader } from "./DayHeader";
import { RitualChallengeBoard } from "./RitualChallengeBoard";
import { EpochCard } from "./EpochCard";
import { HowToPlay } from "./HowToPlay";
import { SubmitScoreModal } from "./SubmitScoreModal";
import { LeaderboardModal } from "./LeaderboardModal";
import { Sprite } from "./Sprite";
import { useSeedAnalyzer } from "@/lib/hooks/useSeedAnalyzer";
import { cn } from "@/lib/utils";

const EPOCH = new Date('2026-01-06T00:00:00Z').getTime(); // Jan 6, 2026 = Day 1 (Launch)
const RITUAL_ID = "weejoker";

const getDayNumber = () => {
    const now = Date.now();
    const diff = now - EPOCH;
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + 1;
};

export function DailyRitual() {
    const [viewingDay, setViewingDay] = useState<number>(0);
    const [mounted, setMounted] = useState(false);
    const [seedsList, setSeedsList] = useState<string[]>([]);
    const [jamlConfig, setJamlConfig] = useState<string | null>(null);
    const [ritualTitle, setRitualTitle] = useState("The Daily Wee");
    const [ritualTagline, setRitualTagline] = useState("A curated daily Balatro ritual");

    // Modals
    const [showSubmit, setShowSubmit] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    // Load Seed List & JAML Config
    useEffect(() => {
        setMounted(true);

        // Initial day from URL or Today
        const params = new URLSearchParams(window.location.search);
        const dayParam = params.get('day');
        if (dayParam) {
            const dayNum = parseInt(dayParam, 10);
            if (!isNaN(dayNum)) setViewingDay(dayNum);
        } else {
            setViewingDay(getDayNumber());
        }

        // Load Seeds
        fetch('/seeds.csv')
            .then(res => res.text())
            .then(text => {
                let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                if (lines.length > 0 && (lines[0].toLowerCase().includes('seed') || lines[0].toLowerCase().includes('id'))) {
                    lines = lines.slice(1);
                }
                const seeds = lines.map(l => l.split(',')[0].replace(/['"]/g, '').trim());
                setSeedsList(seeds);
            })
            .catch(err => console.error("Failed to load seeds list", err));

        // Load JAML
        fetch('/daily_ritual.jaml')
            .then(res => res.text())
            .then(text => {
                setJamlConfig(text);
                const titleMatch = text.match(/#\s*title:\s*(.*)/i);
                if (titleMatch) setRitualTitle(titleMatch[1].trim());
                const taglineMatch = text.match(/#\s*tagline:\s*(.*)/i);
                if (taglineMatch) setRitualTagline(taglineMatch[1].trim());
            })
            .catch(err => console.error("Failed to load JAML config", err));
    }, []);

    // Sync Day to URL
    useEffect(() => {
        if (!mounted) return;
        const url = new URL(window.location.href);
        if (url.searchParams.get('day') !== viewingDay.toString()) {
            url.searchParams.set('day', viewingDay.toString());
            window.history.pushState({}, '', url);
        }
    }, [viewingDay, mounted]);

    // Get Current Seed
    const currentSeedId = useMemo(() => {
        if (viewingDay > 0 && viewingDay <= seedsList.length) {
            return seedsList[viewingDay - 1];
        }
        return null;
    }, [viewingDay, seedsList]);

    // Run Analyzer
    const { data: analysisData, loading: analysisLoading, error: analysisError } = useSeedAnalyzer(currentSeedId);

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

    const todayNumber = getDayNumber();
    const canGoBack = viewingDay > 0;
    const canGoForward = viewingDay < todayNumber + 1;

    const displayDate = viewingDay > 0
        ? new Date(EPOCH + (viewingDay - 1) * 86400000).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
        : "PRE-LAUNCH";

    if (!mounted) return null;

    return (
        <div className="ritual-locked-layout">
            {/* Floating Help Button */}
            <div
                className="floating-help-button"
                onClick={() => setShowHowTo(true)}
                title="How to Play"
            >
                ?
            </div>

            {/* Header */}
            <header className="w-full max-w-5xl px-4 py-6 z-20 mx-auto">
                <DayHeader
                    dayNumber={viewingDay}
                    displayDate={displayDate}
                />
            </header>

            {/* Main Content Areas */}
            <main className="match-height-content z-10">
                {viewingDay === 0 ? (
                    <div className="w-full max-w-xl aspect-[4/3] flex items-center justify-center p-4">
                        <EpochCard
                            title={ritualTitle}
                            tagline={ritualTagline}
                            onShowHowTo={() => setShowHowTo(true)}
                            onGoToToday={() => setViewingDay(todayNumber)}
                        />
                    </div>
                ) : (
                    <div className="w-full px-4 max-w-4xl">
                        {analysisLoading ? (
                            <div className="flex flex-col items-center gap-8 py-20 animate-pulse">
                                <div className="animate-spin text-white/10 grayscale">
                                    <Sprite name="weejoker" width={64} />
                                </div>
                                <div className="font-pixel text-white/20 text-xs uppercase tracking-[0.4em]">
                                    Reading Seed Data...
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
                                    onClick={() => setViewingDay(todayNumber)}
                                    className="balatro-button balatro-button-blue mt-6 text-sm"
                                >
                                    BACK TO TODAY
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
                                onPrevDay={() => setViewingDay(v => Math.max(0, v - 1))}
                                onNextDay={() => setViewingDay(v => Math.min(todayNumber + 1, v + 1))}
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
            />

            {showSubmit && currentSeedId && (
                <SubmitScoreModal
                    seed={currentSeedId}
                    ritualId={RITUAL_ID}
                    onClose={() => setShowSubmit(false)}
                    onSuccess={() => { }}
                />
            )}

            {showLeaderboard && (
                <LeaderboardModal
                    ritualId={RITUAL_ID}
                    seed={currentSeedId || "UNKNOWN"}
                    onClose={() => setShowLeaderboard(false)}
                />
            )}
        </div>
    );
}
