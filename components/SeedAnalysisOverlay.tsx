
import { SeedData } from "@/lib/types";
import { X, TrendingUp, AlertCircle, Check, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto balatro-panel bg-balatro-panel p-6 md:p-8 animate-in zoom-in-95 duration-200 border-4 border-white/20 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-balatro-red text-white rounded border-b-4 border-red-800 hover:bg-red-500 active:translate-y-1 active:border-b-0 transition-all font-header shadow-balatro"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                <div className="mb-8 border-b-2 border-white/10 pb-6">
                    <h2 className="text-4xl font-header text-white mb-2 flex flex-col md:flex-row md:items-center gap-3 drop-shadow-md">
                        <span className="text-balatro-blue bg-black/30 px-3 py-1 rounded inline-block">#{seed.seed}</span>
                        <span className="text-white/60 text-2xl font-pixel">Analysis Report</span>
                    </h2>
                    <div className="flex gap-3 text-lg font-pixel mt-4">
                        <div className="px-4 py-1 rounded bg-balatro-blue text-white border-2 border-white/20 shadow-sm">
                            Score: {seed.score}
                        </div>
                        <div className="px-4 py-1 rounded bg-balatro-gold text-black border-2 border-white/20 shadow-sm animate-pulse">
                            Twos: {seed.twos}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Joker Availability Grid */}
                    <div className="p-5 rounded-xl bg-black/20 border-2 border-white/10">
                        <div className="flex items-center gap-2 mb-4 text-balatro-blue">
                            <TrendingUp size={24} />
                            <span className="font-header text-xl">Ante 1 Availability</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <JokerAvailability name="Wee Joker" available={!!seed.wee_a1_cheap} />
                            <JokerAvailability name="Hack" available={!!seed.hack_a1} />
                            <JokerAvailability name="Chad" available={!!seed.chad_a1} />
                            <JokerAvailability name="Copy Joker" available={!!seed.copy_jokers_a1} />
                            <JokerAvailability name="Drinks" available={!!seed.drinks_a1} />
                        </div>
                    </div>

                    {/* Stats / Strategy */}
                    <div className="p-5 rounded-xl bg-black/20 border-2 border-white/10 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 text-balatro-green">
                            <AlertCircle size={24} />
                            <span className="font-header text-xl">Deck Stats</span>
                        </div>
                        <div className="space-y-4 font-pixel text-xl flex-1">
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded border-l-4 border-balatro-blue">
                                <span className="text-gray-300">Rank &apos;2&apos; Count</span>
                                <span className="font-bold text-2xl text-white">{seed.twos}</span>
                            </div>
                            <div className="text-sm text-gray-400 p-2 italic">
                                * Higher rank 2 count increases probability of drawing them for Wee Joker scaling.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-black/30 border-2 border-balatro-blue/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-balatro-blue"></div>
                    <h3 className="text-xl font-header text-white mb-4 uppercase tracking-wider">Strategic Recommendations</h3>
                    <ul className="space-y-3">
                        {tips.length > 0 ? tips.map((tip, i) => (
                            <li key={i} className="flex gap-3 text-white font-pixel text-lg items-start">
                                <span className="text-balatro-blue mt-0.5">▶</span>
                                {tip}
                            </li>
                        )) : (
                            <li className="text-gray-500 italic font-pixel text-lg">Standard play patterns recommended. No extreme outliers detected.</li>
                        )}
                    </ul>
                </div>

            </div>
        </div>
    );
}

function JokerAvailability({ name, available }: { name: string, available: boolean }) {
    return (
        <div className={cn(
            "flex items-center justify-between p-3 rounded border-2 transition-colors",
            available
                ? "bg-balatro-blue/20 border-balatro-blue/50"
                : "bg-balatro-grey-dark/50 border-white/5 opacity-50"
        )}>
            <span className="font-pixel text-white text-sm uppercase">{name}</span>
            {available
                ? <Check size={20} className="text-balatro-green" strokeWidth={3} />
                : <Ban size={18} className="text-balatro-red" />
            }
        </div>
    )
}
