"use client";

import { useState, useEffect } from "react";
import { Trophy, Calendar } from "lucide-react";
import { JimboPanel, JimboInnerPanel } from "@/components/JimboPanel";

import { EPOCH } from "@/lib/config";

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
                const data = await res.json() as { scores: DayResult[] };
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

    const getDayLabel = (dayNum: number) => {
        const dayDate = new Date(EPOCH + (dayNum - 1) * 24 * 60 * 60 * 1000);
        return dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <JimboPanel className="relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[var(--jimbo-blue)] p-2 rounded">
                    <Calendar size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-header text-white tracking-wider">
                    PAST WEEK WINNERS
                </h2>
            </div>

            {loading && (
                <div className="text-center py-8 text-[var(--jimbo-grey)] font-pixel animate-pulse">
                    Loading past results...
                </div>
            )}

            {error && (
                <div className="text-center py-8 text-[var(--jimbo-gold)] font-pixel">
                    {error}
                </div>
            )}

            {!loading && !error && results.length === 0 && (
                <div className="text-center py-8 space-y-2">
                    <div className="text-4xl">🎮</div>
                    <p className="text-[var(--jimbo-grey)] font-pixel text-lg">
                        No winners yet! Be the first to submit your score.
                    </p>
                </div>
            )}

            {!loading && !error && results.length > 0 && (
                <div className="space-y-3">
                    {results.map((result, i) => (
                        <JimboInnerPanel key={result.day_number} className="flex items-center gap-4">
                            <div className="w-12 text-center">
                                {i === 0 ? (
                                    <Trophy size={24} className="text-[var(--jimbo-gold)] mx-auto" />
                                ) : (
                                    <span className="font-pixel text-[var(--jimbo-grey)]">#{result.day_number}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-header text-white text-xl">{result.player_name}</div>
                                <div className="font-pixel text-[var(--jimbo-grey)] text-sm">{getDayLabel(result.day_number)}</div>
                            </div>
                            <div className="text-right">
                                <div className="font-header text-2xl text-[var(--jimbo-gold)]">
                                    {result.score.toLocaleString()}
                                </div>
                                <div className="font-pixel text-[var(--jimbo-grey)] text-xs">chips</div>
                            </div>
                        </JimboInnerPanel>
                    ))}
                </div>
            )}
        </JimboPanel>
    );
}
