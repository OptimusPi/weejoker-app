
import { X, ExternalLink, Gamepad2, Copy, Trophy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface HowToPlayProps {
    onClose: () => void;
    onSubmit?: () => void;
}

export function HowToPlay({ onClose, onSubmit }: HowToPlayProps) {
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onClose();
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        else onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 animate-in fade-in duration-150" onClick={onClose}>
            <div className="balatro-panel relative w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-10 duration-150" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-[var(--balatro-blue)] p-4 flex justify-between items-center border-b-[2px] border-black/20">
                    <h2 className="text-xl md:text-2xl font-header text-white tracking-widest text-shadow-md flex items-center gap-2 uppercase">
                        {step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : 'Final Step'}
                    </h2>
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-white' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-5 flex flex-col items-center text-center gap-4">
                    {step === 1 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white uppercase tracking-wider">Get Balatro</h3>
                            <p className="text-zinc-200 font-pixel text-lg leading-tight">
                                You need the game to participate.<br />Available on PC, Console, and Mobile.
                            </p>
                            <div className="flex flex-col gap-2 w-full">
                                <a href="https://www.playbalatro.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 rounded-lg text-sm font-pixel text-[var(--balatro-blue)] transition-colors border border-white/10">
                                    <ExternalLink size={14} /> Buy on Store
                                </a>
                                <span className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#1a4731] rounded-lg text-[10px] font-header text-[#4ade80] border border-white/10">
                                    Free on GamePass / Arcade
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white uppercase tracking-wider">The Ritual</h3>
                            <p className="text-zinc-200 font-pixel text-lg leading-tight">
                                Click the <span className="text-[var(--balatro-blue)] font-header">Play Daily Wee</span> button to grab today's seed.
                            </p>
                            <div className="bg-black/20 p-4 rounded-xl border border-dashed border-white/10 flex flex-col items-center gap-2">
                                <div className="p-2 bg-black/40 rounded-lg">
                                    <Copy size={32} className="text-[var(--balatro-blue)]" />
                                </div>
                                <span className="font-pixel text-xs text-white/40 uppercase">Clicking Play copies seed</span>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white uppercase tracking-wider">The Goal</h3>
                            <div className="bg-[#4d3d18] p-4 rounded-xl border-2 border-[var(--balatro-gold)] border-dashed flex flex-col gap-2 items-center">
                                <Trophy size={40} className="text-[var(--balatro-gold)]" />
                                <p className="font-pixel text-lg text-white leading-tight">
                                    Beat <span className="text-[var(--balatro-red)]">Ante 8</span>.<br />
                                    Count your <span className="text-[var(--balatro-blue)]">Wee Jokers</span> at Ante 9.
                                </p>
                            </div>
                            <p className="text-[var(--balatro-gold)] font-header text-xs tracking-widest uppercase">
                                Snap a screenshot & submit!
                            </p>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={nextStep}
                        className="balatro-button balatro-button-blue w-full text-xl py-2 mt-2"
                    >
                        {step === 1 ? 'Got it' : step === 2 ? 'Next' : "Let's Play!"}
                    </button>

                    {/* Back Button */}
                    <button
                        onClick={prevStep}
                        className="balatro-button-back"
                    >
                        {step === 1 ? 'Back' : 'Previous Step'}
                    </button>
                </div>
            </div>
        </div>
    );
}
