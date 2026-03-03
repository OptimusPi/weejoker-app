"use client";

import { useState } from "react";
import { Upload, Trophy } from "lucide-react";
import { JimboPanel, JimboButton, JimboInput } from "@/components/JimboPanel";

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--jimbo-panel-edge)]" onClick={onClose}>
            <JimboPanel onBack={onClose} className="max-w-md w-full mx-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>

                <div className="text-center mb-6 pt-4">
                    <Trophy size={48} className="text-[var(--jimbo-gold)] mx-auto mb-2" />
                    <h2 className="text-3xl font-header text-white tracking-wider">
                        Submit Your Score
                    </h2>
                    <p className="text-[var(--jimbo-grey)] font-pixel mt-2">
                        {ritualId} | {seed}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[var(--jimbo-grey)] font-pixel text-sm mb-2">
                            Your Name (max 20 chars)
                        </label>
                        <JimboInput
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                            placeholder="Enter your name..."
                            className="text-lg px-4 py-3"
                            maxLength={20}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[var(--jimbo-grey)] font-pixel text-sm mb-2">
                            Final Score (Chips)
                        </label>
                        <JimboInput
                            type="text"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            placeholder="e.g. 1.5e12 or 42000"
                            className="text-lg px-4 py-3"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-[var(--jimbo-red)] font-pixel text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="pt-4 space-y-3">
                        <JimboButton
                            variant="blue"
                            onClick={() => {
                                const form = document.querySelector('form');
                                form?.requestSubmit();
                            }}
                            disabled={submitting}
                            className="text-xl py-3"
                        >
                            <Upload size={24} />
                            {submitting ? 'Submitting...' : 'Submit Score'}
                        </JimboButton>
                    </div>
                </form>
            </JimboPanel>
        </div>
    );
}
