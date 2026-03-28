'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type JimboSuit = 'Hearts' | 'Diamonds' | 'Clubs' | 'Spades' | 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type JimboRank = 'Ace' | 'King' | 'Queen' | 'Jack' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | 'A' | 'K' | 'Q' | 'J'
export type JimboEnhancement = 'bonus' | 'mult' | 'wild' | 'glass' | 'steel' | 'stone' | 'gold' | 'lucky'
export type JimboSeal = 'gold' | 'red' | 'blue' | 'purple'
export type JimboEdition = 'foil' | 'holographic' | 'polychrome' | 'negative'

const SUIT_SYMBOL: Partial<Record<string, string>> = {
    Hearts: '♥', Diamonds: '♦', Clubs: '♣', Spades: '♠',
    hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
}
const SUIT_COLOR: Partial<Record<string, string>> = {
    Hearts: 'text-red-400', Diamonds: 'text-red-400', Clubs: 'text-white', Spades: 'text-white',
    hearts: 'text-red-400', diamonds: 'text-red-400', clubs: 'text-white', spades: 'text-white',
}
const RANK_DISPLAY: Partial<Record<string, string>> = {
    Ace: 'A', King: 'K', Queen: 'Q', Jack: 'J',
}

interface PlayingCardProps {
    suit: JimboSuit
    rank: JimboRank
    enhancement?: JimboEnhancement | null
    seal?: JimboSeal | null
    edition?: JimboEdition | null
    className?: string
    size?: number
    style?: React.CSSProperties
}

export function PlayingCard({ suit, rank, enhancement: _e, seal: _s, edition: _ed, className, size = 40, style }: PlayingCardProps) {
    const fontSize = Math.round(size * 0.35)
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-sm border border-white/20 bg-[#1a1a2e] select-none',
                SUIT_COLOR[suit],
                className,
            )}
            style={{ width: size, height: Math.round(size * 1.4), fontSize, ...style }}
        >
            <span className="leading-none">{RANK_DISPLAY[rank] ?? rank}</span>
            <span className="leading-none">{SUIT_SYMBOL[suit] ?? suit}</span>
        </div>
    )
}
