"use client";

import { ChevronLeft, ChevronRight, Trophy, Play } from "lucide-react";
import { useState } from "react";
import { Sprite } from "./Sprite";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

interface RitualChallengeBoardProps {
    seed: string;
    objectives: string[];
    onCopy: () => void;
    onShowHowTo: () => void;
    onOpenSubmit: () => void;
    onOpenLeaderboard: () => void;
    isLocked?: boolean;
    dayNumber?: number; // Added to display "NO. 25"
    onPrevDay?: () => void;
    onNextDay?: () => void;
    canGoBack?: boolean;
    canGoForward?: boolean;
}

export function RitualChallengeBoard({
    seed,
    objectives,
    onCopy,
    onShowHowTo,
    onOpenSubmit,
    onOpenLeaderboard,
    isLocked,
    dayNumber = 25, // Default for now if not passed
    onPrevDay,
    onNextDay,
    canGoBack,
    canGoForward
}: RitualChallengeBoardProps) {
    const [activeTab, setActiveTab] = useState<'DETAILS' | 'HOW TO' | 'SCORES'>('DETAILS');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-2 p-4 animate-in fade-in duration-500">

            {/* Top Seed Bar */}
            <div className="flex bg-[var(--balatro-black)] border-2 border-[var(--balatro-black)] rounded-t-xl overflow-hidden shadow-balatro relative z-10 w-full max-w-md mx-auto">
                <div className="flex-[2] bg-[var(--balatro-black)] p-2 flex items-center justify-center border-r-2 border-white/5 relative group cursor-pointer" onClick={handleCopy}>
                    <span className="font-header text-2xl text-white tracking-widest">{seed}</span>
                    <Copy size={12} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 text-white transition-opacity" />
                </div>
                <div className="flex-1 bg-white/5 p-2 flex flex-col items-center justify-center leading-none">
                    <span className="font-header text-xl text-white">14</span>
                    <span className="font-pixel text-[8px] text-white/50 uppercase tracking-widest">Starting 2's</span>
                </div>
            </div>

            {/* Main Content Area: Nav + Card + Nav */}
            <div className="flex items-stretch justify-center gap-4 h-[500px]">

                {/* Left Nav */}
                <button
                    onClick={onPrevDay}
                    disabled={!canGoBack}
                    className="w-16 bg-[var(--balatro-red)] rounded-l-xl flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-balatro border-b-4 border-red-900"
                >
                    <ChevronLeft className="text-white w-8 h-8" strokeWidth={3} />
                </button>

                {/* Center Card */}
                <div className="flex-1 max-w-md bg-[var(--balatro-black)] border-2 border-white/10 rounded-b-xl shadow-2xl flex flex-col relative overflow-hidden">

                    {/* Tabs */}
                    <div className="flex justify-center gap-2 py-4 border-b border-white/5">
                        {['DETAILS', 'HOW TO', 'SCORES'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={cn(
                                    "px-4 py-1 text-[10px] font-header text-white uppercase tracking-wider rounded transition-colors",
                                    activeTab === tab
                                        ? "bg-[var(--balatro-red)] shadow-sm"
                                        : "bg-black/40 hover:bg-white/10"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
                        {/* Placeholder Content for now - matching screenshot usually implies just graphic or basic info before 'Details' expansion */}

                        {/* Two Cards Graphic (Placeholder based on screenshot) */}
                        <div className="flex items-end gap-3 mb-8">
                            <div className="relative group">
                                <div className="absolute -top-3 -right-3 bg-[var(--balatro-gold)] text-black font-header text-xs w-5 h-5 flex items-center justify-center rounded-full z-10 border border-black">1</div>
                                <Sprite name="wee" width={64} className="drop-shadow-xl" />
                                <div className="text-center font-pixel text-[9px] mt-2 text-white/50 uppercase">Wee Joker</div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -top-3 -right-3 bg-[var(--balatro-blue)] text-white font-header text-xs w-5 h-5 flex items-center justify-center rounded-full z-10 border border-black">2</div>
                                <div className="w-[64px] h-[86px] bg-white rounded flex items-center justify-center shadow-xl">
                                    <span className="text-black font-pixel text-[8px] text-center p-1 leading-tight opacity-50">BALATRO<br />TRACKING<br />CARD</span>
                                </div>
                                <div className="text-center font-pixel text-[9px] mt-2 text-white/50 uppercase">Tracking Card</div>
                            </div>
                        </div>

                    </div>

                    {/* Big Red Play Button */}
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        <button
                            onClick={onOpenSubmit}
                            disabled={isLocked}
                            className="w-full bg-[var(--balatro-red)] hover:bg-red-500 text-white font-header text-xl py-4 rounded shadow-[0_4px_0_#7f1d1d] active:shadow-none active:translate-y-[4px] transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                        >
                            {isLocked ? (
                                <span className="opacity-80">RITUAL LOCKED</span>
                            ) : (
                                <>PLAY WEE NO. {dayNumber}</>
                            )}
                        </button>
                    </div>

                </div>

                {/* Right Nav */}
                <button
                    onClick={onNextDay}
                    disabled={!canGoForward}
                    className="w-16 bg-[var(--balatro-red)] rounded-r-xl flex items-center justify-center hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-balatro border-b-4 border-red-900"
                >
                    <ChevronRight className="text-white w-8 h-8" strokeWidth={3} />
                </button>
            </div>

            {/* Footer Leaderboard Tease */}
            <div
                onClick={onOpenLeaderboard}
                className="w-full max-w-lg mx-auto bg-[var(--balatro-black)]/80 border border-white/10 rounded p-2 flex items-center justify-between px-4 cursor-pointer hover:bg-[var(--balatro-black)] transition-colors mt-2 group"
            >
                <div className="flex flex-col leading-none">
                    <span className="font-header text-[var(--balatro-gold)] text-xs uppercase tracking-widest group-hover:text-white transition-colors">Who is the Daily #1?</span>
                    <span className="font-pixel text-[8px] text-white/40 uppercase tracking-[0.2em] group-hover:text-white/60">Check the Global Leaderboards Now</span>
                </div>
                <Trophy size={16} className="text-white/20 group-hover:text-[var(--balatro-gold)] transition-colors" />
            </div>

        </div>
    );
}
