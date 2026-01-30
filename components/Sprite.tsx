"use client";

import { getSpriteData } from "@/lib/SpriteMapper";
import { cn } from "@/lib/utils";

// Dimensions of a single card in the sprite sheet
const CARD_WIDTH = 71;
const CARD_HEIGHT = 95;

export interface SpriteProps {
    name: string;
    className?: string;
    width?: number; // Optional override width (height auto-calcs)
    delayClass?: string; // Optional animation delay class
    edition?: 'Foil' | 'Holographic' | 'Polychrome' | 'Negative' | null;
    sticker?: 'Eternal' | 'Perishable' | 'Rental' | null;
}

// Edition Mapping (assumed based on standard Balatro or generic)
// BUT we have `Editions.png`. 
// Typically:
// Foil: 0,0
// Holographic: 1,0
// Polychrome: 2,0
// Negative: 3,0
const EDITION_COORDS: Record<string, { x: number; y: number }> = {
    'Foil': { x: 0, y: 0 },
    'Holographic': { x: 1, y: 0 },
    'Polychrome': { x: 2, y: 0 },
    'Negative': { x: 3, y: 0 }, // Often Negative has its own shader, but if it's on the sheet...
};

// Sticker Mapping (based on const.ts which says: Eternal 0,0; Rental 1,2; Perishable 0,2)
const STICKER_COORDS: Record<string, { x: number; y: number }> = {
    'Eternal': { x: 0, y: 0 },
    'Perishable': { x: 0, y: 2 },
    'Rental': { x: 1, y: 2 },
};

export function Sprite({ name, className, width, delayClass, edition, sticker }: SpriteProps) {
    // Instant Lookup using the Mapper
    const { pos, type } = getSpriteData(name);

    // Balatro Spritesheet Logic
    // Background Position = -X * Width, -Y * Height
    const bgX = -pos.x * CARD_WIDTH;
    const bgY = -pos.y * CARD_HEIGHT;

    // Use CSS to crop
    const finalW = width || CARD_WIDTH;
    const finalH = width ? width * (CARD_HEIGHT / CARD_WIDTH) : CARD_HEIGHT;
    const scale = finalW / CARD_WIDTH;

    // Base Texture
    const texture = `/assets/${type}.png`;

    // Edition Logic
    const editionPos = edition ? EDITION_COORDS[edition] : null;
    const editionBgX = editionPos ? -editionPos.x * CARD_WIDTH : 0;
    const editionBgY = editionPos ? -editionPos.y * CARD_HEIGHT : 0;

    // Sticker Logic
    const stickerPos = sticker ? STICKER_COORDS[sticker] : null;
    const stickerBgX = stickerPos ? -stickerPos.x * CARD_WIDTH : 0;
    const stickerBgY = stickerPos ? -stickerPos.y * CARD_HEIGHT : 0;

    // Negative Shader Effect (CSS Filter)
    const isNegative = edition === 'Negative';
    const baseFilter = isNegative ? 'invert(1) brightness(1.2) contrast(1.1)' : 'none';

    return (
        <div
            className={cn(`relative overflow-hidden inline-block juice-pop select-none`, delayClass, className)}
            style={{
                width: finalW,
                height: finalH,
                imageRendering: 'pixelated'
            }}
            title={`${name}${edition ? ` (${edition})` : ''}${sticker ? ` [${sticker}]` : ''}`}
        >
            {/* Base Card Layer */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `url(${texture})`,
                    backgroundPosition: `${bgX}px ${bgY}px`,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundRepeat: 'no-repeat',
                    filter: baseFilter
                }}
            />

            {/* Edition Overlay Layer */}
            {edition && edition !== 'Negative' && (
                <div
                    className="absolute inset-0 z-10 mix-blend-screen opacity-60 animate-pulse" // Simple animation for now
                    style={{
                        backgroundImage: `url(/assets/Editions.png)`,
                        backgroundPosition: `${editionBgX}px ${editionBgY}px`,
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}

            {/* Sticker Overlay Layer */}
            {sticker && (
                <div
                    className="absolute inset-0 z-20"
                    style={{
                        backgroundImage: `url(/assets/stickers.png)`,
                        backgroundPosition: `${stickerBgX}px ${stickerBgY}px`,
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}

            {/* Negative Overlay (extra contrast/red tint usually) */}
            {isNegative && (
                <div className="absolute inset-0 z-10 bg-red-500/10 pointer-events-none mix-blend-overlay" />
            )}

        </div>
    );
}
