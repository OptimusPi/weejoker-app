"use client";

import { X, ExternalLink, Gamepad2, Copy, Trophy, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface HowToPlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    seedId?: string;
    objectiveName?: string;
}

export function HowToPlay({ isOpen, onClose, onSubmit, seedId = "--------", objectiveName = "Objective" }: HowToPlayProps) {
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    const totalSteps = 4;

    if (!isOpen) return null;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onClose();
    };

    const prevStep = () => {
        onClose(); // Lower button ALWAYS "Back" and always closes
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 animate-in fade-in duration-150" onClick={onClose}>
            <div className="balatro-panel relative w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-10 duration-150" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-[var(--balatro-blue)] px-3 py-2 flex justify-between items-center border-b-[2px] border-black/20">
                    <h2 className="text-lg font-header text-white tracking-widest flex items-center gap-2">
                        Step {step} of {totalSteps}
                    </h2>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-white' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="px-3 py-3 flex flex-col items-center text-center gap-2">
                    {step === 1 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200 w-full">
                            <h3 className="text-xl font-header text-white tracking-wider">Get Balatro</h3>
                            <p className="text-zinc-200 font-pixel text-sm leading-snug">
                                You need the game to participate.<br />Available on PC, Console, and Mobile.
                            </p>
                            <div className="flex flex-col gap-1.5 w-full">
                                <a href="https://www.playbalatro.com/" target="_blank" rel="noopener noreferrer" className="balatro-button balatro-button-red py-1.5 text-sm">
                                    <ExternalLink size={14} className="mr-2" /> Buy on Store
                                </a>
                                <span className="balatro-button bg-[var(--color-dark-green)] py-1.5 text-[10px] shadow-none cursor-default">
                                    Free on GamePass / Arcade
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200 w-full">
                            <h3 className="text-xl font-header text-white tracking-wider">The Ritual</h3>
                            <p className="text-zinc-200 font-pixel text-sm leading-snug">
                                Copy the Daily Seed and enter it in the Balatro <span className="text-[var(--balatro-blue)] font-header">New Run</span> menu.
                            </p>
                            <button
                                onClick={async () => {
                                    await navigator.clipboard.writeText(seedId);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 3140);
                                }}
                                className={`w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-between px-4 transition-all duration-200 group ${copied ? 'bg-[var(--balatro-green)] border-[var(--balatro-green)]' : 'bg-black/20 border-[var(--balatro-blue)] hover:bg-black/40'}`}
                            >
                                <span className="font-header text-white tracking-widest text-lg">
                                    {copied ? "COPIED!" : seedId}
                                </span>
                                <div
                                    className={`p-1.5 rounded shadow-sm transition-transform ${copied ? 'bg-white/20' : 'bg-[var(--balatro-blue)] group-active:translate-y-0.5'}`}
                                >
                                    {copied ? <CheckCircle2 size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200 w-full">
                            <h3 className="text-xl font-header text-white tracking-wider">The Setup</h3>
                            <div className="bg-black/20 p-3 rounded-xl border border-white/10 flex flex-col gap-2 text-left">
                                <p className="font-pixel text-sm text-white leading-snug flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[var(--balatro-blue)] flex items-center justify-center text-[9px] font-header shrink-0">1</span>
                                    <span>Start a <span className="text-[var(--balatro-blue)] font-header">New Run</span></span>
                                </p>
                                <p className="font-pixel text-sm text-white leading-snug flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[var(--balatro-blue)] flex items-center justify-center text-[9px] font-header shrink-0">2</span>
                                    <span>Select <span className="text-[var(--balatro-red)] font-header">Erratic Deck</span></span>
                                </p>
                                <p className="font-pixel text-sm text-white leading-snug flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[var(--balatro-blue)] flex items-center justify-center text-[9px] font-header shrink-0">3</span>
                                    <span>Select <span className="font-header">White Stake</span></span>
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200 w-full">
                            <h3 className="text-xl font-header text-white tracking-wider">The Goal</h3>
                            <div className="bg-black/40 p-3 rounded-xl border-2 border-[var(--balatro-gold)] border-dashed flex flex-col gap-1.5 text-left">
                                <p className="font-pixel text-sm text-white leading-snug">
                                    • Find <span className="text-[var(--balatro-blue)] font-header">{objectiveName}</span> and upgrade by playing Rank 2 cards!
                                </p>
                                <p className="font-pixel text-sm text-white leading-snug">
                                    • Win the <span className="text-[var(--balatro-red)] font-header">Ante 8</span> Boss Blind.
                                </p>
                                <p className="font-pixel text-sm text-white leading-snug">
                                    • In Ante 9 shop, select your <span className="text-[var(--balatro-blue)] font-header">{objectiveName}</span>.
                                </p>
                                <p className="font-pixel text-[var(--balatro-gold)] font-header text-xs tracking-widest text-center mt-1">
                                    <span className="text-[var(--balatro-blue)] font-header">+Chips</span> is your score to submit!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full mt-1">
                        <button
                            onClick={prevStep}
                            className="balatro-button balatro-button-orange flex-1 py-2 text-sm"
                        >
                            Back
                        </button>
                        <button
                            onClick={nextStep}
                            className="balatro-button balatro-button-blue flex-[2] py-2 text-sm"
                        >
                            {step === 1 ? 'Got it' : step === 2 ? 'Next' : step === 3 ? 'Next' : "Let's Play!"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
