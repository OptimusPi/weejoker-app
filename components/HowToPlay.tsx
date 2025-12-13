
import { X, ExternalLink, Gamepad2, Copy, Trophy } from "lucide-react";

interface HowToPlayProps {
    onClose: () => void;
}

export function HowToPlay({ onClose }: HowToPlayProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-balatro-panel border-4 border-balatro-blue shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95">

                {/* Header */}
                <div className="bg-balatro-blue p-4 flex justify-between items-center border-b-4 border-blue-800">
                    <h2 className="text-2xl md:text-3xl font-header text-white tracking-widest drop-shadow-md flex items-center gap-2">
                        <Gamepad2 size={28} />
                        HOW TO PLAY
                    </h2>
                    <button onClick={onClose} className="hover:bg-blue-600 p-1 rounded transition-colors">
                        <X size={28} strokeWidth={3} className="text-white" />
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">

                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 bg-balatro-red text-white font-header text-2xl flex items-center justify-center rounded-lg border-b-4 border-red-800 shadow-balatro">
                            1
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-header text-white uppercase">Get Balatro</h3>
                            <div className="flex flex-wrap gap-2">
                                <a href="https://www.playbalatro.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-sm font-pixel text-balatro-blue transition-colors">
                                    <ExternalLink size={14} /> Buy on Any Platform
                                </a>
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-900/40 border border-green-500/30 rounded text-sm font-pixel text-green-400">
                                    Free on GamePass / Apple Arcade
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 bg-balatro-orange text-white font-header text-2xl flex items-center justify-center rounded-lg border-b-4 border-orange-700 shadow-balatro">
                            2
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-header text-white uppercase">Copy The Daily Seed</h3>
                            <p className="text-gray-300 font-pixel text-lg leading-tight">
                                Click the <span className="inline-block bg-slate-700 text-white text-xs px-1.5 py-0.5 rounded font-header mx-1 border-b-2 border-slate-900">COPY</span> button on today's challenge to grab the seed code.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 bg-balatro-blue text-white font-header text-2xl flex items-center justify-center rounded-lg border-b-4 border-blue-800 shadow-balatro">
                            3
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-header text-white uppercase">Start Run</h3>
                            <div className="bg-black/40 p-4 rounded border-2 border-slate-600 font-pixel text-lg text-gray-300 space-y-3">
                                <p className="flex items-center gap-2">
                                    1. Select <span className="text-balatro-gold bg-black/50 px-2 rounded border border-white/10">Erratic Deck</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    2. Toggle <span className="text-white bg-balatro-red px-1 rounded-sm text-xs">✔</span> <span className="text-balatro-orange">Seeded Run</span> to expand options.
                                </p>
                                <p className="flex items-center gap-2">
                                    3. Click <span className="bg-balatro-blue text-white px-2 py-0.5 rounded text-sm font-header border-b-2 border-blue-800">Paste Seed</span> (it auto-fills!).
                                </p>
                                <p className="flex items-center gap-2">
                                    4. Hit <span className="bg-balatro-blue text-white px-3 py-0.5 rounded font-header border-b-4 border-blue-800 text-sm">PLAY</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="bg-balatro-gold/10 p-4 rounded-xl border-2 border-balatro-gold dashed flex gap-4 items-center">
                        <Trophy size={48} className="text-balatro-gold shrink-0" />
                        <div>
                            <h3 className="text-xl font-header text-balatro-gold uppercase mb-1">THE GOAL</h3>
                            <p className="font-pixel text-xl text-white">
                                Beat <span className="text-balatro-red">Ante 8</span>. At the start of Ante 9, screenshot your <span className="text-balatro-blue">Wee Joker</span> chip count (e.g. "+2101 Chips"). That is your score!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-black/20 p-4 border-t-2 border-white/10 text-center">
                    <button onClick={onClose} className="bg-balatro-bg-dark hover:bg-slate-600 text-white font-header px-8 py-2 rounded text-xl border-b-4 border-black/50 active:border-b-0 active:translate-y-1 transition-all">
                        GOT IT
                    </button>
                </div>

            </div>
        </div>
    );
}
