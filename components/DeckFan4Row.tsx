"use client";

import React from 'react';
import { PlayingCard } from './PlayingCard';

// Card string format: "2_C", "10_H", "K_S", "A_D"
const RANK_MAP: Record<string, string> = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
    'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace'
};
const SUIT_MAP: Record<string, string> = {
    'H': 'Hearts', 'C': 'Clubs', 'D': 'Diamonds', 'S': 'Spades'
};
const SUIT_ORDER = ['S', 'H', 'C', 'D'] as const; // Spades, Hearts, Clubs, Diamonds
const RANK_ORDER = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

interface DeckFan4RowProps {
    cards: string[];
    className?: string;
    /** If set, cards matching this rank will be highlighted and others dimmed */
    featuredRank?: string;
}

function parseCard(card: string) {
    const [r, s] = card.split('_');
    return { rank: r, suit: s };
}

export function DeckFan4Row({ cards, className = '', featuredRank }: DeckFan4RowProps) {
    // Separate cards by suit
    const bySuit: Record<string, string[]> = { S: [], H: [], C: [], D: [] };
    for (const card of cards) {
        const { suit } = parseCard(card);
        if (bySuit[suit]) bySuit[suit].push(card);
    }

    // Sort each suit by rank order (A first, 2 last)
    for (const suit of SUIT_ORDER) {
        bySuit[suit].sort((a, b) => {
            const ra = parseCard(a).rank;
            const rb = parseCard(b).rank;
            return RANK_ORDER.indexOf(ra) - RANK_ORDER.indexOf(rb);
        });
    }

    return (
        <div className={`flex flex-col gap-0 ${className}`}>
            {SUIT_ORDER.map((suit) => {
                const suitCards = bySuit[suit];
                if (suitCards.length === 0) return null;
                return (
                    <SuitFanRow key={suit} cards={suitCards} featuredRank={featuredRank} />
                );
            })}
        </div>
    );
}

function SuitFanRow({ cards, featuredRank }: { cards: string[]; featuredRank?: string }) {
    const count = cards.length;
    const cardSize = 28; // Small cards to fit in narrow container
    // Slight overlap - less cards = more spacing
    const overlap = count > 10 ? 0.7 : count > 6 ? 0.55 : 0.4;
    const cardSpacing = cardSize * (1 - overlap);
    const totalWidth = cardSize + cardSpacing * (count - 1);

    // Very slight arc - like the Balatro screenshot
    const maxRotation = count > 10 ? 8 : count > 6 ? 5 : 3;

    const rowHeight = cardSize * 1.35;

    return (
        <div
            className="relative mx-auto"
            style={{
                width: `${totalWidth}px`,
                height: `${rowHeight}px`,
            }}
        >
            {cards.map((card, i) => {
                const { rank, suit } = parseCard(card);
                const centerIndex = (count - 1) / 2;
                const offset = i - centerIndex;

                const xPos = i * cardSpacing;
                // Very slight parabolic arc
                const yOffset = Math.pow(Math.abs(offset / (centerIndex || 1)), 2) * 4;
                const rotation = (offset / (centerIndex || 1)) * maxRotation;

                // Featured highlighting
                const isFeatured = featuredRank ? rank === featuredRank : true;
                const cardFilter = isFeatured
                    ? 'drop-shadow(0 1px 3px rgba(255,200,0,0.5)) drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
                    : 'brightness(0.45) saturate(0.3) drop-shadow(0 1px 2px rgba(0,0,0,0.4))';

                return (
                    <div
                        key={i}
                        className={`absolute ${isFeatured && featuredRank ? 'animate-juice-pop' : 'animate-sway'}`}
                        style={{
                            left: `${xPos}px`,
                            bottom: '0',
                            transform: `translateY(${yOffset}px) rotate(${rotation}deg)`,
                            transformOrigin: 'bottom center',
                            zIndex: isFeatured ? i + 100 : i,
                            animationDelay: `${i * 0.15}s`,
                        }}
                    >
                        <PlayingCard
                            rank={RANK_MAP[rank] as any}
                            suit={SUIT_MAP[suit] as any}
                            size={cardSize}
                            style={{
                                filter: cardFilter,
                                transition: 'filter 0.3s ease',
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
