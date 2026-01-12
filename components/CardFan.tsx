import React from 'react';
import { PlayingCard } from './PlayingCard';

interface CardFanProps {
    count: number;
    className?: string;
}

export function CardFan({ count, className = '' }: CardFanProps) {
    // Limit count to avoid 100% overlap, but user said 11-20
    const displayCount = Math.min(count, 22);

    // Calculate arc
    const arcAngle = 50; // Total degrees of the arc
    const startAngle = -arcAngle / 2;
    const angleStep = arcAngle / (displayCount - 1 || 1);

    const radius = 120; // Radius of the arc in pixels

    return (
        <div className={`relative h-12 w-28 flex items-end justify-center perspective-1000 overflow-visible ${className}`}>
            {Array.from({ length: displayCount }).map((_, i) => {
                const angle = startAngle + (i * angleStep);
                const angleRad = (angle * Math.PI) / 180;

                // Offset calculation for arc - subtle parabola
                const xOffset = radius * Math.sin(angleRad) * 0.8;
                const yOffset = radius * (1 - Math.cos(angleRad)) * 0.4;

                return (
                    <PlayingCard
                        key={i}
                        rank="2"
                        suit="Clubs"
                        size={42}
                        className="absolute bottom-1 balatro-sway"
                        style={{
                            transformOrigin: 'bottom center',
                            transform: `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${angle}deg)`,
                            zIndex: i,
                            filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.4))',
                            animationDelay: `${i * 0.04}s`
                        }}
                    />
                );
            })}

            {/* Floating Label */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 z-[100] bg-[var(--balatro-blue)] text-white font-header text-xs px-2 py-1 rounded-md shadow-lg border border-white/20 whitespace-nowrap">
                {count}x 2&apos;s
            </div>
        </div>
    );
}
