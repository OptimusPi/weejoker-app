'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type CardSuit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades' | 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type CardRank = 'Ace' | 'King' | 'Queen' | 'Jack' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | 'A' | 'K' | 'Q' | 'J'
export type CardEnhancement = 'bonus' | 'mult' | 'wild' | 'glass' | 'steel' | 'stone' | 'gold' | 'lucky' | null
export type CardSeal = 'gold' | 'red' | 'blue' | 'purple' | null
export type CardEdition = 'Foil' | 'Holographic' | 'Polychrome' | 'Negative' | null

const CARD_WIDTH = 71
const CARD_HEIGHT = 95

// 8BitDeck.png is 13 columns (A,2,3,4,5,6,7,8,9,10,J,Q,K) x 4 rows (Spades, Hearts, Clubs, Diamonds)
const RANK_TO_COL: Record<string, number> = {
    'Ace': 0, 'A': 0,
    '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8,
    '10': 9,
    'Jack': 10, 'J': 10,
    'Queen': 11, 'Q': 11,
    'King': 12, 'K': 12,
}

const SUIT_TO_ROW: Record<string, number> = {
    'Spades': 0, 'spades': 0,
    'Hearts': 1, 'hearts': 1,
    'Clubs': 2, 'clubs': 2,
    'Diamonds': 3, 'diamonds': 3,
}

// Enhancers.png is 7 columns x 5 rows
// Row 0: Base, Bonus, Mult, Wild, Glass, Steel, Stone
// Row 1: Gold, Lucky, (seals start)
const ENHANCEMENT_TO_POS: Record<string, { x: number; y: number }> = {
    'bonus': { x: 1, y: 0 },
    'mult': { x: 2, y: 0 },
    'wild': { x: 3, y: 0 },
    'glass': { x: 4, y: 0 },
    'steel': { x: 5, y: 0 },
    'stone': { x: 6, y: 0 },
    'gold': { x: 0, y: 1 },
    'lucky': { x: 1, y: 1 },
}

const SEAL_TO_POS: Record<string, { x: number; y: number }> = {
    'gold': { x: 2, y: 1 },
    'red': { x: 3, y: 1 },
    'blue': { x: 4, y: 1 },
    'purple': { x: 5, y: 1 },
}

const EDITION_TO_POS: Record<string, { x: number; y: number }> = {
    'Foil': { x: 0, y: 0 },
    'Holographic': { x: 1, y: 0 },
    'Polychrome': { x: 2, y: 0 },
    'Negative': { x: 3, y: 0 },
}

interface RealPlayingCardProps {
    suit: CardSuit
    rank: CardRank
    enhancement?: CardEnhancement
    seal?: CardSeal
    edition?: CardEdition
    className?: string
    size?: number
    style?: React.CSSProperties
}

export function RealPlayingCard({ 
    suit, 
    rank, 
    enhancement, 
    seal, 
    edition, 
    className, 
    size = 71, 
    style 
}: RealPlayingCardProps) {
    const col = RANK_TO_COL[rank]
    const row = SUIT_TO_ROW[suit]
    
    if (col === undefined || row === undefined) {
        console.warn(`Invalid card: ${rank} of ${suit}`)
        return null
    }

    const scale = size / CARD_WIDTH
    const finalH = size * (CARD_HEIGHT / CARD_WIDTH)

    // Base card position
    const bgX = -col * CARD_WIDTH
    const bgY = -row * CARD_HEIGHT

    // Enhancement background (if any)
    const enhPos = enhancement ? ENHANCEMENT_TO_POS[enhancement] : { x: 0, y: 0 }
    const enhBgX = -enhPos.x * CARD_WIDTH
    const enhBgY = -enhPos.y * CARD_HEIGHT

    // Seal overlay
    const sealPos = seal ? SEAL_TO_POS[seal] : null
    const sealBgX = sealPos ? -sealPos.x * CARD_WIDTH : 0
    const sealBgY = sealPos ? -sealPos.y * CARD_HEIGHT : 0

    // Edition overlay
    const editionPos = edition ? EDITION_TO_POS[edition] : null
    const editionBgX = editionPos ? -editionPos.x * CARD_WIDTH : 0
    const editionBgY = editionPos ? -editionPos.y * CARD_HEIGHT : 0

    const isNegative = edition === 'Negative'
    const baseFilter = isNegative ? 'invert(0.94)' : 'none'

    return (
        <div
            className={cn('relative overflow-hidden inline-block select-none', className)}
            style={{
                width: size,
                height: finalH,
                imageRendering: 'pixelated',
                ...style
            }}
            title={`${rank} of ${suit}${enhancement ? ` (${enhancement})` : ''}${seal ? ` [${seal} seal]` : ''}${edition ? ` {${edition}}` : ''}`}
        >
            {/* Enhancement background layer */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: 'url(/assets/Enhancers.png)',
                    backgroundPosition: `${enhBgX}px ${enhBgY}px`,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* Card face layer */}
            <div
                className="absolute inset-0 z-[1]"
                style={{
                    backgroundImage: 'url(/assets/8BitDeck.png)',
                    backgroundPosition: `${bgX}px ${bgY}px`,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    backgroundRepeat: 'no-repeat',
                    filter: baseFilter
                }}
            />

            {/* Edition overlay */}
            {edition && edition !== 'Negative' && (
                <div
                    className="absolute inset-0 z-[2] mix-blend-screen opacity-60"
                    style={{
                        backgroundImage: 'url(/assets/Editions.png)',
                        backgroundPosition: `${editionBgX}px ${editionBgY}px`,
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}

            {/* Seal overlay */}
            {seal && (
                <div
                    className="absolute inset-0 z-[3]"
                    style={{
                        backgroundImage: 'url(/assets/Enhancers.png)',
                        backgroundPosition: `${sealBgX}px ${sealBgY}px`,
                        width: CARD_WIDTH,
                        height: CARD_HEIGHT,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}

            {/* Negative tint */}
            {isNegative && (
                <div className="absolute inset-0 z-[4] bg-red-500/10 pointer-events-none mix-blend-overlay" />
            )}
        </div>
    )
}
