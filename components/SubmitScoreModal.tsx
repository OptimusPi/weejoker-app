"use client";

import { useState } from "react";
import { Upload, X, Trophy } from "lucide-react";

interface SubmitScoreModalProps {
    seed: string;
    dayNumber: number;
    onClose: () => void;
    onSuccess: () => void;
}

export function SubmitScoreModal({ seed, dayNumber, onClose, onSuccess }: SubmitScoreModalProps) {
    const [playerName, setPlayerName] = useState("");
    const [score, setScore] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    seed,
                    dayNumber,
                    playerName: playerName.trim(),
                    score: parseInt(score, 10)
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--balatro-grey-darker)] border-[3px] border-[var(--balatro-gold)] rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <Trophy size={48} className="text-[var(--balatro-gold)] mx-auto mb-2" />
                    <h2 className="text-3xl font-header text-white tracking-wider">
                        SUBMIT YOUR SCORE
                    </h2>
                    <p className="text-zinc-400 font-pixel mt-2">
                        Daily Wee #{dayNumber}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 font-pixel text-sm uppercase mb-2">
                            Your Name (max 20 chars)
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                            placeholder="Enter your name..."
                            className="w-full balatro-input text-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 font-pixel text-sm uppercase mb-2">
                            Final Score (Chips)
                        </label>
                        <input
                            type="number"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="e.g. 1234567"
                            className="w-full balatro-input text-lg"
                            min="0"
                            max="999999999"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-[var(--balatro-red)] font-pixel text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[var(--balatro-green)] hover:brightness-110 disabled:opacity-50 text-white font-header text-xl px-6 py-4 rounded-lg border-b-4 border-[#1e5f46] active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                        <Upload size={24} />
                        {submitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
                    </button>
                </form>
            </div>
        </div>
    );
}
