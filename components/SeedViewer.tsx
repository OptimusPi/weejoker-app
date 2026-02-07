"use client";

import React, { useState } from 'react';
import { AgnosticSeedCard } from './AgnosticSeedCard';
import { Search, Loader2, Plus, Trash2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SeedViewer() {
    const [input, setInput] = useState('');
    const [seeds, setSeeds] = useState<string[]>(['ALEBB', 'GHOST', 'BEEF']);

    const handleAdd = () => {
        if (!input.trim()) return;
        setSeeds(prev => [input.trim().toUpperCase(), ...prev]);
        setInput('');
    };

    const handleRemove = (idx: number) => {
        setSeeds(prev => prev.filter((_, i) => i !== idx));
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--balatro-black)]">
            <header className="px-8 py-6 border-b border-white/10 shrink-0">
                <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="font-header text-4xl text-white tracking-widest uppercase mb-1">SEED ANALYTICS</h1>
                        <p className="font-pixel text-[var(--balatro-blue)] text-xs tracking-widest opacity-80 uppercase">Diagnostic & Shop Item Debugger</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="ENTER SEED..."
                                className="balatro-input !bg-black/40 !border-white/20 !w-48 !text-lg !font-header !tracking-widest uppercase"
                                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            className="balatro-button balatro-button-blue !p-2 !h-11 !w-11"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {seeds.length > 0 ? (
                        seeds.map((seed, idx) => (
                            <div key={`${seed}-${idx}`} className="relative group">
                                <AgnosticSeedCard seed={seed} className="w-full" />
                                <button
                                    onClick={() => handleRemove(idx)}
                                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--balatro-red)] text-white items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full h-[400px] flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-white/10 rounded-3xl">
                            <Database size={64} className="mb-4" />
                            <span className="font-header text-xl uppercase tracking-widest text-center px-10">No seeds in diagnostics vault</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
