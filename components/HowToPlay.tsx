
import { X, ExternalLink, Gamepad2, Copy, Trophy } from "lucide-react";

interface HowToPlayProps {
    onClose: () => void;
    onSubmit?: () => void;
}

export function HowToPlay({ onClose, onSubmit }: HowToPlayProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 animate-in fade-in duration-200" onClick={onClose}>
            <div className="relative w-full max-w-2xl bg-[var(--balatro-grey)] border-[3px] border-[var(--balatro-blue)] shadow-[0_8px_0_#000] rounded-xl overflow-hidden animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-[var(--balatro-blue)] p-4 flex justify-between items-center border-b-[3px] border-black/20">
                    <h2 className="text-2xl md:text-3xl font-header text-white tracking-widest text-shadow-md flex items-center gap-2">
                        <Gamepad2 size={28} />
                        HOW TO PLAY
                    </h2>
                </div>

                <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 bg-[var(--balatro-red)] text-white font-header text-2xl flex items-center justify-center rounded-lg border-b-[4px] border-[var(--balatro-red-dark)] shadow-sm">
                            1
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-header text-white uppercase">Get Balatro</h3>
                            <div className="flex flex-wrap gap-2">
                                <a href="https://www.playbalatro.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 hover:bg-black/60 rounded border border-white/20 text-sm font-pixel text-[var(--balatro-blue)] transition-colors">
                                    <ExternalLink size={14} /> Buy on Any Platform
                                </a>
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a4731] border border-[#2d7a54] rounded text-sm font-pixel text-[#4ade80]">
                                    Free on GamePass / Apple Arcade
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 bg-[var(--balatro-orange)] text-white font-header text-2xl flex items-center justify-center rounded-lg border-b-[4px] border-[var(--balatro-orange-dark)] shadow-sm">
                            2
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-header text-white uppercase">Copy The Daily Seed</h3>
                            <p className="text-zinc-200 font-pixel text-lg leading-tight">
                                Click the <span className="inline-block bg-[var(--balatro-blue)] text-white text-xs px-1.5 py-0.5 rounded font-header mx-1 border-b-2 border-black/20">COPY</span> button on today&apos;s challenge to grab the seed code.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="w-12 h-12 shrink-0 bg-[var(--balatro-blue)] text-white font-header text-2xl flex items-center justify-center rounded-lg border-b-[4px] border-[var(--balatro-blue-dark)] shadow-sm">
                            3
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-header text-white uppercase">Start Run</h3>
                            <div className="bg-black/40 p-4 rounded border-2 border-white/10 font-pixel text-lg text-zinc-200 space-y-3">
                                <p className="flex items-center gap-2">
                                    1. Select <span className="text-[var(--balatro-gold)] bg-black/50 px-2 rounded border border-white/10">Erratic Deck</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    2. Toggle <span className="text-white bg-[var(--balatro-red)] px-1 rounded-sm text-xs">✔</span> <span className="text-[var(--balatro-orange)]">Seeded Run</span> to expand options.
                                </p>
                                <p className="flex items-center gap-2">
                                    3. Click <span className="bg-[var(--balatro-blue)] text-white px-2 py-0.5 rounded text-sm font-header border-b-2 border-black/20">Paste Seed</span> (it auto-fills!).
                                </p>
                                <p className="flex items-center gap-2">
                                    4. Hit <span className="bg-[var(--balatro-blue)] text-white px-3 py-0.5 rounded font-header border-b-4 border-black/20 text-sm">PLAY</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="bg-[#4d3d18] p-4 rounded-xl border-2 border-[var(--balatro-gold)] dashed flex gap-4 items-center">
                        <Trophy size={48} className="text-[var(--balatro-gold)] shrink-0" />
                        <div>
                            <h3 className="text-xl font-header text-[var(--balatro-gold)] uppercase mb-1">THE GOAL</h3>
                            <p className="font-pixel text-xl text-white">
                                Beat <span className="text-[var(--balatro-red)]">Ante 8</span>. At the start of Ante 9, screenshot your <span className="text-[var(--balatro-blue)]">Wee Joker</span> chip count (e.g. &quot;+2101 Chips&quot;). That is your score!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t-[3px] border-black/10 text-center bg-black/20 flex gap-4">
                    <button onClick={onClose} className="flex-1 bg-[var(--balatro-orange)] hover:bg-[#D04035] text-white font-header py-2 rounded-xl border-none shadow-[0_2px_0_#992e10] active:shadow-none active:translate-y-[2px] transition-all text-2xl tracking-wider">
                        Back
                    </button>
                    {onSubmit && (
                        <button onClick={onSubmit} className="flex-[2] bg-[var(--balatro-blue)] hover:brightness-110 text-white font-header py-2 rounded-xl border-none shadow-[0_2px_0_#0055aa] active:shadow-none active:translate-y-[2px] transition-all text-2xl tracking-wider flex items-center justify-center gap-2">
                            <span>SUBMIT SCORE</span>
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
