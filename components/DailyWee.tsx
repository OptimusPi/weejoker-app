
import { SeedData } from "@/lib/types";
import { Crown, HelpCircle, Upload, Trophy } from "lucide-react";
import { SeedCard } from "./SeedCard";
import { useState } from "react";
import { HowToPlay } from "./HowToPlay";
import Image from "next/image";

const getHeaderDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = String(date.getFullYear()).slice(-2); // Last two digits of the year
    return `${month}${day}${year} `;
};

const getDailyTheme = (date: Date) => {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, ...

    switch (day) {
        case 1: // Monday
            return {
                name: "MAD MONDAY",
                description: "Battle of the Eternals. Wee Joker vs. Madness. Can you survive the purge?",
                hint: "Requires Black Stake. Eternal Riff-Raff feeds the Madness.",
                color: "bg-red-900 border-2 border-red-500",
                icon: "😡"
            };
        case 2: // Tuesday
            return {
                name: "TWO-TWO TUESDAY",
                description: "Double Vision. A deck full of Rank 2s and a Spectral Ankh to clone your Wee.",
                hint: "Use Ankh immediately to double your scaling potential.",
                color: "bg-balatro-blue border-2 border-cyan-400",
                icon: "2️⃣"
            };
        case 3: // Wednesday
            return {
                name: "WICKED WEDNESDAY",
                description: "Vampire vibes. Midas Mask + Vampire synergy... enabled by Pareidolia.",
                hint: "Pareidolia makes your 2s into Face Cards for Midas. Vampire feasts on the Gold. Wee scales to the moon.",
                color: "bg-purple-900 border-2 border-purple-500",
                icon: "🧛"
            };
        case 4: // Thursday
            return {
                name: "THIRSTY THURSDAY",
                description: "Quench your thirst. Seltzer, Cola, and Diet Cola drinks appear in shops.",
                hint: "Look for Glass Cards and the 'Canio' Legendary if possible.",
                color: "bg-orange-500 border-2 border-yellow-300",
                icon: "🥤"
            };
        case 5: // Friday (314X Dev Mode - Polychrome!)
            return {
                name: "FREAKY FRIDAY",
                description: "Chaos reigns. An Erratic Deck with a bizarre distribution (e.g. 20 Aces, 0 Face cards).",
                hint: "Pareidolia might be useless here. Focus on the raw chips.",
                color: "bg-pink-600 polychrome border-2 border-white", // 🌈 POLYCHROME!
                icon: "🤪"
            };
        case 0: // Sunday
        case 6: // Saturday
            return {
                name: "WILDCARD WEEKEND",
                description: "No hints. No spoilers. Determine the optimal path yourself.",
                color: "bg-balatro-gold border-2 border-yellow-200",
                icon: "🃏",
                isMystery: true
            };
        default:
            return {
                name: "314X DAILY", // 🥧 Secret title
                description: "Beat the target score!",
                color: "bg-balatro-bg-dark polychrome",
                icon: "✨"
            };
    }
};

export function DailyWee({ seed }: { seed: SeedData }) {
    const [showHowTo, setShowHowTo] = useState(false);

    // In a real app, use the actual seed's date or the provided seed data
    // For now, we use current system date to demo the theme logic
    const today = new Date();
    const theme = getDailyTheme(today);
    const isMystery = theme.isMystery;

    if (!seed) return null;

    return (
        <>
            <div className="mb-12">

                {/* Main Daily Card */}
                <div className="bg-balatro-panel border-4 border-balatro-gold shadow-[0_0_30px_rgba(252,194,3,0.3)] rounded-2xl overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none"></div>

                    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div className="flex-1 space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className={`${theme.color} text-white text-lg font-header px-3 py-1 rounded shadow-sm skew-x-[-10deg] inline-block uppercase flex items-center gap-2`}>
                                        <span className="skew-x-[10deg] not-italic">{theme.icon}</span>
                                        <span className="skew-x-[10deg] inline-block">{theme.name}</span>
                                    </span>

                                    <button
                                        onClick={() => setShowHowTo(true)}
                                        className="flex items-center gap-2 text-balatro-blue hover:text-white transition-colors font-header text-sm uppercase tracking-wider group bg-black/20 px-3 py-1 rounded-full"
                                    >
                                        <HelpCircle size={18} className="group-hover:scale-110 transition-transform" />
                                        How To Play
                                    </button>
                                </div>

                                <h2 className="text-6xl md:text-7xl font-header text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wide leading-none">
                                    <span className="text-balatro-blue">#{getHeaderDate()}</span>

                                </h2>
                                <p className="text-2xl text-zinc-300 font-pixel uppercase tracking-widest">
                                    {theme.description}
                                </p>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border-2 border-dashed border-white/20 relative flex flex-wrap gap-8 items-center">

                                {/* Target Section */}
                                <div className="flex-1 min-w-[200px]">
                                    <div className="text-zinc-400 font-header text-sm uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Trophy size={16} className="text-balatro-gold" />
                                        Target Score <span className="text-xs text-zinc-600">(Chips on Wee)</span>
                                    </div>
                                    <div className="text-5xl font-header text-balatro-gold drop-shadow-md">
                                        +{seed.run_score?.toLocaleString()}
                                    </div>
                                </div>

                                {isMystery ? (
                                    <div className="flex-1 min-w-[200px] flex flex-col justify-center items-center py-4 bg-black/20 rounded-lg border-2 border-balatro-gold/20">
                                        <div className="text-6xl animate-pulse">❓</div>
                                        <div className="text-balatro-gold font-header text-xl mt-2 tracking-widest text-center">MYSTERY SEED</div>
                                        <div className="text-zinc-500 font-pixel text-sm text-center">Strategies Hidden</div>
                                    </div>
                                ) : (
                                    /* Strategy Section with Images */
                                    <div className="flex-1 min-w-[200px] flex flex-col justify-center">
                                        <div className="text-zinc-400 font-header text-sm uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                            <span>Build Strategy</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="relative group/joker">
                                                <div className="w-16 h-24 relative transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                                                    <Image src="/hack.png" alt="Hack Joker" fill className="object-contain drop-shadow-lg" />
                                                </div>
                                                {seed.joker_hack_edition && seed.joker_hack_edition !== 'base' && (
                                                    <div className="absolute -top-2 -right-2 bg-balatro-blue text-white text-[10px] font-header px-1.5 py-0.5 rounded border border-white shadow-sm uppercase">
                                                        {seed.joker_hack_edition}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-2xl font-header text-white">+</div>
                                            <div className="relative group/joker">
                                                <div className="w-12 h-16 relative transform rotate-6 hover:rotate-0 transition-transform duration-300 animate-wee">
                                                    <Image src="/jimbo.png" alt="Wee Joker" fill className="object-contain drop-shadow-lg" />
                                                </div>
                                                {seed.joker_wee_edition && seed.joker_wee_edition !== 'base' && (
                                                    <div className="absolute -top-2 -right-2 bg-balatro-red text-white text-[10px] font-header px-1.5 py-0.5 rounded border border-white shadow-sm uppercase">
                                                        {seed.joker_wee_edition}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {seed.strategy_note && (
                                            <div className="mt-3 text-center">
                                                <span className="bg-yellow-900/40 text-balatro-gold border border-balatro-gold/30 px-2 py-1 rounded text-xs font-pixel uppercase tracking-wide">
                                                    Hint: {seed.strategy_note}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-green-600 hover:bg-green-500 text-white font-header text-2xl px-6 py-4 rounded-lg border-b-8 border-green-800 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-3 shadow-xl group">
                                <Upload size={28} className="group-hover:-translate-y-1 transition-transform" />
                                SUBMIT SCORE
                            </button>
                        </div>

                        {/* The Seed Card */}
                        <div className="w-full md:w-auto md:min-w-[340px] relative group cursor-pointer perspective-1000">
                            <div className="absolute -inset-4 bg-balatro-gold/20 rounded-full blur-xl group-hover:bg-balatro-gold/30 transition-colors"></div>
                            <SeedCard seed={seed} className="transform rotate-2 group-hover:rotate-0 transition-transform duration-300 border-4 border-white shadow-2xl relative z-10" />
                        </div>
                    </div>
                </div>

                {/* Yesterday's Winner - Attached Bottom Section */}
                <div className="mx-4 md:mx-8 -mt-2 bg-black/60 backdrop-blur-sm border-x-2 border-b-2 border-white/10 rounded-b-xl p-4 flex justify-between items-center animate-in slide-in-from-top-4 z-0">
                    <div className="flex items-center gap-2 text-zinc-400 font-pixel text-lg">
                        <span>YESTERDAY'S WINNER:</span>
                        <span className="text-balatro-gold font-header text-xl">JokerKing99</span>
                        <span className="text-zinc-500 text-sm">(+3,420 Chips)</span>
                    </div>
                    <div className="text-xs font-header text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-white">
                        View Hall of Fame &rarr;
                    </div>
                </div>

            </div>

            {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}
        </>
    )
}
