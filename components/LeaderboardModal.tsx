"use client";

import { useState, useEffect } from "react";
import { Trophy, Crown, Medal } from "lucide-react";
import { JimboPanel, JimboInnerPanel, JimboBackButton } from "@/components/JimboPanel";

interface LeaderboardModalProps {
    ritualId: string;
    seed: string;
    onClose: () => void;
}

interface ScoreEntry {
    id: number;
    player_name: string;
    score: string;
    submitted_at: string;
}

export function LeaderboardModal({ ritualId, seed, onClose }: LeaderboardModalProps) {
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
                const data = await res.json() as { scores: any[] };
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
        if (index === 0) return <Crown size={20} className="text-[var(--jimbo-gold)]" fill="currentColor" />;
        if (index === 1) return <Medal size={20} className="text-[var(--jimbo-border-silver)]" />;
        if (index === 2) return <Medal size={20} className="text-[var(--jimbo-gold)]" />;
        return <span className="font-header text-[var(--jimbo-grey)] w-5 text-center">{index + 1}</span>;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[var(--jimbo-panel-edge)]" onClick={onClose}>
            <JimboPanel className="relative w-full max-w-lg h-[70vh] flex flex-col" onClick={(e: React.MouseEvent) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-[var(--jimbo-blue)] -mx-4 -mt-4 p-4 flex justify-between items-center rounded-t-lg shrink-0 mb-4">
                    <h2 className="text-2xl md:text-3xl font-header text-white tracking-widest flex items-center gap-2">
                        <Trophy size={28} strokeWidth={2.5} />
                        Top Scores
                    </h2>
                    <span className="font-pixel text-[var(--jimbo-border-silver)] text-sm tracking-wider bg-[var(--jimbo-dark-blue)] px-2 py-1 rounded">
                        {ritualId} | {seed}
                    </span>
                </div>

                {/* List */}
                <div className="flex-grow overflow-y-auto space-y-2 min-h-0">
                    {loading ? (
                        <div className="text-center py-12 text-[var(--jimbo-grey)] font-pixel animate-pulse">
                            Loading Scores...
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-[var(--jimbo-red)] font-pixel">
                            {error}
                        </div>
                    ) : scores.length === 0 ? (
                        <div className="text-center py-12 text-[var(--jimbo-grey)] font-pixel">
                            No scores yet. Be the first!
                        </div>
                    ) : (
                        scores.map((entry, idx) => (
                            <div
                                key={entry.id}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg border-2
                                    ${idx === 0
                                        ? 'bg-[var(--jimbo-gold)] border-[var(--jimbo-gold)] text-black'
                                        : 'jimbo-inner-panel'
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

                {/* Footer */}
                <div className="mt-3 shrink-0">
                    <JimboBackButton onClick={onClose} />
                </div>
            </JimboPanel>
        </div>
    );
}
