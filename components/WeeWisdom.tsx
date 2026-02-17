"use client";

import React, { useState, useEffect } from "react";
import { HeartHandshake } from "lucide-react";
import { Sprite } from "./Sprite";

interface WeeWisdomProps {
    onBack: () => void;
}

export function WeeWisdom({ onBack }: WeeWisdomProps) {
    const [wisdom, setWisdom] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWisdom = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/wisdom');
                if (!response.ok) {
                    throw new Error('Failed to fetch wisdom from the digital ether.');
                }
                const data = await response.json();
                setWisdom(data.wisdom);
            } catch (e: any) {
                setError(e.message || "An unknown error occurred.");
            } finally {
                setLoading(false);
            }
        };

        fetchWisdom();
    }, []);

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

                <div className="space-y-4 text-center min-h-[150px] flex flex-col justify-center">
                    {loading ? (
                        <p className="font-pixel text-white/90 leading-relaxed text-sm animate-pulse">
                            Consulting the oracle...
                        </p>
                    ) : error ? (
                        <p className="font-pixel text-red-400 leading-relaxed text-sm">
                            {error}
                        </p>
                    ) : (
                        <p className="font-pixel text-white/90 leading-relaxed text-sm">
                            &quot;{wisdom}&quot;
                        </p>
                    )}
                    
                    <div className="pt-4 border-t-2 border-dashed border-white/20 flex flex-col sm:flex-row gap-4 justify-between items-center w-full text-left">
                        <span className="text-xs font-pixel text-white/60 italic">
                            AI-generated wisdom from Cloudflare LLM.
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
