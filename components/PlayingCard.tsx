"use client";

import React, { CSSProperties } from 'react';

// Dimensions from metadata
const CARD_WIDTH = 142;
const CARD_HEIGHT = 190;
const ENHANCER_SHEET_WIDTH = 142;
const ENHANCER_SHEET_HEIGHT = 190;
const ENHANCER_COLUMNS = 7;
const ENHANCER_ROWS = 5;

// StandardCard_Base position from enhancers_metadata.json
const STANDARD_CARD_BASE = { x: 1, y: 0 };

// Playing card pattern dimensions from playing_cards_metadata.json
const PATTERN_COLUMNS = 13;
const PATTERN_ROWS = 4;

interface PlayingCardProps {
    suit: "Hearts" | "Clubs" | "Diamonds" | "Spades";
    rank: "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "Jack" | "Queen" | "King" | "Ace";
    enhancement?: "Bonus" | "Mult" | "Wild" | "Lucky" | "Glass" | "Steel" | "Stone" | "Gold" | null;
    seal?: "Gold" | "Purple" | "Red" | "Blue" | null;
    edition?: "Foil" | "Holographic" | "Polychrome" | "Negative" | null;
    className?: string;
    size?: number; // Size in pixels (default: 40)
    style?: CSSProperties;
}

// Enhancement positions from enhancers_metadata.json
const ENHANCEMENT_POSITIONS: Record<string, { x: number; y: number }> = {
    "Bonus": { x: 1, y: 1 },
    "Mult": { x: 2, y: 1 },
    "Wild": { x: 3, y: 1 },
    "Lucky": { x: 4, y: 1 },
    "Glass": { x: 5, y: 1 },
    "Steel": { x: 6, y: 1 },
    "Stone": { x: 5, y: 0 },
    "Gold": { x: 6, y: 0 }
};

// Seal positions from enhancers_metadata.json
const SEAL_POSITIONS: Record<string, { x: number; y: number }> = {
    "Gold": { x: 2, y: 0 },
    "Purple": { x: 4, y: 4 },
    "Red": { x: 5, y: 4 },
    "Blue": { x: 6, y: 4 }
};

// Playing card pattern positions from playing_cards_metadata.json
// Balatro sprite sheet order: [2,3,4,5,6,7,8,9,10,J,Q,K,A] — Ace is LAST
const PLAYING_CARD_PATTERNS: Record<string, Record<string, { x: number; y: number }>> = {
    "Hearts": {
        "2": { x: 0, y: 0 }, "3": { x: 1, y: 0 }, "4": { x: 2, y: 0 }, "5": { x: 3, y: 0 }, "6": { x: 4, y: 0 },
        "7": { x: 5, y: 0 }, "8": { x: 6, y: 0 }, "9": { x: 7, y: 0 }, "10": { x: 8, y: 0 }, "Jack": { x: 9, y: 0 },
        "Queen": { x: 10, y: 0 }, "King": { x: 11, y: 0 }, "Ace": { x: 12, y: 0 }
    },
    "Clubs": {
        "2": { x: 0, y: 1 }, "3": { x: 1, y: 1 }, "4": { x: 2, y: 1 }, "5": { x: 3, y: 1 }, "6": { x: 4, y: 1 },
        "7": { x: 5, y: 1 }, "8": { x: 6, y: 1 }, "9": { x: 7, y: 1 }, "10": { x: 8, y: 1 }, "Jack": { x: 9, y: 1 },
        "Queen": { x: 10, y: 1 }, "King": { x: 11, y: 1 }, "Ace": { x: 12, y: 1 }
    },
    "Diamonds": {
        "2": { x: 0, y: 2 }, "3": { x: 1, y: 2 }, "4": { x: 2, y: 2 }, "5": { x: 3, y: 2 }, "6": { x: 4, y: 2 },
        "7": { x: 5, y: 2 }, "8": { x: 6, y: 2 }, "9": { x: 7, y: 2 }, "10": { x: 8, y: 2 }, "Jack": { x: 9, y: 2 },
        "Queen": { x: 10, y: 2 }, "King": { x: 11, y: 2 }, "Ace": { x: 12, y: 2 }
    },
    "Spades": {
        "2": { x: 0, y: 3 }, "3": { x: 1, y: 3 }, "4": { x: 2, y: 3 }, "5": { x: 3, y: 3 }, "6": { x: 4, y: 3 },
        "7": { x: 5, y: 3 }, "8": { x: 6, y: 3 }, "9": { x: 7, y: 3 }, "10": { x: 8, y: 3 }, "Jack": { x: 9, y: 3 },
        "Queen": { x: 10, y: 3 }, "King": { x: 11, y: 3 }, "Ace": { x: 12, y: 3 }
    }
};

export function PlayingCard({ suit, rank, enhancement = null, seal = null, edition = null, className = '', size = 40, style }: PlayingCardProps) {
    const finalW = size;
    const finalH = size * (CARD_HEIGHT / CARD_WIDTH);
    const scale = size / CARD_HEIGHT;

    // Special case: Stone enhancement has no pattern overlay
    if (enhancement === "Stone") {
        const pos = ENHANCEMENT_POSITIONS["Stone"];
        const bgX = -pos.x * ENHANCER_SHEET_WIDTH;
        const bgY = -pos.y * ENHANCER_SHEET_HEIGHT;

        return (
            <div
                className={`relative overflow-hidden inline-block ${className}`}
                style={{
                    width: finalW,
                    height: finalH,

                    ...style
                }}
                title={`${rank} of ${suit} (${enhancement})`}
            >
                <div
                    style={{
                        backgroundImage: `url(/assets/Decks/Enhancers.png)`,
                        backgroundPosition: `${bgX}px ${bgY}px`,
                        backgroundSize: `${ENHANCER_COLUMNS * ENHANCER_SHEET_WIDTH}px ${ENHANCER_ROWS * ENHANCER_SHEET_HEIGHT}px`,
                        width: ENHANCER_SHEET_WIDTH,
                        height: ENHANCER_SHEET_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            </div>
        );
    }

    // Determine base card background image and position
    let baseImageSrc = "/assets/Decks/Enhancers.png";
    let baseBgX = 0;
    let baseBgY = 0;

    if (enhancement) {
        const pos = ENHANCEMENT_POSITIONS[enhancement];
        if (pos) {
            baseBgX = -pos.x * ENHANCER_SHEET_WIDTH;
            baseBgY = -pos.y * ENHANCER_SHEET_HEIGHT;
        }
    } else {
        // Default to StandardCard_Base
        baseBgX = -STANDARD_CARD_BASE.x * ENHANCER_SHEET_WIDTH;
        baseBgY = -STANDARD_CARD_BASE.y * ENHANCER_SHEET_HEIGHT;
    }

    // Determine card pattern background image and position
    let patternImageSrc = "/assets/Decks/8BitDeck.png";
    let patternBgX = 0;
    let patternBgY = 0;

    const patternPos = PLAYING_CARD_PATTERNS[suit]?.[rank];
    if (patternPos) {
        patternBgX = -patternPos.x * CARD_WIDTH;
        patternBgY = -patternPos.y * CARD_HEIGHT;
    }

    // Determine seal overlay background image and position
    let sealOverlaySrc: string | null = null;
    let sealBgX = 0;
    let sealBgY = 0;
    if (seal) {
        const pos = SEAL_POSITIONS[seal];
        if (pos) {
            sealOverlaySrc = "/assets/Decks/Enhancers.png"; // Seals are on the same sheet as enhancers
            sealBgX = -pos.x * ENHANCER_SHEET_WIDTH;
            sealBgY = -pos.y * ENHANCER_SHEET_HEIGHT;
        }
    }

    // Determine edition overlay background image and position
    // Editions.png: 71x94 per edition, horizontal layout (None=0, Foil=1, Holographic=2, Polychrome=3, Debuffed=4)
    // For playing cards, editions are scaled to 142x190 (2x the joker size)
    const EDITION_SPRITE_WIDTH = 71;
    const EDITION_SPRITE_HEIGHT = 94;
    const EDITION_SHEET_WIDTH = 355; // 5 editions × 71px

    const isNegative = edition === "Negative" || false;
    let editionOverlaySrc: string | null = null;
    let editionBgX = 0;
    let editionBgY = 0;

    if (edition && !isNegative) {
        // Map edition to position (matching C# SpriteService logic)
        const editionPosition = edition.toLowerCase() === "foil" ? 1 :
            edition.toLowerCase() === "holographic" || edition.toLowerCase() === "holo" ? 2 :
                edition.toLowerCase() === "polychrome" || edition.toLowerCase() === "poly" ? 3 : -1;

        if (editionPosition >= 0) {
            editionOverlaySrc = "/assets/Jokers/Editions.png";
            editionBgX = -editionPosition * EDITION_SPRITE_WIDTH;
            editionBgY = 0;
        }
    }

    return (
        <div
            className={`relative overflow-hidden inline-block ${className}`}
            style={{
                width: finalW,
                height: finalH,
                imageRendering: 'auto',
                ...style
            }}
            title={`${rank} of ${suit}${enhancement ? ` (${enhancement})` : ''}${seal ? ` [${seal} Seal]` : ''}${edition ? ` [${edition}]` : ''}`}
        >
            {/* Base Card / Enhancement */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${baseImageSrc})`,
                    backgroundPosition: `${baseBgX}px ${baseBgY}px`,
                    backgroundSize: `${ENHANCER_COLUMNS * ENHANCER_SHEET_WIDTH}px ${ENHANCER_ROWS * ENHANCER_SHEET_HEIGHT}px`,
                    width: ENHANCER_SHEET_WIDTH,
                    height: ENHANCER_SHEET_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundRepeat: 'no-repeat',
                    filter: isNegative ? "invert(1)" : "none",
                    imageRendering: 'auto'
                }}
            />

            {/* Card Pattern (Rank & Suit) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${patternImageSrc})`,
                    backgroundPosition: `${patternBgX}px ${patternBgY}px`,
                    backgroundSize: `${PATTERN_COLUMNS * CARD_WIDTH}px ${PATTERN_ROWS * CARD_HEIGHT}px`,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundRepeat: 'no-repeat',
                    imageRendering: 'auto'
                }}
            />

            {/* Seal Overlay */}
            {sealOverlaySrc && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${sealOverlaySrc})`,
                        backgroundPosition: `${sealBgX}px ${sealBgY}px`,
                        backgroundSize: `${ENHANCER_COLUMNS * ENHANCER_SHEET_WIDTH}px ${ENHANCER_ROWS * ENHANCER_SHEET_HEIGHT}px`,
                        width: ENHANCER_SHEET_WIDTH,
                        height: ENHANCER_SHEET_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}

            {/* Edition Overlay (Foil, Holographic, Polychrome) */}
            {editionOverlaySrc && (
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${editionOverlaySrc})`,
                        backgroundPosition: `${editionBgX}px ${editionBgY}px`,
                        backgroundSize: `${EDITION_SHEET_WIDTH}px ${EDITION_SPRITE_HEIGHT}px`,
                        width: EDITION_SPRITE_WIDTH, // Original sprite width
                        height: EDITION_SPRITE_HEIGHT, // Original sprite height
                        transform: `scale(${scale * (CARD_WIDTH / EDITION_SPRITE_WIDTH)})`, // Scale to card size (142/71 = 2x)
                        transformOrigin: 'top left',
                        backgroundRepeat: 'no-repeat',
                        mixBlendMode: 'screen', // Common blend mode for foil/holographic effects
                    }}
                />
            )}
        </div>
    );
}
