"use client";

import { SeedData } from "@/lib/types";
import { X, TrendingUp, AlertCircle, Check, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { JimboPanel, JimboInnerPanel } from "./JimboPanel";

interface SeedAnalysisOverlayProps {
    seed: SeedData;
    onClose: () => void;
}

export function SeedAnalysisOverlay({ seed, onClose }: SeedAnalysisOverlayProps) {
    // Derived Tips
    const tips = [];
    if ((seed.twos || 0) > 12) tips.push("Heavy Rank 2 deck. Excellent for Wee Joker scaling.");
    if (seed.hack_a1) tips.push("Hack is available in Ante 1! Immediate re-trigger potential.");
    if (seed.wee_a1_cheap) tips.push("Wee Joker is cheap/available in Ante 1. Instant scaling.");
    if (seed.chad_a1) tips.push("Chad in Ante 1. Great for photographing face cards later.");
    if (seed.copy_jokers_a1) tips.push("Copy Joker available early. Flexible build path.");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <JimboPanel
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto !p-0"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 p-6 border-b border-white/10 flex justify-between items-start bg-[#1a1a1a]">
                    <div className="mb-2">
                        <h2 className="text-3xl md:text-4xl font-header text-white mb-2 flex flex-col md:flex-row md:items-center gap-3 drop-shadow-md tracking-widest uppercase">
                            <span className="text-[var(--jimbo-blue)]">#{seed.seed}</span>
                            <span className="text-[var(--jimbo-grey)] text-2xl font-pixel">Analysis Report</span>
                        </h2>
                        <div className="flex gap-3 text-sm font-pixel mt-4">
                            <div className="px-4 py-1 rounded bg-[var(--jimbo-dark-blue)] text-white border border-[var(--jimbo-blue)]">
                                Score: {seed.score}
                            </div>
                            <div className="px-4 py-1 rounded bg-[var(--jimbo-gold)] text-black border border-[var(--jimbo-gold)] animate-pulse">
                                Twos: {seed.twos}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="jimbo-btn jimbo-btn-red !py-2 !px-4"
                        aria-label="Close"
                        title="Close"
                    >
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Joker Availability Grid */}
                        <JimboInnerPanel className="p-5">
                            <div className="flex items-center gap-2 mb-4 text-[var(--jimbo-blue)]">
                                <TrendingUp size={24} />
                                <span className="font-header text-xl uppercase tracking-wider">Ante 1 Availability</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <JokerAvailability name="Wee Joker" available={!!seed.wee_a1_cheap} />
                                <JokerAvailability name="Hack" available={!!seed.hack_a1} />
                                <JokerAvailability name="Chad" available={!!seed.chad_a1} />
                                <JokerAvailability name="Copy Joker" available={!!seed.copy_jokers_a1} />
                                <JokerAvailability name="Drinks" available={!!seed.drinks_a1} />
                            </div>
                        </JimboInnerPanel>

                        {/* Stats / Strategy */}
                        <JimboInnerPanel className="p-5 flex flex-col">
                            <div className="flex items-center gap-2 mb-4 text-[var(--jimbo-dark-green)]">
                                <AlertCircle size={24} />
                                <span className="font-header text-xl uppercase tracking-wider">Deck Stats</span>
                            </div>
                            <div className="space-y-4 font-pixel flex-1">
                                <div className="flex justify-between items-center p-3 bg-[#111] rounded border-l-4 border-[var(--jimbo-blue)]">
                                    <span className="text-[var(--jimbo-grey)] text-xs">Rank &apos;2&apos; Count</span>
                                    <span className="font-header text-2xl text-[var(--jimbo-gold)]">{seed.twos}</span>
                                </div>
                                <div className="text-[10px] text-[var(--jimbo-grey)] p-2 italic uppercase">
                                    * Higher rank 2 count increases probability of drawing them for Wee Joker scaling.
                                </div>
                            </div>
                        </JimboInnerPanel>
                    </div>

                    <JimboInnerPanel className="p-6 relative overflow-hidden border-[var(--jimbo-blue)] bg-[#124]">
                        <h3 className="text-xl font-header text-[var(--jimbo-blue)] mb-4 uppercase tracking-wider drop-shadow-sm">Strategic Recommendations</h3>
                        <ul className="space-y-3">
                            {tips.length > 0 ? tips.map((tip, i) => (
                                <li key={i} className="flex gap-3 text-white font-pixel text-xs items-start uppercase leading-relaxed">
                                    <span className="text-[var(--jimbo-blue)] mt-0.5">▶</span>
                                    {tip}
                                </li>
                            )) : (
                                <li className="text-[var(--jimbo-grey)] italic font-pixel text-xs uppercase">Standard play patterns recommended. No extreme outliers detected.</li>
                            )}
                        </ul>
                    </JimboInnerPanel>
                </div>
            </JimboPanel>
        </div>
    );
}

function JokerAvailability({ name, available }: { name: string, available: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded-lg border-2 transition-colors",
            available
                ? "bg-[#124] border-[var(--jimbo-blue)]"
                : "bg-[#222] border-transparent opacity-50"
        )}>
            <span className={cn("font-pixel text-[10px] uppercase", available ? "text-white" : "text-[var(--jimbo-grey)]")}>{name}</span>
            {available
                ? <Check size={20} className="text-[var(--jimbo-dark-green)]" strokeWidth={3} />
                : <Ban size={18} className="text-[var(--jimbo-red)]" />
            }
        </div>
    )
}
