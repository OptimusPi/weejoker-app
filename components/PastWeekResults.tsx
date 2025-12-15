"use client";

import { useState, useEffect } from "react";
import { Trophy, Calendar } from "lucide-react";

interface DayResult {
    day_number: number;
    player_name: string;
    score: number;
    seed: string;
}

export function PastWeekResults() {
    const [results, setResults] = useState<DayResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWeekResults() {
            try {
                const res = await fetch('/api/scores?week=true');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setResults(data.scores || []);
            } catch (err) {
                setError('Could not load past results');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchWeekResults();
    }, []);

    // Calculate day number from epoch
    const EPOCH = new Date('2025-12-14').getTime();
    const getDayLabel = (dayNum: number) => {
        const dayDate = new Date(EPOCH + (dayNum - 1) * 24 * 60 * 60 * 1000);
        return dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-black/30 backdrop-blur-lg border-[2px] border-white/40 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0"></div>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[var(--balatro-blue)] p-2 rounded border-2 border-white shadow-sm">
                    <Calendar size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-header text-white tracking-wider">
                    PAST WEEK WINNERS
                </h2>
            </div>

            {loading && (
                <div className="text-center py-8 text-zinc-400 font-pixel animate-pulse">
                    Loading past results...
                </div>
            )}

            {error && (
                <div className="text-center py-8 text-[var(--balatro-orange)] font-pixel">
                    {error}
                </div>
            )}

            {!loading && !error && results.length === 0 && (
                <div className="text-center py-8 space-y-2">
                    <div className="text-4xl">🎮</div>
                    <p className="text-zinc-400 font-pixel text-lg">
                        No winners yet! Be the first to submit your score.
                    </p>
                </div>
            )}

            {!loading && !error && results.length > 0 && (
                <div className="space-y-3">
                    {results.map((result, i) => (
                        <div key={result.day_number} className="flex items-center gap-4 bg-black/30 p-4 rounded-lg border border-white/10">
                            <div className="w-12 text-center">
                                {i === 0 ? (
                                    <Trophy size={24} className="text-[var(--balatro-gold)] mx-auto" />
                                ) : (
                                    <span className="font-pixel text-zinc-500">#{result.day_number}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-header text-white text-xl">{result.player_name}</div>
                                <div className="font-pixel text-zinc-500 text-sm">{getDayLabel(result.day_number)}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-header text-2xl text-[var(--balatro-gold)]">
                                    {result.score.toLocaleString()}
                                </div>
                                <div className="font-pixel text-zinc-500 text-xs uppercase">chips</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
