import React from 'react';
import { RealPlayingCard } from './RealPlayingCard';
import { JimboInnerPanel } from '@/components/JimboPanel';

interface CardFanProps {
    count: number;
    cards?: string[]; // New: Actual card strings like ["2_C", "10_H"]
    className?: string;
    label?: string;
    showLabel?: boolean;
}

const RANK_MAP: Record<string, string> = {
    '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
    'J': 'Jack', 'Q': 'Queen', 'K': 'King', 'A': 'Ace'
};
const SUIT_MAP: Record<string, string> = {
    'H': 'Hearts', 'C': 'Clubs', 'D': 'Diamonds', 'S': 'Spades'
};

const parseJamzCard = (jamz: string) => {
    const [r, s] = jamz.split('_');
    return {
        rank: RANK_MAP[r] || '2',
        suit: SUIT_MAP[s] || 'Clubs'
    };
};

export function CardFan({ count, cards, className = '', label, showLabel = true }: CardFanProps) {
    const displayCount = cards ? cards.length : count;

    // Responsive sizing for full decks
    const cardSize = displayCount > 40 ? 46 : displayCount > 30 ? 32 : displayCount > 12 ? 36 : displayCount > 8 ? 42 : displayCount > 5 ? 48 : 54;

    // Tighter overlap for full deck (0.85 for 52 cards is good)
    const overlap = displayCount > 40 ? 0.88 : displayCount > 30 ? 0.85 : displayCount > 15 ? 0.75 : displayCount > 6 ? 0.6 : 0.45;
    const cardSpacing = cardSize * (1 - overlap);

    // Dynamic rotation range based on count
    const maxRotation = displayCount > 40 ? 40 : displayCount > 20 ? 30 : displayCount > 10 ? 15 : 25;

    // Height for the cards area - STABLE to prevent shifting
    const cardsHeight = 120;

    return (
        <div className={`flex flex-col items-center gap-1 ${className}`}>
            <div
                className="relative"
                style={{
                    width: '100%',
                    height: `${cardsHeight}px`,
                }}
            >
                {displayCount > 0 ? (
                    Array.from({ length: displayCount }).map((_, i) => {
                        const centerIndex = (displayCount - 1) / 2;
                        const offset = i - centerIndex;
                        const xPos = offset * cardSpacing;
                        // Parabolic Y offset for arc effect
                        const yOffset = Math.pow(Math.abs(offset / (centerIndex || 1)), 2) * (displayCount > 20 ? 20 : 10);
                        const rotation = (offset / (centerIndex || 1)) * maxRotation;

                        // Use actual card data if available, otherwise default to 2 of Clubs
                        const cardData = cards ? parseJamzCard(cards[i]) : { rank: "2", suit: "Clubs" as any };

                        return (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    left: '50%',
                                    bottom: '0',
                                    transform: `translateX(calc(-50% + ${xPos}px)) translateY(${yOffset}px) rotate(${rotation}deg)`,
                                    transformOrigin: 'bottom center',
                                    zIndex: i,
                                    animationDelay: `${i * 0.02}s`,
                                }}
                            >
                                <RealPlayingCard
                                    rank={cardData.rank as any}
                                    suit={cardData.suit as any}
                                    size={cardSize}
                                    style={{
                                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
                                    }}
                                />
                            </div>
                        );
                    })
                ) : (
                    <JimboInnerPanel className="flex items-center justify-center h-full w-full">
                        <span className="font-pixel text-[var(--jimbo-grey)] text-[10px] uppercase tracking-widest">Deck Empty</span>
                    </JimboInnerPanel>
                )}
            </div>

        </div>
    );
}
