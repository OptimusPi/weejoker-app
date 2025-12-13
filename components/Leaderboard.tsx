
import { Trophy, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data for past victories
const PAST_WINNERS = [
    { date: "12/11/25", seed: "WEEHACK", winner: "JokerKing99", score: 3420 },
    { date: "12/10/25", seed: "LUCKY7", winner: "FlushCheck", score: 2890 },
    { date: "12/09/25", seed: "BARON", winner: "SteelCard", score: 4102 },
    { date: "12/08/25", seed: "MIME", winner: "RedSeal", score: 3150 },
];

export function Leaderboard() {
    return (
        <div className="bg-balatro-panel border-4 border-slate-600 rounded-xl p-6 shadow-balatro relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-balatro-gold p-2 rounded border-2 border-white shadow-sm">
                        <Trophy size={24} className="text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-header text-white tracking-wider drop-shadow-md">
                        HALL OF FAME
                    </h2>
                </div>
                <div className="text-balatro-blue font-header text-sm uppercase tracking-wider bg-black/30 px-3 py-1 rounded">
                    Past Victories
                </div>
            </div>

            {/* List */}
            <div className="space-y-3 relative z-10">
                {PAST_WINNERS.map((entry, i) => (
                    <div key={i} className="group flex items-center gap-4 bg-black/40 p-3 rounded-lg border-2 border-transparent hover:border-balatro-blue/50 transition-colors">
                        <div className="w-12 text-center">
                            <span className="font-pixel text-zinc-500 text-lg">{entry.date}</span>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <div className="font-header text-white text-xl tracking-wide flex items-center gap-2">
                                <User size={16} className="text-balatro-orange" />
                                {entry.winner}
                            </div>
                            <div className="hidden md:block w-px h-4 bg-white/10"></div>
                            <div className="font-pixel text-zinc-400 text-lg uppercase tracking-widest">
                                Seed: <span className="text-zinc-300">{entry.seed}</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="font-header text-2xl text-balatro-gold drop-shadow-sm">
                                +{entry.score}
                            </div>
                            <div className="text-[10px] uppercase font-header text-zinc-500 tracking-wider">
                                Chips
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
            </div>
        </div>
    );
}
