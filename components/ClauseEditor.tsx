"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Plus } from 'lucide-react';
import type { JamlClause } from '@/lib/hooks/useJamlFilter';
import {
    CLAUSE_TYPES,
    SOURCE_OPTIONS,
    ANTE_OPTIONS,
    EDITION_OPTIONS,
    SEAL_OPTIONS,
    ENHANCEMENT_OPTIONS,
    RANK_OPTIONS,
    SUIT_OPTIONS
} from '@/lib/data/constants';

interface ClauseEditorProps {
    clause: JamlClause | null;
    bucket: 'must' | 'should' | 'mustNot';
    onSave: (clause: JamlClause) => void;
    onClose: () => void;
}

export function ClauseEditor({ clause, bucket, onSave, onClose }: ClauseEditorProps) {
    const [form, setForm] = useState<JamlClause>(clause || {
        type: '',
        value: '',
        label: '',
        antes: [],
        score: 1,
        edition: '',
        seal: '',
        enhancement: '',
        rank: '',
        suit: '',
        sources: []
    });

    const toggleArrayValue = <T,>(arr: T[], value: T) => {
        const newArr = arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
        return newArr;
    };

    const handleSave = () => {
        if (!form.type || !form.value) return;
        onSave(form);
    };

    const isPlayingCard = form.type === 'PlayingCard' || form.type === 'StandardCard';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95">
            <div className="w-full max-w-2xl max-h-[90vh] bg-[var(--balatro-black)] border-2 border-[var(--balatro-modal-border)] rounded-xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="font-header text-lg text-white uppercase tracking-wider">{clause ? 'Edit' : 'Add'} Clause</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors" aria-label="Close" title="Close">
                        <X size={20} className="text-white/60" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                    {/* Type & Value */}
                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Type</span>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="balatro-input"
                            >
                                <option value="">Select type...</option>
                                {CLAUSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Value</span>
                            <input
                                value={form.value}
                                onChange={e => setForm({ ...form, value: e.target.value })}
                                placeholder="Wee Joker, Venus, etc."
                                className="balatro-input"
                            />
                        </label>
                    </div>

                    {/* Label */}
                    <label className="flex flex-col gap-1">
                        <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Label (Optional)</span>
                        <input
                            value={form.label || ''}
                            onChange={e => setForm({ ...form, label: e.target.value })}
                            placeholder="Custom display name"
                            className="balatro-input"
                        />
                    </label>

                    {/* Antes */}
                    <div className="space-y-2">
                        <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Antes</span>
                        <div className="flex flex-wrap gap-2">
                            {ANTE_OPTIONS.map(ante => (
                                <button
                                    key={ante}
                                    onClick={() => setForm({ ...form, antes: toggleArrayValue(form.antes || [], ante) })}
                                    className={cn(
                                        "px-3 py-1 rounded-md border font-pixel text-sm transition-all",
                                        (form.antes || []).includes(ante)
                                            ? "bg-[var(--balatro-blue)] border-[var(--balatro-blue)] text-white"
                                            : "bg-[var(--balatro-light-black)] border-white/20 text-white/60 hover:border-white/40"
                                    )}
                                >
                                    {ante}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Edition, Seal, Enhancement */}
                    <div className="grid grid-cols-3 gap-3">
                        <label className="flex flex-col gap-1">
                            <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Edition</span>
                            <select
                                value={form.edition || ''}
                                onChange={e => setForm({ ...form, edition: e.target.value })}
                                className="balatro-input"
                            >
                                <option value="">Any</option>
                                {EDITION_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Seal</span>
                            <select
                                value={form.seal || ''}
                                onChange={e => setForm({ ...form, seal: e.target.value })}
                                className="balatro-input"
                            >
                                <option value="">Any</option>
                                {SEAL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1">
                            <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Enhancement</span>
                            <select
                                value={form.enhancement || ''}
                                onChange={e => setForm({ ...form, enhancement: e.target.value })}
                                className="balatro-input"
                            >
                                <option value="">Any</option>
                                {ENHANCEMENT_OPTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </label>
                    </div>

                    {/* Playing Card Rank & Suit */}
                    {isPlayingCard && (
                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex flex-col gap-1">
                                <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Rank</span>
                                <select
                                    value={form.rank || ''}
                                    onChange={e => setForm({ ...form, rank: e.target.value })}
                                    className="balatro-input"
                                >
                                    <option value="">Any</option>
                                    {RANK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </label>

                            <label className="flex flex-col gap-1">
                                <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Suit</span>
                                <select
                                    value={form.suit || ''}
                                    onChange={e => setForm({ ...form, suit: e.target.value })}
                                    className="balatro-input"
                                >
                                    <option value="">Any</option>
                                    {SUIT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </label>
                        </div>
                    )}

                    {/* Sources */}
                    <div className="space-y-2">
                        <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Sources</span>
                        <div className="flex flex-wrap gap-2">
                            {SOURCE_OPTIONS.map(source => (
                                <button
                                    key={source}
                                    onClick={() => setForm({ ...form, sources: toggleArrayValue(form.sources || [], source) })}
                                    className={cn(
                                        "px-3 py-1 rounded-md border font-pixel text-xs transition-all",
                                        (form.sources || []).includes(source)
                                            ? "bg-[var(--balatro-green)] border-[var(--balatro-green)] text-white"
                                            : "bg-[var(--balatro-light-black)] border-white/20 text-white/60 hover:border-white/40"
                                    )}
                                >
                                    {source}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Score Weight (Should only) */}
                    {bucket === 'should' && (
                        <label className="flex flex-col gap-1">
                            <span className="font-pixel text-xs text-white/40 uppercase tracking-widest">Score Weight</span>
                            <input
                                type="number"
                                min="0"
                                value={form.score || 1}
                                onChange={e => setForm({ ...form, score: parseInt(e.target.value) || 1 })}
                                className="balatro-input"
                            />
                        </label>
                    )}

                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 p-4 border-t border-white/10">
                    <button onClick={onClose} className="balatro-button-secondary">Cancel</button>
                    <button onClick={handleSave} disabled={!form.type || !form.value} className="balatro-button-primary">
                        Save Clause
                    </button>
                </div>

            </div>
        </div>
    );
}
