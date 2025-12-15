"use client";

import { SeedData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Copy, Check, Eye, Trophy } from "lucide-react";
import { useState } from "react";
import { Sprite } from "./Sprite";

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
            {/* Main Card - Glassmorphism Layout */}
            {/* Outer Container: Glass + White Border */}
            <div className="bg-black/30 backdrop-blur-lg rounded-xl border-[2px] border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-1 flex flex-col relative overflow-hidden group-hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.4)] hover:border-white/80 transition-all">

                {/* Inner Container: Darker Glass + Border */}
                <div className="rounded-lg bg-black/20 p-4 flex flex-col gap-4 relative border border-white/10">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0"></div>

                    {/* Header: Seed ID (Click to Copy) */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                        className="flex items-center gap-4 w-full text-left group/seed hover:bg-black/20 p-2 -ml-2 rounded-lg transition-colors outline-none focus:bg-black/20"
                        title="Click to Copy Seed"
                    >
                        {/* Copy Icon (Left) */}
                        <div className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-lg border-2 shadow-[0_4px_0_rgba(0,0,0,0.5)] transition-all flex-shrink-0 relative overflow-hidden",
                            copied
                                ? "bg-[var(--balatro-green)] border-white text-white translate-y-1 shadow-none"
                                : "bg-[var(--balatro-blue)] border-white/20 text-white group-hover/seed:brightness-110 group-hover/seed:border-white"
                        )}>
                            {copied ? <Check size={20} strokeWidth={3} /> : <Copy size={20} strokeWidth={3} />}
                        </div>

                        {/* Seed Text */}
                        <div className="flex flex-col">
                            <h3 className="text-4xl font-header tracking-widest text-white drop-shadow-[3px_3px_0_black] group-hover/seed:scale-[1.02] transition-transform origin-left">
                                {seed.seed}
                            </h3>
                            {copied && <span className="absolute left-[3.5rem] top-8 text-[10px] bg-black/80 px-2 py-0.5 rounded text-[var(--balatro-green)] font-pixel uppercase animate-fade-in-up md:hidden">Copied!</span>}
                        </div>
                    </button>

                    {/* Stats Grid - Simplified */}
                    <div className="flex gap-4 my-2 z-10 w-full">
                        <div className="bg-[var(--balatro-grey)] rounded-lg border-2 border-white/10 p-2 flex-grow flex flex-col items-center justify-center shadow-inner relative overflow-hidden group/stat">
                            <span className="text-3xl font-pixel text-white leading-none mb-1 drop-shadow-md">{seed.twos || 0}</span>
                            <span className="text-[10px] font-header text-[var(--balatro-blue)] uppercase tracking-widest drop-shadow-sm">TWOS</span>
                        </div>
                        {/* Hidden Score as requested */}
                    </div>

                    {/* Badges: Rows (A1 / A2) */}
                    <div className="flex flex-col gap-2 flex-grow z-10">
                        {/* Ante 1 Row */}
                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-black/10 shadow-inner">
                            <span className="text-[10px] font-pixel text-white/50 uppercase w-4 shrink-0 text-right">A1</span>
                            {(seed.Hack_Ante1 || seed.HanginChad_Ante1 || seed.blueprint_early || seed.brainstorm_early || seed.WeeJoker_Ante1 || seed.WeeJoker_Ante2) ? (
                                <div className="flex flex-wrap gap-2 items-center">
                                    {((seed.WeeJoker_Ante1 || 0) > 0 || (seed.WeeJoker_Ante2 || 0) > 0) && <Badge label="WEE" spriteName="weejoker" />}
                                    {(seed.Hack_Ante1 || 0) > 0 && <Badge label="HACK" spriteName="hack" />}
                                    {(seed.HanginChad_Ante1 || 0) > 0 && <Badge label="CHAD" spriteName="hangingchad" />}
                                    {((seed.blueprint_early || 0) > 0 || (seed.brainstorm_early || 0) > 0) && <Badge label="COPY" spriteName="blueprint" />}
                                </div>
                            ) : (
                                <span className="text-[10px] font-pixel text-white/20">-</span>
                            )}
                        </div>

                        {/* Ante 2 Row */}
                        <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg border border-black/10 shadow-inner">
                            <span className="text-[10px] font-pixel text-white/50 uppercase w-4 shrink-0 text-right">A2</span>
                            {(seed.Hack_Ante2 || seed.HanginChad_Ante2) ? (
                                <div className="flex flex-wrap gap-2 items-center">
                                    {(seed.Hack_Ante2 || 0) > 0 && <Badge label="HACK" spriteName="hack" />}
                                    {(seed.HanginChad_Ante2 || 0) > 0 && <Badge label="CHAD" spriteName="hangingchad" />}
                                </div>
                            ) : (
                                <span className="text-[10px] font-pixel text-white/20">-</span>
                            )}
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-2 pt-3 border-t-2 border-dashed border-white/10 flex items-center justify-center z-10">
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                                className={cn(
                                    "flex-grow flex items-center justify-center gap-2 font-header text-xl uppercase tracking-wider py-2 rounded-lg shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px] transition-all border-[3px] relative overflow-hidden group/btn outline-none focus:ring-2 focus:ring-white/50",
                                    copied
                                        ? "bg-[var(--balatro-green)] border-white text-white"
                                        : "bg-[var(--balatro-blue)] border-white text-white hover:brightness-110"
                                )}
                            >
                                <span className="relative z-10 transition-transform group-hover/btn:scale-105">{copied ? "COPIED!" : "PLAY"}</span>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); onAnalyze?.(seed); }}
                                className="px-4 bg-[var(--balatro-gold)] text-black font-header text-lg uppercase tracking-wider rounded-lg shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px] transition-all border-[3px] border-white hover:brightness-110 flex items-center justify-center relative overflow-hidden group/submit outline-none focus:ring-2 focus:ring-white/50"
                                title="Submit Score"
                            >
                                <Trophy size={20} className="relative z-10" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function Badge({ label, color, spriteName }: { label: string, color?: string, spriteName?: string }) {
    if (spriteName) {
        return (
            <div className="flex flex-col items-center group/badge relative" title={label}>
                <Sprite name={spriteName} width={31} className="shadow-sm border border-black/20 rounded-[2px]" />
            </div>
        );
    }
    return (
        <span className={cn("px-1.5 py-0.5 text-[10px] font-header uppercase rounded shadow-sm border-[1.5px] tracking-wider", color)}>
            {label}
        </span>
    );
}
