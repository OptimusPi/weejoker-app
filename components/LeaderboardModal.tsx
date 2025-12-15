"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Crown, Medal } from "lucide-react";

interface LeaderboardModalProps {
    dayNumber: number;
    onClose: () => void;
}

interface ScoreEntry {
    id: number;
    player_name: string;
    score: number;
    submitted_at: string;
}

export function LeaderboardModal({ dayNumber, onClose }: LeaderboardModalProps) {
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchScores();
    }, [dayNumber]);

    const fetchScores = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/scores?day=${dayNumber}`);
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

    // Fallback Data for "Jaw Drop" reliability


    const formatScore = (num: number) => {
        return num.toLocaleString();
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <Crown size={20} className="text-[var(--balatro-gold)]" fill="currentColor" />;
        if (index === 1) return <Medal size={20} className="text-zinc-300" />; // Silver
        if (index === 2) return <Medal size={20} className="text-amber-700" />; // Bronze
        return <span className="font-header text-zinc-500 w-5 text-center">{index + 1}</span>;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
            <div className="bg-[var(--balatro-grey)] border-[3px] border-[var(--balatro-gold)] rounded-xl p-6 md:p-8 max-w-lg w-full mx-4 shadow-[0_8px_0_#000] relative overflow-hidden flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="text-center mb-6 relative z-10 flex-shrink-0 pt-6">
                    <Trophy size={48} className="text-[var(--balatro-gold)] mx-auto mb-2 drop-shadow-lg" />
                    <h2 className="text-3xl font-header text-white tracking-wider text-shadow-md">
                        TOP SCORES
                    </h2>
                    <p className="text-zinc-300 font-pixel mt-1 uppercase tracking-widest text-sm">
                        Day {dayNumber}
                    </p>
                </div>

                {/* List */}
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2 mb-4">
                    {loading ? (
                        <div className="text-center py-12 text-zinc-300 font-pixel animate-pulse">
                            Loading Scores...
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-[var(--balatro-red)] font-pixel">
                            {error}
                        </div>
                    ) : scores.length === 0 ? (
                        <div className="text-center py-12 text-zinc-400 font-pixel">
                            No scores yet. Be the first!
                        </div>
                    ) : (
                        scores.map((entry, idx) => (
                            <div
                                key={entry.id}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border-2
                                    ${idx === 0
                                        ? 'bg-[var(--balatro-gold)] border-[var(--balatro-gold)] text-black shadow-[ inset_0_0_20px_rgba(255,255,255,0.2) ]'
                                        : 'bg-black/40 border-white/10 text-white'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 flex justify-center">
                                        {getRankIcon(idx)}
                                    </div>
                                    <span className={`font-header text-lg ${idx === 0 ? 'text-black' : 'text-white'}`}>
                                        {entry.player_name}
                                    </span>
                                </div>
                                <div className={`font-header text-xl tracking-wider tabular-nums ${idx === 0 ? 'text-black' : 'text-white'}`}>
                                    {formatScore(entry.score)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Button */}
                <div className="p-4 flex-shrink-0 bg-black/20 border-t-[3px] border-black/10 -mx-6 -mb-6 md:-mx-8 md:-mb-8 mt-2">
                    <button
                        onClick={onClose}
                        className="w-full bg-[var(--balatro-orange)] hover:brightness-110 text-white font-header py-3 rounded-xl border-[3px] border-white shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[2px] transition-all text-xl tracking-wider"
                    >
                        BACK
                    </button>
                </div>
            </div>
        </div>
    );
}
