"use client";

import { useState } from "react";
import { Upload, X, Trophy } from "lucide-react";

interface SubmitScoreModalProps {
    seed: string;
    ritualId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function SubmitScoreModal({ seed, ritualId, onClose, onSuccess }: SubmitScoreModalProps) {
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
                    ritualId,
                    playerName: playerName.trim(),
                    score: score.trim()
                })
            });

            if (!res.ok) {
                const data = await res.json() as { error?: string };
                throw new Error(data.error || 'Failed to submit');
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 animate-in fade-in duration-150" onClick={onClose}>
            <div className="balatro-panel p-6 max-w-md w-full mx-4 flex flex-col animate-in slide-in-from-bottom-10 duration-150" onClick={(e) => e.stopPropagation()}>

                <div className="text-center mb-6 relative z-10 pt-4">
                    <Trophy size={48} className="text-[var(--balatro-gold)] mx-auto mb-2 drop-shadow-lg juice-float" />
                    <h2 className="text-3xl font-header text-white tracking-wider text-shadow-md">
                        Submit Your Score
                    </h2>
                    <p className="text-zinc-300 font-pixel mt-2">
                        {ritualId} | {seed}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 font-pixel text-sm mb-2">
                            Your Name (max 20 chars)
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                            placeholder="Enter your name..."
                            className="w-full balatro-input text-lg px-4 py-3"
                            maxLength={20}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-400 font-pixel text-sm mb-2">
                            Final Score (Chips)
                        </label>
                        <input
                            type="text"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="e.g. 1.5e12 or 42000"
                            className="w-full balatro-input text-lg px-4 py-3"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-[var(--balatro-red)] font-pixel text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 space-y-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full balatro-button balatro-button-blue text-xl px-6 py-3 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <Upload size={24} />
                            {submitting ? 'Submitting...' : 'Submit Score'}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="w-full balatro-button balatro-button-orange text-lg py-2 disabled:opacity-50"
                        >
                            Back
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
