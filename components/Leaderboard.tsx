import { Trophy, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeedData } from "@/lib/types";

interface LeaderboardProps {
    seeds: SeedData[];
}

export function Leaderboard({ seeds }: LeaderboardProps) {
    // Derive "Winners" from the top scoring seeds in the dataset
    // Since we don't have a real backend backend, we treat the highest scoring seeds as the "Hall of Fame"
    const topSeeds = [...seeds].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 4);

    return (
        <div className="bg-[var(--balatro-grey-darker)] border-[3px] border-white/80 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--balatro-gold)] p-2 rounded border-2 border-white shadow-sm">
                        <Trophy size={24} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-header text-white tracking-wider drop-shadow-md">
                        TOP RATED SEEDS
                    </h2>
                </div>
                <div className="text-[var(--balatro-blue)] font-header text-sm uppercase tracking-wider bg-black/40 px-3 py-1 rounded border border-white/10">
                    Global Rankings
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 relative z-10">
                {topSeeds.map((entry, i) => (
                    <div key={i} className="group flex items-center gap-4 bg-[#1F2937] p-3 rounded-lg border-2 border-white/5 hover:border-white/40 transition-colors shadow-sm">
                        <div className="w-12 text-center">
                            <span className="font-pixel text-zinc-500 text-lg group-hover:text-white transition-colors">#{i + 1}</span>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            {/* Seed Display */}
                            <div className="font-pixel text-xl tracking-widest text-[var(--balatro-blue)] bg-black/20 px-2 py-1 rounded border border-white/5">
                                {entry.seed}
                            </div>

                            <div className="hidden md:block w-px h-4 bg-white/10"></div>

                            {/* Stats */}
                            <div className="font-pixel text-zinc-400 text-sm uppercase tracking-wider flex gap-4">
                                <span>Twos: <span className="text-white">{entry.twos}</span></span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-header text-2xl text-[var(--balatro-gold)] drop-shadow-sm">
                                {entry.score}
                            </div>
                            <div className="text-[10px] uppercase font-header text-zinc-500 tracking-wider">
                                Projected Score
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0"></div>
        </div>
    );
}
