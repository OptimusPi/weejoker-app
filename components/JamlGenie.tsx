"use client";

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface JamlGenieProps {
    onJamlGenerated: (jaml: string) => void;
}

export function JamlGenie({ onJamlGenerated }: JamlGenieProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://jamlgenie.optimuspi.workers.dev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) throw new Error('Generation failed');

            const data = await response.json();
            onJamlGenerated(data.jaml || data.response);
            setPrompt('');
        } catch (err) {
            setError('Failed to generate JAML. Try being more specific!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="balatro-panel border-[var(--balatro-purple)] h-full flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                    <div className="text-[var(--balatro-purple)] drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-[var(--balatro-purple)] text-2xl font-header uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                        JAML Genie
                    </h3>
                </div>

                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    <div className="flex-1 balatro-panel-inner p-4 overflow-y-auto custom-scrollbar font-pixel text-[var(--balatro-text-light)] text-sm space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-[var(--balatro-purple)] flex items-center justify-center shrink-0 shadow-[0_2px_0_black]">
                                🧞
                            </div>
                            <div className="bg-[var(--balatro-black)] p-3 rounded-lg border border-[var(--balatro-outline-light)] shadow-sm">
                                <p>Hello! I'm the JAML Genie. Describe the seed you want, and I'll write the filter code for you.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !loading && handleGenerate()}
                                placeholder="Describe your perfect seed..."
                                className="balatro-input flex-1 h-12 text-lg"
                                disabled={loading}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !prompt.trim()}
                                className="balatro-button balatro-button-purple h-12 w-16 !p-0 flex items-center justify-center"
                            >
                                {loading ? <Loader2 size={24} className="animate-spin" /> : '➤'}
                            </button>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {['Blueprint & Brainstorm', 'Legendary Joker', 'Polychrome'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setPrompt(tag)}
                                    className="px-3 py-1 rounded bg-[var(--balatro-modal-inner)] border border-[var(--balatro-outline-dark)] text-[var(--balatro-text-dark)] text-xs font-pixel hover:brightness-110 whitespace-nowrap"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-2 text-xs font-pixel text-white bg-[var(--balatro-red)] border border-red-900 rounded p-2 shadow-sm">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
