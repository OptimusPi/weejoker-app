"use client";

import { ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { JimboPanel, JimboInnerPanel, JimboButton, JimboBackButton } from "@/components/JimboPanel";

interface HowToPlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    seedId?: string;
    objectiveName?: string;
    deckName?: string;
    stakeName?: string;
}

export function HowToPlay({ isOpen, onClose, onSubmit, seedId = "--------", objectiveName = "Objective", deckName = "Erratic", stakeName = "White" }: HowToPlayProps) {
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    const totalSteps = 4;

    if (!isOpen) return null;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onClose();
    };

    const prevStep = () => {
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[var(--jimbo-panel-edge)]" onClick={onClose}>
            <JimboPanel onBack={prevStep} className="relative w-full max-w-sm" onClick={(e: React.MouseEvent) => e.stopPropagation()}>

                {/* Header */}
                <div className="bg-[var(--jimbo-blue)] -mx-4 -mt-4 p-4 flex justify-between items-center rounded-t-lg mb-4 border-b-2 border-black/20">
                    <h2 className="text-xl md:text-2xl font-header text-white tracking-widest flex items-center gap-2">
                        {step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : step === 3 ? 'Step 3' : 'Final Step'}
                    </h2>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${step === i ? 'bg-white' : 'bg-[var(--jimbo-dark-blue)]'}`} />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center text-center gap-3">
                    {step === 1 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200 w-full">
                            <h3 className="text-2xl font-header text-white tracking-wider">Get Balatro</h3>
                            <p className="text-[var(--jimbo-border-silver)] font-pixel text-lg leading-none">
                                You need the game to participate.<br />Available on PC, Console, and Mobile.
                            </p>
                            <div className="flex flex-col gap-2 w-full px-2">
                                <a href="https://www.playbalatro.com/" target="_blank" rel="noopener noreferrer" className="jimbo-btn jimbo-btn-red py-1.5 text-sm">
                                    <ExternalLink size={14} className="mr-2" /> Buy on Store
                                </a>
                                <span className="jimbo-btn jimbo-btn-green py-1 text-[10px] shadow-none cursor-default">
                                    Free on GamePass / Arcade
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 w-full animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white tracking-wider">The Ritual</h3>
                            <p className="text-[var(--jimbo-border-silver)] font-pixel text-lg leading-tight">
                                Copy the ritual seed and enter it in the Balatro <span className="text-[var(--jimbo-blue)] font-header uppercase">New Run</span> menu.
                            </p>
                            <button
                                onClick={async () => {
                                    await navigator.clipboard.writeText(seedId);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 3140);
                                }}
                                className={`w-full p-3 rounded-lg border-2 border-dashed flex items-center justify-between px-4 group ${copied ? 'bg-[var(--jimbo-green)] border-[var(--jimbo-green)]' : 'bg-[var(--jimbo-panel-edge)] border-[var(--jimbo-blue)] hover:bg-[var(--jimbo-dark-grey)]'}`}
                            >
                                <span className="font-header text-white tracking-widest text-lg">
                                    {copied ? "COPIED!" : seedId}
                                </span>
                                <div className={`p-1.5 rounded shadow-sm ${copied ? 'bg-[var(--jimbo-dark-green)]' : 'bg-[var(--jimbo-blue)] group-active:translate-y-0.5'}`}>
                                    {copied ? <CheckCircle2 size={16} className="text-white" /> : <Copy size={16} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4 w-full animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white tracking-wider">The Setup</h3>
                            <JimboInnerPanel className="flex flex-col gap-3 text-left">
                                <p className="font-pixel text-lg text-white leading-tight flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--jimbo-blue)] flex items-center justify-center text-[10px] font-header shrink-0">1</span>
                                    <span>Start a <span className="text-[var(--jimbo-blue)] font-header uppercase">New Run</span></span>
                                </p>
                                <p className="font-pixel text-lg text-white leading-tight flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--jimbo-blue)] flex items-center justify-center text-[10px] font-header shrink-0">2</span>
                                    <span>Select <span className="text-[var(--jimbo-red)] font-header uppercase">{deckName} Deck</span></span>
                                </p>
                                <p className="font-pixel text-lg text-white leading-tight flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--jimbo-blue)] flex items-center justify-center text-[10px] font-header shrink-0">3</span>
                                    <span>Select <span className="font-header">{stakeName} Stake</span></span>
                                </p>
                            </JimboInnerPanel>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-200">
                            <h3 className="text-2xl font-header text-white tracking-wider">The Goal</h3>
                            <JimboInnerPanel className="flex flex-col gap-2 text-left border-2 border-dashed border-[var(--jimbo-gold)]">
                                <p className="font-pixel text-md text-white leading-tight">
                                    • Find <span className="text-[var(--jimbo-blue)] font-header uppercase">{objectiveName}</span> and build around the ritual objective.
                                </p>
                                <p className="font-pixel text-md text-white leading-tight">
                                    • Win the <span className="text-[var(--jimbo-red)] font-header uppercase">Ante 8</span> Boss Blind.
                                </p>
                                <p className="font-pixel text-md text-white leading-tight">
                                    • In Ante 9 shop, select your <span className="text-[var(--jimbo-blue)] font-header uppercase">{objectiveName}</span>.
                                </p>
                                <p className="font-pixel text-[var(--jimbo-gold)] font-header text-sm tracking-widest text-center mt-1">
                                    <span className="text-[var(--jimbo-blue)] font-header uppercase">+Chips</span> is your score to submit!
                                </p>
                            </JimboInnerPanel>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 w-full mt-1">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                            className="jimbo-btn jimbo-btn-orange flex-1 py-2 text-sm uppercase"
                        >
                            {step > 1 ? 'Back' : 'Close'}
                        </button>
                        <button
                            onClick={nextStep}
                            className="jimbo-btn jimbo-btn-blue flex-[2] py-2 text-sm uppercase"
                        >
                            {step === 1 ? 'Got it' : step === 2 ? 'Next' : step === 3 ? 'Next' : "Let's Play!"}
                        </button>
                    </div>
                </div>
            </JimboPanel>
        </div>
    );
}
