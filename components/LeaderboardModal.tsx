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

        fetchScores();
    }, [dayNumber]);

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 animate-in fade-in duration-150" onClick={onClose}>
            <div className="balatro-panel relative w-full max-w-lg h-[70vh] flex flex-col animate-in slide-in-from-bottom-10 duration-150" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-[var(--balatro-blue)] p-4 flex justify-between items-center border-b-[3px] border-black/20 shrink-0">
                    <h2 className="text-2xl md:text-3xl font-header text-white tracking-widest text-shadow-sm flex items-center gap-2">
                        <Trophy size={28} strokeWidth={2.5} />
                        Top Scores
                    </h2>
                    <span className="font-pixel text-white/80 text-sm uppercase tracking-wider bg-black/20 px-2 py-1 rounded">
                        Day {dayNumber}
                    </span>
                </div>

                {/* List */}
                <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-2">
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
                                        : 'bg-black/40 border-black/20 text-white'
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

                {/* Footer Button - NO EXTRA BACKGROUND */}
                <div className="p-3 flex-shrink-0 text-center">
                    <button
                        onClick={onClose}
                        className="balatro-button-back"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}
