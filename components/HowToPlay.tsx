
import { X, ExternalLink, Gamepad2, Copy, Trophy } from "lucide-react";

interface HowToPlayProps {
    onClose: () => void;
    onSubmit?: () => void;
}

export function HowToPlay({ onClose, onSubmit }: HowToPlayProps) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 animate-in fade-in duration-150" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-[var(--balatro-grey)] border-[3px] border-black/20 rounded-xl overflow-hidden animate-in slide-in-from-bottom-10 duration-150" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-[var(--balatro-blue)] p-4 flex justify-between items-center border-b-[3px] border-black/20">
                    <h2 className="text-2xl md:text-3xl font-header text-white tracking-widest text-shadow-md flex items-center gap-2">
                        <Gamepad2 size={28} />
                        HOW TO PLAY
                    </h2>
                </div>

                <div className="p-4 md:p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">

                    {/* Step 1 */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 bg-[var(--balatro-red)] text-white font-header text-lg flex items-center justify-center rounded-md">
                            1
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-header text-white uppercase">Get Balatro</h3>
                            <div className="flex flex-wrap gap-2">
                                <a href="https://www.playbalatro.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1 bg-black/40 hover:bg-black/60 rounded text-sm font-pixel text-[var(--balatro-blue)] transition-colors">
                                    <ExternalLink size={14} /> Buy on Any Platform
                                </a>
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a4731] rounded text-sm font-pixel text-[#4ade80]">
                                    Free on GamePass / Apple Arcade
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 bg-[var(--balatro-orange)] text-white font-header text-lg flex items-center justify-center rounded-md">
                            2
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-header text-white uppercase">Copy The Daily Seed</h3>
                            <p className="text-zinc-200 font-pixel text-lg leading-tight">
                                Click the <span className="inline-block bg-[var(--balatro-blue)] text-white text-xs px-1.5 py-0.5 rounded font-header mx-1 border-b-2 border-black/10">COPY</span> button on today&apos;s challenge to grab the seed code.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 shrink-0 bg-[var(--balatro-blue)] text-white font-header text-lg flex items-center justify-center rounded-md">
                            3
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-header text-white uppercase">Start Run</h3>
                            <div className="bg-black/40 p-3 rounded border border-white/5 font-pixel text-base text-zinc-200 space-y-2">
                                <p className="flex items-center gap-2">
                                    1. Select <span className="text-[var(--balatro-gold)] bg-black/50 px-1.5 rounded border border-white/5">Erratic Deck</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    2. Toggle <span className="text-white bg-[var(--balatro-red)] px-1 rounded-sm text-[10px]">✔</span> <span className="text-[var(--balatro-orange)]">Seeded Run</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    3. Click <span className="bg-[var(--balatro-blue)] text-white px-1.5 py-0.5 rounded text-[10px] font-header">Paste Seed</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    4. Hit <span className="bg-[var(--balatro-blue)] text-white px-2 py-0.5 rounded font-header text-[10px]">PLAY</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Goal */}
                    <div className="bg-[#4d3d18] p-3 rounded-lg border-2 border-[var(--balatro-gold)] border-dashed flex gap-3 items-center">
                        <Trophy size={32} className="text-[var(--balatro-gold)] shrink-0" />
                        <div>
                            <h3 className="text-lg font-header text-[var(--balatro-gold)] uppercase">THE GOAL</h3>
                            <p className="font-pixel text-base text-white leading-tight">
                                Beat <span className="text-[var(--balatro-red)]">Ante 8</span>. At Ante 9, screenshot your <span className="text-[var(--balatro-blue)]">Wee Joker</span> count. That is your score!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons - NO EXTRA BACKGROUND TRAY */}
                <div className="p-4 flex gap-3 text-center">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-[var(--balatro-orange)] hover:brightness-110 active:brightness-90 text-white font-header text-xl py-3 rounded-lg transition-colors uppercase"
                    >
                        Back
                    </button>
                    {onSubmit && (
                        <button
                            onClick={onSubmit}
                            className="flex-[2] bg-[var(--balatro-blue)] hover:brightness-110 active:brightness-90 text-white font-header text-xl py-3 rounded-lg transition-colors tracking-wider flex items-center justify-center gap-2 uppercase"
                        >
                            SUBMIT SCORE
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
