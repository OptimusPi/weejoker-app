import React from 'react';
import { CardFan } from '../CardFan';
import { Sprite } from '../Sprite';
import { PlayingCard } from '../PlayingCard';
import { AnalyzedSeed } from '@/lib/seedAnalyzer';

interface PanelProps {
    analysis: AnalyzedSeed;
}

export function DeckPanel({ analysis }: PanelProps) {
    const deck = analysis.startingDeck || [];
    const twos = deck.filter(c => c.startsWith('2_'));
    const others = deck.filter(c => !c.startsWith('2_'));

    // Rank Order: A K Q J 10 9 8 7 6 5 4 3
    const rankValue: Record<string, number> = {
        'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    };

    const sortedOthers = [...others].sort((a, b) => {
        const rankA = a.split('_')[0];
        const rankB = b.split('_')[0];
        return (rankValue[rankB] || 0) - (rankValue[rankA] || 0);
    });

    return (
        <div className="flex flex-col w-full relative group py-4 gap-2">
            <div className="absolute top-0 left-0 text-[10px] text-white/40 tracking-[0.2em] uppercase">
                Starting Deck: {deck.length} Cards
            </div>

            {/* Non-2s Section: Ranked and Greyed */}
            <div className="flex flex-wrap justify-center gap-1 opacity-40 grayscale scale-75 origin-top">
                {sortedOthers.map((card, i) => (
                    <div key={i} className="hover:opacity-100 transition-opacity">
                        <PlayingCard
                            rank={card.split('_')[0] as any}
                            suit={card.split('_')[1] as any}
                            size={32}
                        />
                    </div>
                ))}
            </div>

            {/* The 2s: Big arced hand */}
            <div className="flex items-center justify-center pt-8 pb-4">
                <CardFan
                    count={twos.length}
                    cards={twos}
                    className="scale-[1.5] origin-center"
                    showLabel={false}
                />
            </div>
        </div>
    );
}

export function TagsPanel({ analysis }: PanelProps) {
    return (
        <div className="flex flex-col bg-black/20 border border-white/5 rounded-lg relative p-4 h-28">
            <div className="text-[10px] text-white/40 tracking-[0.2em] mb-2 uppercase">
                Tags
            </div>
            <div className="flex-1 flex flex-wrap content-start gap-2 overflow-hidden">
                {analysis.tags.slice(0, 6).map((t, i) => (
                    <div key={i} className="relative group/tag">
                        <Sprite name={t.tag} width={28} className="drop-shadow-sm group-hover/tag:scale-110" />
                        <div className="absolute -top-1 -right-1 bg-black/60 text-white font-pixel text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-sm border border-white/10">{t.ante}</div>
                    </div>
                ))}
                {analysis.tags.length === 0 && <span className="font-pixel text-[8px] text-white/10 italic">None</span>}
            </div>
        </div>
    );
}

export function BossPanel({ analysis }: PanelProps) {
    return (
        <div className="flex flex-col bg-black/20 border border-white/5 rounded-lg relative p-4 h-28">
            <div className="text-[10px] text-white/40 tracking-[0.2em] mb-2 uppercase">
                Boss
            </div>
            <div className="flex-1 flex flex-wrap content-start gap-2 overflow-hidden">
                {analysis.bosses.slice(1, 5).map((b, i) => (
                    <div key={i} className="relative group/boss">
                        <Sprite name={b.boss} width={32} className="drop-shadow-sm group-hover/boss:scale-110" />
                        <div className="absolute -top-1 -right-1 bg-black/60 text-white font-pixel text-[7px] w-3.5 h-3.5 flex items-center justify-center rounded-sm border border-white/10">{b.ante}</div>
                    </div>
                ))}
                {analysis.bosses.length === 0 && <span className="font-pixel text-[8px] text-white/10 italic">None</span>}
            </div>
        </div>
    );
}
