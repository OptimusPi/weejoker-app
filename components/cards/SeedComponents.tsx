import React from 'react';
import { CardFan } from '../CardFan';
import { Sprite } from '../Sprite';
import { AnalyzedSeed } from '@/lib/seedAnalyzer';

interface PanelProps {
    analysis: AnalyzedSeed;
}

export function DeckPanel({ analysis }: PanelProps) {
    return (
        <div className="flex w-full min-h-[100px] bg-[var(--balatro-light-black)]/40 rounded-xl overflow-hidden border-2 border-black/30 relative shadow-inner group">
            <div className="w-10 flex items-center justify-center relative shrink-0 border-r border-white/5 bg-black/20">
                <span className="font-header text-[12px] text-white/40 tracking-[0.3em] whitespace-nowrap -rotate-90 absolute uppercase">
                    Deck
                </span>
            </div>
            <div className="flex-1 flex items-center justify-center p-3">
                <CardFan
                    count={analysis.startingDeck.length}
                    cards={analysis.startingDeck}
                    className="scale-[0.85] origin-center"
                    showLabel={false}
                />
            </div>
        </div>
    );
}

export function TagsPanel({ analysis }: PanelProps) {
    return (
        <div className="flex bg-[var(--balatro-light-black)]/40 rounded-xl overflow-hidden border-2 border-black/30 relative shadow-inner h-24">
            <div className="w-8 flex items-center justify-center relative shrink-0 border-r border-white/5 bg-black/20">
                <span className="font-header text-[10px] text-white/40 tracking-[0.2em] whitespace-nowrap -rotate-90 absolute uppercase">
                    Tags
                </span>
            </div>
            <div className="flex-1 p-2 flex flex-wrap content-center gap-1.5 overflow-hidden">
                {analysis.tags.slice(0, 3).map((t, i) => (
                    <div key={i} className="relative group/tag">
                        <Sprite name={t.tag} width={28} className="drop-shadow-sm group-hover/tag:scale-110" />
                        <div className="absolute -top-1 -right-1 bg-black/60 text-white font-pixel text-[7px] w-3 h-3 flex items-center justify-center rounded-sm">A{t.ante}</div>
                    </div>
                ))}
                {analysis.tags.length === 0 && <span className="font-pixel text-[8px] text-white/10 uppercase italic">None</span>}
            </div>
        </div>
    );
}

export function BossPanel({ analysis }: PanelProps) {
    return (
        <div className="flex bg-[var(--balatro-light-black)]/40 rounded-xl overflow-hidden border-2 border-black/30 relative shadow-inner h-24">
            <div className="w-8 flex items-center justify-center relative shrink-0 border-r border-white/5 bg-black/20">
                <span className="font-header text-[10px] text-white/40 tracking-[0.2em] whitespace-nowrap -rotate-90 absolute uppercase">
                    Boss
                </span>
            </div>
            <div className="flex-1 p-2 flex flex-wrap content-center gap-1.5 overflow-hidden">
                {analysis.bosses.slice(1, 4).map((b, i) => (
                    <div key={i} className="relative group/boss">
                        <Sprite name={b.boss} width={32} className="drop-shadow-sm group-hover/boss:scale-110" />
                        <div className="absolute -top-1 -right-1 bg-black/60 text-white font-pixel text-[7px] w-3 h-3 flex items-center justify-center rounded-sm">A{b.ante}</div>
                    </div>
                ))}
                {analysis.bosses.length === 0 && <span className="font-pixel text-[8px] text-white/10 uppercase italic">None</span>}
            </div>
        </div>
    );
}
