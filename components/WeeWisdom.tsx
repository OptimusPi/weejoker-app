"use client";

import React from "react";
import { HeartHandshake } from "lucide-react";
import { Sprite } from "./Sprite";

interface WeeWisdomProps {
    onBack: () => void;
}

export function WeeWisdom({ onBack }: WeeWisdomProps) {
    return (
        <div className="w-full">
            <div className="balatro-panel p-8 flex flex-col gap-6 items-center relative overflow-hidden">

                {/* Header Row: Sprite + Text */}
                <div className="flex items-center gap-4 w-full justify-center">
                    <Sprite name="weejoker" width={48} className="drop-shadow-lg" />
                    <h3 className="text-[var(--balatro-blue)] font-header text-3xl tracking-widest drop-shadow-md">
                        Wee Wisdom
                    </h3>
                </div>

                <div className="space-y-4 text-center">
                    <p className="font-pixel text-white/90 leading-relaxed text-sm">
                        &quot;Every time you play a rank 2 card, I level up. <span className="text-[var(--balatro-blue)] font-header">+8 Chips</span>.&quot;
                    </p>
                    <p className="font-pixel text-white/90 leading-relaxed text-sm">
                        Did you know? Research shows that just <span className="text-[var(--balatro-blue)] font-header">8 minutes</span> of conversation with a friend can significantly reduce feelings of depression and loneliness.
                    </p>
                    <p className="font-pixel text-white/60 italic text-xs border-l-2 border-[var(--balatro-blue)] pl-2 text-left mx-auto max-w-md">
                        Just like in Balatro, small connections stack up to big results.
                    </p>

                    <div className="pt-4 border-t-2 border-dashed border-white/20 flex flex-col sm:flex-row gap-4 justify-between items-center w-full text-left">
                        <span className="text-xs font-pixel text-white/60 italic">
                            Got 8 minutes? Call a friend today.
                        </span>
                        <a
                            href="https://findahelpline.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="balatro-button balatro-button-blue text-xs flex items-center gap-2"
                        >
                            <HeartHandshake size={16} />
                            Find Support
                        </a>
                    </div>
                </div>

                {/* Back Button - Full Width Orange Style */}
                <button
                    onClick={onBack}
                    className="balatro-button-back mt-2"
                >
                    Back
                </button>
            </div>
        </div>
    );
}
