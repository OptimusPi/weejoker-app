
import { SeedData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Play, TrendingUp, Club, Diamond, Heart, Spade, FileSearch } from "lucide-react";
import { useState } from "react";

interface SeedCardProps {
    seed: SeedData;
    className?: string;
    onAnalyze?: (seed: SeedData) => void;
}

export function SeedCard({ seed, className, onAnalyze }: SeedCardProps) {
    const isHighRun = (seed.run_score || 0) > 900;

    return (
        <div className={cn(
            "group relative transition-transform duration-100 hover:-translate-y-2 hover:z-10",
            className
        )}>
            {/* Card Shadow/Border simulated by wrapper */}
            <div className="bg-white rounded-lg p-1.5 shadow-balatro border-2 border-slate-300 relative h-full flex flex-col">

                {/* Inner Border Content */}
                <div className="flex-1 border border-slate-200 rounded p-3 flex flex-col gap-4 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">

                    {/* Header */}
                    <div className="flex justify-between items-start z-10">
                        <div className="bg-slate-800 text-white px-2 py-0.5 rounded text-xs font-header tracking-wider shadow-sm">
                            SEED
                        </div>
                        {isHighRun && (
                            <div className="bg-balatro-gold text-black border border-white px-2 py-0.5 rounded text-xs font-header shadow-sm">
                                META
                            </div>
                        )}
                    </div>

                    {/* Seed Value */}
                    <div className="text-center py-2 z-10">
                        <h3 className="text-3xl font-header tracking-widest text-slate-900 drop-shadow-sm">
                            {seed.seed}
                        </h3>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-1 z-10">
                        <SuitStat icon={Heart} count={seed.suit_hearts} color="text-balatro-red" />
                        <SuitStat icon={Diamond} count={seed.suit_diamonds} color="text-balatro-orange" />
                        <SuitStat icon={Club} count={seed.suit_clubs} color="text-slate-700" />
                        <SuitStat icon={Spade} count={seed.suit_spades} color="text-black" />
                    </div>

                    {/* Bars */}
                    <div className="space-y-3 mt-auto pt-2 z-10">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-header text-balatro-blue w-16 text-right">WEE</span>
                            <div className="flex-1 h-3 bg-slate-200 rounded-sm border border-slate-300 overflow-hidden">
                                <div className="h-full bg-balatro-blue" style={{ width: `${Math.min((seed.joker_wee || 0) / 2, 100)}% ` }} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-header text-balatro-red w-16 text-right">HACK</span>
                            <div className="flex-1 h-3 bg-slate-200 rounded-sm border border-slate-300 overflow-hidden">
                                <div className="h-full bg-balatro-red" style={{ width: `${Math.min((seed.joker_hack || 0), 100)}% ` }} />
                            </div>
                        </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                    <CopyButton seed={seed.seed} />

                    <button
                        onClick={() => onAnalyze?.(seed)}
                        className="bg-balatro-blue hover:bg-blue-400 text-white font-header py-2 rounded text-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        <FileSearch size={20} className="fill-current" />
                        VIEW
                    </button>
                </div>
            </div>
        </div>
    );
}

function CopyButton({ seed }: { seed: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(seed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={cn(
                "font-header py-2 rounded text-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm flex items-center justify-center gap-2",
                copied
                    ? "bg-green-600 border-green-800 text-white"
                    : "bg-slate-700 hover:bg-slate-600 border-slate-900 text-white"
            )}
        >
            {copied ? "COPIED!" : "COPY"}
        </button>
    );
}

function SuitStat({ icon: Icon, count, color }: { icon: any, count?: number, color: string }) {
    const isHigh = (count || 0) > 13;
    return (
        <div className={cn("flex flex-col items-center justify-center py-1 rounded bg-slate-100 border border-slate-200", isHigh && "bg-yellow-50 border-balatro-gold")}>
            <Icon size={16} className={cn("mb-0 fill-current", color)} strokeWidth={2.5} />
            <span className={cn("font-header text-lg leading-none mt-1", isHigh ? "text-balatro-orange" : "text-slate-500")}>
                {count || 0}
            </span>
        </div>
    )
}
