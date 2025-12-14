"use client";

import { SeedData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Copy, Check, Eye } from "lucide-react";
import { useState } from "react";

interface SeedCardProps {
    seed: SeedData;
    className?: string; // Allow external scaling/width classes
    onAnalyze?: (seed: SeedData) => void;
}

export function SeedCard({ seed, className, onAnalyze }: SeedCardProps) {
    const isHighRun = (seed.score || 0) > 17;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(seed.seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn(
            "group relative transition-all duration-200 hover:-translate-y-2",
            className
        )}>
            {/* Main Card - Authentic Balatro Layout */}
            {/* Outer Container: Grey + White Border */}
            <div className="h-full bg-[var(--balatro-grey)] rounded-xl border-[3px] border-white shadow-[0_6px_0_rgba(0,0,0,0.3)] p-1 flex flex-col relative overflow-hidden group-hover:shadow-[0_10px_0_rgba(0,0,0,0.3)] transition-all">

                {/* Inner Container: Darker Grey + Border */}
                <div className="h-full rounded-lg bg-[var(--balatro-grey-dark)] p-4 flex flex-col gap-4 relative">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0"></div>

                    {/* Header: Seed ID */}
                    <div className="flex justify-between items-start z-10">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-header bg-black/60 px-1.5 py-0.5 rounded text-white/70 tracking-wider uppercase border border-white/10 shadow-inner">SEED</span>
                                {isHighRun && (
                                    <span className="text-[10px] font-header bg-[var(--balatro-gold)] text-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-[0_0_8px_rgba(241,196,15,0.6)] animate-pulse border border-white/50">
                                        ★ LEGENDARY
                                    </span>
                                )}
                            </div>
                            <h3 className="text-4xl font-header tracking-widest text-white drop-shadow-[3px_3px_0_black]">
                                {seed.seed}
                            </h3>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 my-1 z-10">
                        <div className="bg-[var(--balatro-grey)] rounded-lg border-2 border-white/10 p-2 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group/stat">
                            <div className="absolute top-0 right-0 w-6 h-6 bg-[var(--balatro-blue)] opacity-20 rounded-bl-xl group-hover/stat:opacity-40 transition-opacity"></div>
                            <span className="text-3xl font-pixel text-white leading-none mb-1 drop-shadow-md">{seed.twos || 0}</span>
                            <span className="text-[10px] font-header text-[var(--balatro-blue)] uppercase tracking-widest drop-shadow-sm">TWOS</span>
                        </div>
                        <div className="bg-[var(--balatro-grey)] rounded-lg border-2 border-white/10 p-2 flex flex-col items-center justify-center shadow-inner relative overflow-hidden group/stat">
                            <div className="absolute top-0 right-0 w-6 h-6 bg-[var(--balatro-red)] opacity-20 rounded-bl-xl group-hover/stat:opacity-40 transition-opacity"></div>
                            <span className="text-3xl font-pixel text-white leading-none mb-1 drop-shadow-md">{seed.score || 0}</span>
                            <span className="text-[10px] font-header text-[var(--balatro-red)] uppercase tracking-widest drop-shadow-sm">SCORE</span>
                        </div>
                    </div>

                    {/* Badges: Rows (A1 / A2) */}
                    <div className="flex flex-col gap-2 flex-grow z-10">
                        {/* Ante 1 Row */}
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] font-pixel text-white/50 uppercase w-4 shrink-0 text-right">A1</span>
                            {(seed.wee_a1_cheap || seed.hack_a1 || seed.chad_a1 || seed.copy_jokers_a1) ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {!!seed.wee_a1_cheap && <Badge label="WEE" color="bg-[var(--balatro-blue)] border-white text-white" />}
                                    {!!seed.hack_a1 && <Badge label="HACK" color="bg-[var(--balatro-red)] border-white text-white" />}
                                    {!!seed.chad_a1 && <Badge label="CHAD" color="bg-[var(--balatro-orange)] border-white text-white" />}
                                    {!!seed.copy_jokers_a1 && <Badge label="COPY" color="bg-purple-600 border-white text-white" />}
                                </div>
                            ) : (
                                <span className="text-[10px] font-pixel text-white/20">-</span>
                            )}
                        </div>

                        {/* Ante 2 Row */}
                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-[10px] font-pixel text-white/50 uppercase w-4 shrink-0 text-right">A2</span>
                            {(seed.hack_a2 || seed.chad_a2 || seed.copy_jokers_a2) ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {!!seed.hack_a2 && <Badge label="HACK" color="bg-[var(--balatro-red)] border-white text-white" />}
                                    {!!seed.chad_a2 && <Badge label="CHAD" color="bg-[var(--balatro-orange)] border-white text-white" />}
                                    {!!seed.copy_jokers_a2 && <Badge label="COPY" color="bg-purple-600 border-white text-white" />}
                                </div>
                            ) : (
                                <span className="text-[10px] font-pixel text-white/20">-</span>
                            )}
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-2 pt-3 border-t-2 border-dashed border-white/10 flex items-center justify-between gap-3 z-10">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                            className={cn(
                                "p-2 rounded-lg transition-all flex-shrink-0 border-2 shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 relative group/btn overflow-hidden",
                                copied
                                    ? "bg-[var(--balatro-green)] border-white text-white"
                                    : "bg-[var(--balatro-grey)] border-white/20 text-white hover:border-white hover:bg-[var(--balatro-grey-light)]"
                            )}
                            title="Copy Seed"
                        >
                            <span className="relative z-10">{copied ? <Check size={18} /> : <Copy size={18} />}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onAnalyze?.(seed); }}
                            className="flex-grow flex items-center justify-center gap-2 bg-[var(--balatro-blue)] hover:brightness-110 text-white font-header text-xl uppercase tracking-wider py-2 rounded-lg shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all border-2 border-white/20 hover:border-white relative overflow-hidden group/btn"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-200"></div>
                            <Eye size={20} className="relative z-10" />
                            <span className="relative z-10">DETAILS</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

function Badge({ label, color }: { label: string, color?: string }) {
    return (
        <span className={cn("px-1.5 py-0.5 text-[10px] font-header uppercase rounded shadow-sm border-[1.5px] tracking-wider", color)}>
            {label}
        </span>
    );
}
