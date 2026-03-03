import { Trophy, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SeedData } from "@/lib/types";
import { JimboPanel, JimboInnerPanel } from "@/components/JimboPanel";

interface LeaderboardProps {
    seeds: SeedData[];
}

export function Leaderboard({ seeds }: LeaderboardProps) {
    // Derive "Winners" from the top scoring seeds in the dataset
    // Since we don't have a real backend backend, we treat the highest scoring seeds as the "Hall of Fame"
    const topSeeds = [...seeds].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 4);

    return (
        <JimboPanel className="relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--jimbo-gold)] p-2 rounded">
                        <Trophy size={24} className="text-black" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-header text-white tracking-wider">
                        TOP RATED SEEDS
                    </h2>
                </div>
                <JimboInnerPanel className="text-[var(--jimbo-blue)] font-header text-sm tracking-wider px-3 py-1">
                    Global Rankings
                </JimboInnerPanel>
            </div>

            {/* List */}
            <div className="space-y-3 relative z-10">
                {topSeeds.map((entry, i) => (
                    <JimboInnerPanel key={i} className="group flex items-center gap-4 hover:border-[var(--jimbo-panel-edge)] transition-colors">
                        <div className="w-12 text-center">
                            <span className="font-pixel text-[var(--jimbo-grey)] text-lg group-hover:text-white transition-colors">#{i + 1}</span>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            {/* Seed Display */}
                            <div className="font-pixel text-xl tracking-widest text-[var(--jimbo-blue)] bg-[var(--jimbo-dark-blue)] px-2 py-1 rounded border border-[var(--jimbo-blue)]">
                                {entry.seed}
                            </div>

                            <div className="hidden md:block w-px h-4 bg-[var(--jimbo-panel-edge)]"></div>

                            {/* Stats */}
                            <div className="font-pixel text-[var(--jimbo-border-silver)] text-sm uppercase tracking-wider flex gap-4">
                                <span>Twos: <span className="text-white">{entry.twos}</span></span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-header text-2xl text-[var(--jimbo-gold)]">
                                {entry.score}
                            </div>
                            <div className="text-[10px] uppercase font-header text-[var(--jimbo-grey)] tracking-wider">
                                Projected Score
                            </div>
                        </div>
                    </JimboInnerPanel>
                ))}
            </div>
        </JimboPanel>
    );
}
