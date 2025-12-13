
import { SeedData } from "@/lib/types";
import { X, TrendingUp, AlertCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeedAnalysisOverlayProps {
    seed: SeedData;
    onClose: () => void;
}

export function SeedAnalysisOverlay({ seed, onClose }: SeedAnalysisOverlayProps) {
    // Mock analysis data derived from the seed summary
    const tips = [];
    if ((seed.rank_2_count || 0) > 8) tips.push("Excellent candidate for 'Wee Joker' strategy.");
    if ((seed.suit_hearts || 0) > 15) tips.push("Heart-heavy deck. Prioritize 'Lusty Joker' or flush builds.");
    if ((seed.suit_spades || 0) > 15) tips.push("Spade-heavy deck. Look for 'Blackboard' or spade synergies.");
    if ((seed.joker_hack || 0) > 80) tips.push("High potential for 'Hack' re-trigger builds.");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto balatro-panel bg-balatro-panel p-6 md:p-8 animate-in zoom-in-95 duration-200 border-4 border-white/20">

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
                            Score: {seed.run_score}
                        </div>
                        <div className="px-4 py-1 rounded bg-balatro-orange text-white border-2 border-white/20 shadow-sm">
                            Erratic Deck
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Strategy Score */}
                    <div className="p-5 rounded-xl bg-black/20 border-2 border-white/10">
                        <div className="flex items-center gap-2 mb-3 text-balatro-blue">
                            <TrendingUp size={24} />
                            <span className="font-header text-xl">Strategy</span>
                        </div>
                        <div className="space-y-6 font-pixel text-xl">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span>Wee Joker</span>
                                    <span className="text-white">{seed.joker_wee}%</span>
                                </div>
                                <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                    <div className="h-full bg-balatro-blue" style={{ width: `${Math.min((seed.joker_wee || 0), 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span>Hack</span>
                                    <span className="text-white">{seed.joker_hack}%</span>
                                </div>
                                <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                    <div className="h-full bg-balatro-red" style={{ width: `${Math.min((seed.joker_hack || 0), 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suit Distribution */}
                    <div className="p-5 rounded-xl bg-black/20 border-2 border-white/10">
                        <div className="flex items-center gap-2 mb-3 text-balatro-orange">
                            <Award size={24} />
                            <span className="font-header text-xl">Suits</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-2 bg-white rounded border-2 border-balatro-red shadow-sm group hover:-translate-y-1 transition-transform">
                                <div className="text-3xl font-header text-balatro-red">{seed.suit_hearts}</div>
                                <div className="text-xs text-black font-bold uppercase">Hearts</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border-2 border-balatro-orange shadow-sm group hover:-translate-y-1 transition-transform">
                                <div className="text-3xl font-header text-balatro-orange">{seed.suit_diamonds}</div>
                                <div className="text-xs text-black font-bold uppercase">Diamonds</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border-2 border-gray-600 shadow-sm group hover:-translate-y-1 transition-transform">
                                <div className="text-3xl font-header text-gray-700">{seed.suit_clubs}</div>
                                <div className="text-xs text-black font-bold uppercase">Clubs</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded border-2 border-black shadow-sm group hover:-translate-y-1 transition-transform">
                                <div className="text-3xl font-header text-black">{seed.suit_spades}</div>
                                <div className="text-xs text-black font-bold uppercase">Spades</div>
                            </div>
                        </div>
                    </div>

                    {/* Key Cards */}
                    <div className="p-5 rounded-xl bg-black/20 border-2 border-white/10">
                        <div className="flex items-center gap-2 mb-3 text-balatro-green">
                            <AlertCircle size={24} />
                            <span className="font-header text-xl">Stats</span>
                        </div>
                        <div className="space-y-3 font-pixel text-xl">
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded border-l-4 border-balatro-blue">
                                <span className="text-gray-300">Rank '2's</span>
                                <span className="font-bold text-2xl text-white">{seed.rank_2_count}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded border-l-4 border-balatro-green">
                                <span className="text-gray-300">Total Cards</span>
                                <span className="font-bold text-2xl text-white">
                                    {(seed.suit_hearts || 0) + (seed.suit_diamonds || 0) + (seed.suit_clubs || 0) + (seed.suit_spades || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-black/30 border-2 border-balatro-blue/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-balatro-blue"></div>
                    <h3 className="text-xl font-header text-white mb-4 uppercase tracking-wider">Strategic Recommendations</h3>
                    <ul className="space-y-3">
                        {tips.length > 0 ? tips.map((tip, i) => (
                            <li key={i} className="flex gap-3 text-white font-pixel text-xl items-start">
                                <span className="text-balatro-blue mt-1">▶</span>
                                {tip}
                            </li>
                        )) : (
                            <li className="text-gray-500 italic font-pixel text-xl">No specific outstanding strategies detected. Balanced play recommended.</li>
                        )}
                    </ul>
                </div>

            </div>
        </div>
    );
}
