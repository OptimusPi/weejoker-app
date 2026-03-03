"use client";

import React, { useState, useEffect } from "react";
import { HeartHandshake } from "lucide-react";
import { Sprite } from "./Sprite";
import { JimboPanel, JimboButton, JimboBackButton } from "@/components/JimboPanel";

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
                const data: { wisdom: string } = await response.json();
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
            <JimboPanel onBack={onBack} className="p-8 items-center">

                {/* Header Row: Sprite + Text */}
                <div className="flex items-center gap-4 w-full justify-center">
                    <Sprite name="weejoker" width={48} />
                    <h3 className="text-[var(--jimbo-blue)] font-header text-3xl tracking-widest">
                        Wee Wisdom
                    </h3>
                </div>

                <div className="space-y-4 text-center min-h-[150px] flex flex-col justify-center">
                    {loading ? (
                        <p className="font-pixel text-white leading-relaxed text-sm animate-pulse">
                            Consulting the oracle...
                        </p>
                    ) : error ? (
                        <p className="font-pixel text-[var(--jimbo-red)] leading-relaxed text-sm">
                            {error}
                        </p>
                    ) : (
                        <p className="font-pixel text-white leading-relaxed text-sm">
                            &quot;{wisdom}&quot;
                        </p>
                    )}

                    <div className="pt-4 border-t-2 border-dashed border-[var(--jimbo-panel-edge)] flex flex-col sm:flex-row gap-4 justify-between items-center w-full text-left">
                        <span className="text-xs font-pixel text-[var(--jimbo-grey)] italic">
                            AI-generated wisdom from Cloudflare LLM.
                        </span>
                        <a
                            href="https://findahelpline.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="jimbo-btn jimbo-btn-blue text-xs w-auto"
                        >
                            <HeartHandshake size={16} />
                            Find Support
                        </a>
                    </div>
                </div>
            </JimboPanel>
        </div>
    );
}
