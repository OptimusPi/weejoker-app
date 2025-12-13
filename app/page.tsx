import { MOCK_SEEDS } from "@/lib/mockData";
import Explorer from "@/components/Explorer";
import { Leaderboard } from "@/components/Leaderboard";

export default function Home() {
    return (
        <main className="min-h-screen py-20">
            <div className="container mx-auto px-4 mb-16 text-center z-10">
                <header className="border-b-4 border-white/20 pb-6 mb-8">
                    <h1 className="text-5xl md:text-7xl font-header tracking-widest text-white drop-shadow-md mb-2">
                        THE DAILY WEE
                    </h1>
                    <div className="flex justify-center items-center gap-4 font-pixel text-xl md:text-2xl text-zinc-400 uppercase tracking-widest">
                        <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span className="w-1.5 h-1.5 bg-balatro-red rounded-full"></span>
                        <span>No. {Math.floor((Date.now() - new Date('2025-01-01').getTime()) / (1000 * 60 * 60 * 24))}</span>
                    </div>
                </header>

                <p className="text-xl text-zinc-300 max-w-2xl mx-auto font-pixel">
                    Start your <span className="text-balatro-blue font-bold">Erratic Deck</span> run with today's perfect seed.
                </p>
            </div>

            <div className="container mx-auto px-4 mb-24">
                <Leaderboard />
            </div>

            <Explorer initialSeeds={MOCK_SEEDS} />
        </main>
    );
}
