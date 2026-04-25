"use client";

import { JamlGameCard } from "jaml-ui";

export interface SpriteProps {
    name: string;
    className?: string;
    width?: number;
    delayClass?: string;
    edition?: 'Foil' | 'Holographic' | 'Polychrome' | 'Negative' | null;
    sticker?: 'Eternal' | 'Perishable' | 'Rental' | null;
}

export function Sprite({ name, className, width, edition, sticker }: SpriteProps) {
    const scale = width ? width / 71 : undefined;

    return (
        <JamlGameCard
            card={{
                name,
                edition: edition ?? undefined,
                isEternal: sticker === 'Eternal',
                isPerishable: sticker === 'Perishable',
                isRental: sticker === 'Rental',
                scale,
            }}
            type="joker"
            className={className}
        />
    );
}
