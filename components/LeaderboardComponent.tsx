"use client";

import { useState, useEffect } from "react";
import { Trophy, Crown, Medal } from "lucide-react";

interface LeaderboardComponentProps {
    ritualId: string;
    seed: string;
}

interface ScoreEntry {
    id: number;
    player_name: string;
    score: string;
    submitted_at: string;
}

export function LeaderboardComponent({ ritualId, seed }: LeaderboardComponentProps) {
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/scores?seed=${seed}&ritualId=${ritualId}`);
                if (!res.ok) throw new Error("Failed to load scores");
                const data = await res.json();
                if (data.scores) {
                    setScores(data.scores);
                }
            } catch (err) {
                console.error("API Error:", err);
                setError("Could not load scores.");
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [ritualId, seed]);

    const formatScore = (val: string) => {
        const num = Number(val);
        return isNaN(num) ? val : num.toLocaleString();
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown size={20} className="text-[var(--balatro-gold)]" fill="currentColor" />;
        if (index === 1) return <Medal size={20} className="text-zinc-300" />; // Silver
        if (index === 2) return <Medal size={20} className="text-amber-700" />; // Bronze
        return <span className="font-header text-zinc-500 w-5 text-center">{index + 1}</span>;
    };

    return (
        <div className="w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 shrink-0">
                <h2 className="text-xl font-header text-white tracking-widest text-shadow-sm flex items-center gap-2">
                    <Trophy size={20} strokeWidth={2.5} />
                    Top Scores
                </h2>
                <span className="font-pixel text-white/50 text-[10px] uppercase tracking-wider bg-black/20 px-2 py-1 rounded">
                    {seed}
                </span>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {loading ? (
                    <div className="text-center py-8 text-zinc-300 font-pixel animate-pulse text-sm">
                        Loading...
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-[var(--balatro-red)] font-pixel text-sm">
                        {error}
                    </div>
                ) : scores.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 font-pixel text-sm">
                        No scores yet.
                    </div>
                ) : (
                    scores.map((entry, idx) => (
                        <div
                            key={entry.id}
                            className={`
                                flex items-center justify-between p-2 rounded border
                                ${idx === 0
                                    ? 'bg-[var(--balatro-gold)] border-[var(--balatro-gold)] text-black balatro-gold-glow'
                                    : 'bg-black/20 border-white/5 text-white hover:bg-black/30'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-6 flex justify-center">
                                    {getRankIcon(idx)}
                                </div>
                                <span className={`font-header text-sm ${idx === 0 ? 'text-black' : 'text-white'}`}>
                                    {entry.player_name}
                                </span>
                            </div>
                            <div className={`font-header text-lg tracking-wider tabular-nums ${idx === 0 ? 'text-black' : 'text-white'}`}>
                                {formatScore(entry.score)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
