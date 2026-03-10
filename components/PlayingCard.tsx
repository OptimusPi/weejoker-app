'use client'

import React from 'react'
import { JimboPlayingCard } from '@jimbo-ui/components/PlayingCard'
import {
    JimboSuit,
    JimboRank,
    JimboEnhancement,
    JimboSeal,
    JimboEdition
} from '@jimbo-ui/types'

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

/**
 * PlayingCard — Refactored to use the Unified Jimbo UI library.
 * This ensures strict adherence to React TS best practices and 
 * eliminates redundant sprite logic in the application.
 */
export function PlayingCard({
    suit,
    rank,
    enhancement,
    seal,
    edition,
    className,
    size = 40,
    style
}: PlayingCardProps) {
    return (
        <JimboPlayingCard
            suit={suit}
            rank={rank}
            enhancement={enhancement ?? undefined}
            seal={seal ?? undefined}
            edition={edition ?? undefined}
            className={className}
            size={size}
            style={style}
        />
    )
}
