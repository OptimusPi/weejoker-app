"use client";

// Dimensions of a single card in the sprite sheet
const CARD_WIDTH = 71;
const CARD_HEIGHT = 95;

// Static Joker Mapping (No more fetch garbage)
const JOKER_MAP: Record<string, { x: number; y: number }> = {
    // Basic Jokers
    "Joker": { x: 0, y: 0 },
    "Greedy Joker": { x: 1, y: 0 },
    "Lusty Joker": { x: 2, y: 0 },
    "Wrathful Joker": { x: 3, y: 0 },
    "Gluttonous Joker": { x: 4, y: 0 },
    "Jolly Joker": { x: 5, y: 0 },
    "Zany Joker": { x: 6, y: 0 },
    "Mad Joker": { x: 7, y: 0 },
    "Crazy Joker": { x: 8, y: 0 },
    "Droll Joker": { x: 9, y: 0 },

    // Key MVP Jokers
    "Wee Joker": { x: 0, y: 0 },
    "weejoker": { x: 0, y: 0 },
    "Hanging Chad": { x: 9, y: 6 }, // Corrected from 0,8
    "hangingchad": { x: 9, y: 6 },
    "Hack": { x: 5, y: 2 },         // Corrected from 1,8
    "hack": { x: 5, y: 2 },
    "Blueprint": { x: 0, y: 3 },    // Corrected from 2,10
    "blueprint": { x: 0, y: 3 },
    "Brainstorm": { x: 7, y: 7 },   // Corrected from 2,11
    "brainstorm": { x: 7, y: 7 },
    "Showman": { x: 6, y: 5 },      // Corrected from 3,8
    "showman": { x: 6, y: 5 },
    "Invisible Joker": { x: 1, y: 7 }, // Corrected from 4,10
    "invisiblejoker": { x: 1, y: 7 },
    "Red Seal": { x: 0, y: 0 }, // Placeholder/TODO
};

// Fallback for unknown jokers to prevent crash
const DEFAULT_POS = { x: 0, y: 0 };

export interface SpriteProps {
    name: string;
    className?: string;
    width?: number; // Optional override width (height auto-calcs)
}

export function Sprite({ name, className, width }: SpriteProps) {
    // Instant Lookup
    const pos = JOKER_MAP[name] || JOKER_MAP[name.toLowerCase()] || JOKER_MAP["Joker"];

    // Balatro Spritesheet Logic
    // Background Position = -X * Width, -Y * Height
    const bgX = -pos.x * CARD_WIDTH;
    const bgY = -pos.y * CARD_HEIGHT;

    // Use CSS to crop
    const finalW = width || CARD_WIDTH;
    const finalH = width ? width * (CARD_HEIGHT / CARD_WIDTH) : CARD_HEIGHT;
    const scale = finalW / CARD_WIDTH;

    return (
        <div
            className={`relative overflow-hidden inline-block ${className}`}
            style={{
                width: finalW,
                height: finalH,
                imageRendering: 'pixelated'
            }}
            title={name}
        >
            <div
                style={{
                    backgroundImage: `url(/assets/Jokers.png)`,
                    backgroundPosition: `${bgX}px ${bgY}px`,
                    width: CARD_WIDTH, // Original Width
                    height: CARD_HEIGHT, // Original Height
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundRepeat: 'no-repeat'
                }}
            />
        </div>
    );
}
