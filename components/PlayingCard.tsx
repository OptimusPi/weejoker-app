import React, { CSSProperties } from 'react';

interface PlayingCardProps {
    rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King' | 'Ace';
    suit: 'Hearts' | 'Clubs' | 'Diamonds' | 'Spades';
    size?: number; // Size in pixels (default: 40)
    style?: CSSProperties;
    className?: string;
}

// Metadata from playing_cards_metadata.json
const SPRITE_COORDS: Record<string, Record<string, { x: number; y: number }>> = {
    Hearts: {
        '2': { x: 0, y: 0 }, '3': { x: 1, y: 0 }, '4': { x: 2, y: 0 }, '5': { x: 3, y: 0 },
        '6': { x: 4, y: 0 }, '7': { x: 5, y: 0 }, '8': { x: 6, y: 0 }, '9': { x: 7, y: 0 },
        '10': { x: 8, y: 0 }, 'Jack': { x: 9, y: 0 }, 'Queen': { x: 10, y: 0 }, 'King': { x: 11, y: 0 }, 'Ace': { x: 12, y: 0 }
    },
    Clubs: {
        '2': { x: 0, y: 1 }, '3': { x: 1, y: 1 }, '4': { x: 2, y: 1 }, '5': { x: 3, y: 1 },
        '6': { x: 4, y: 1 }, '7': { x: 5, y: 1 }, '8': { x: 6, y: 1 }, '9': { x: 7, y: 1 },
        '10': { x: 8, y: 1 }, 'Jack': { x: 9, y: 1 }, 'Queen': { x: 10, y: 1 }, 'King': { x: 11, y: 1 }, 'Ace': { x: 12, y: 1 }
    },
    Diamonds: {
        '2': { x: 0, y: 2 }, '3': { x: 1, y: 2 }, '4': { x: 2, y: 2 }, '5': { x: 3, y: 2 },
        '6': { x: 4, y: 2 }, '7': { x: 5, y: 2 }, '8': { x: 6, y: 2 }, '9': { x: 7, y: 2 },
        '10': { x: 8, y: 2 }, 'Jack': { x: 9, y: 2 }, 'Queen': { x: 10, y: 2 }, 'King': { x: 11, y: 2 }, 'Ace': { x: 12, y: 2 }
    },
    Spades: {
        '2': { x: 0, y: 3 }, '3': { x: 1, y: 3 }, '4': { x: 2, y: 3 }, '5': { x: 3, y: 3 },
        '6': { x: 4, y: 3 }, '7': { x: 5, y: 3 }, '8': { x: 6, y: 3 }, '9': { x: 7, y: 3 },
        '10': { x: 8, y: 3 }, 'Jack': { x: 9, y: 3 }, 'Queen': { x: 10, y: 3 }, 'King': { x: 11, y: 3 }, 'Ace': { x: 12, y: 3 }
    }
};

const SPRITE_WIDTH = 142;
const SPRITE_HEIGHT = 190;

export function PlayingCard({ rank, suit, size = 40, style, className = '' }: PlayingCardProps) {
    const coords = SPRITE_COORDS[suit][rank];
    const scale = size / SPRITE_HEIGHT;

    const cardStyle: CSSProperties = {
        width: `${SPRITE_WIDTH * scale}px`,
        height: `${SPRITE_HEIGHT * scale}px`,
        backgroundImage: 'url(/Assets/Decks/8BitDeck.png)',
        backgroundPosition: `-${coords.x * SPRITE_WIDTH * scale}px -${coords.y * SPRITE_HEIGHT * scale}px`,
        backgroundSize: `${13 * SPRITE_WIDTH * scale}px ${4 * SPRITE_HEIGHT * scale}px`,
        imageRendering: 'pixelated',
        ...style
    };

    return <div className={`inline-block ${className}`} style={cardStyle} />;
}
