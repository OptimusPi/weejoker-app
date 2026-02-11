"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, AlertCircle, Upload, FileText, Settings, Play } from "lucide-react";
import JamlEditor from "@/components/JamlEditor";
import { useJamlFilter } from "@/lib/hooks/useJamlFilter";
import { analyzeSeedWasm } from "@/lib/api/motelyWasm";
import { evaluateSeed } from "@/lib/jamlEvaluator";
import { cn } from "@/lib/utils";

export default function CreateRitualPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form Data
    const [meta, setMeta] = useState({
        id: "",
        title: "",
        tagline: "",
        author: "",
        defaultObjective: "",
        epoch: new Date().toISOString().split('T')[0] // Default to today
    });

    // JAML State
    const { jamlText, setFromJaml, filter } = useJamlFilter();

    // Seeds State
    const [seedsInput, setSeedsInput] = useState("");
    const [verificationResults, setVerificationResults] = useState<any[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);

    // Helpers
    const handleNext = () => setStep(s => Math.min(4, s + 1));
    const handleBack = () => setStep(s => Math.max(1, s - 1));

    const handleVerifySeeds = async () => {
        setIsVerifying(true);
        setVerificationResults([]);
        
        const seeds = seedsInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
        const results = [];

        for (const seed of seeds) {
            try {
                // 1. Analyze
                const analysis = await analyzeSeedWasm(seed, filter.deck || 'Erratic', filter.stake || 'White');
                
                // 2. Evaluate
                const evaluation = evaluateSeed(analysis, filter);
                
                results.push({
                    seed,
                    passed: evaluation.isMatch,
                    score: evaluation.score,
                    details: evaluation
                });
            } catch (err) {
                console.error(`Error verifying seed ${seed}:`, err);
                results.push({
                    seed,
                    passed: false,
                    error: "Analysis failed"
                });
            }
        }

        setVerificationResults(results);
        setIsVerifying(false);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const validSeeds = verificationResults.filter(r => r.passed).map(r => r.seed);
            
            if (validSeeds.length === 0) {
                alert("You need at least one valid seed to create a ritual!");
                setIsSubmitting(false);
                return;
            }

            const payload = {
                ...meta,
                jaml: jamlText,
                seeds: validSeeds
            };

            const res = await fetch('/api/rituals/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            router.push(`/${data.id}`);
            
        } catch (err) {
            console.error(err);
            alert("Failed to create ritual: " + err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--balatro-black)] text-white font-pixel p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                    <div>
                        <h1 className="text-4xl font-header text-[var(--balatro-blue)] drop-shadow-sm">
                            Ritual Forge
                        </h1>
                        <p className="text-white/60">Design your own daily challenge</p>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map(i => (
                            <div 
                                key={i}
                                className={cn(
                                    "w-3 h-3 rounded-full transition-colors",
                                    step >= i ? "bg-[var(--balatro-gold)]" : "bg-white/10"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-[var(--balatro-modal-bg)] border-2 border-white/20 rounded-xl p-6 min-h-[500px] flex flex-col">
                    
                    {/* Step 1: Metadata */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-header flex items-center gap-2">
                                <Settings className="text-[var(--balatro-purple)]" />
                                Ritual Basics
                            </h2>
                            
                            <div className="grid gap-4 max-w-lg">
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Ritual ID (URL Slug)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black/40 border-2 border-white/10 rounded p-2 focus:border-[var(--balatro-blue)] outline-none transition-colors"
                                        placeholder="e.g. my-cool-challenge"
                                        value={meta.id}
                                        onChange={e => setMeta({...meta, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Title</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black/40 border-2 border-white/10 rounded p-2 focus:border-[var(--balatro-blue)] outline-none transition-colors"
                                        placeholder="My Cool Challenge"
                                        value={meta.title}
                                        onChange={e => setMeta({...meta, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Tagline</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black/40 border-2 border-white/10 rounded p-2 focus:border-[var(--balatro-blue)] outline-none transition-colors"
                                        placeholder="Can you beat the heat?"
                                        value={meta.tagline}
                                        onChange={e => setMeta({...meta, tagline: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Author Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black/40 border-2 border-white/10 rounded p-2 focus:border-[var(--balatro-blue)] outline-none transition-colors"
                                        placeholder="Jimbo"
                                        value={meta.author}
                                        onChange={e => setMeta({...meta, author: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Objective Name (Display)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-black/40 border-2 border-white/10 rounded p-2 focus:border-[var(--balatro-blue)] outline-none transition-colors"
                                        placeholder="Wee Joker"
                                        value={meta.defaultObjective}
                                        onChange={e => setMeta({...meta, defaultObjective: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-1">Start Date (Epoch)</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-black/40 border-2 border-white/10 rounded p-2 focus:border-[var(--balatro-blue)] outline-none transition-colors"
                                        value={meta.epoch}
                                        onChange={e => setMeta({...meta, epoch: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: JAML */}
                    {step === 2 && (
                        <div className="flex-1 flex flex-col animate-in fade-in h-full">
                            <h2 className="text-2xl font-header flex items-center gap-2 mb-4">
                                <FileText className="text-[var(--balatro-red)]" />
                                Define Rules (JAML)
                            </h2>
                            <div className="flex-1 border-2 border-white/10 rounded-lg overflow-hidden bg-black/40 min-h-[400px]">
                                <JamlEditor 
                                    value={jamlText} 
                                    onChange={setFromJaml} 
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Seeds & Verify */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in">
                            <h2 className="text-2xl font-header flex items-center gap-2">
                                <Upload className="text-[var(--balatro-gold)]" />
                                Upload & Verify Seeds
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="block text-sm text-white/60">Paste Seeds (Comma or Newline separated)</label>
                                    <textarea 
                                        className="w-full h-64 bg-black/40 border-2 border-white/10 rounded p-4 font-mono text-sm focus:border-[var(--balatro-gold)] outline-none transition-colors resize-none"
                                        placeholder="SEED1234, SEED5678..."
                                        value={seedsInput}
                                        onChange={e => setSeedsInput(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleVerifySeeds}
                                        disabled={isVerifying || !seedsInput.trim()}
                                        className="balatro-button balatro-button-green w-full flex items-center justify-center gap-2"
                                    >
                                        {isVerifying ? (
                                            <span className="animate-spin">⌛</span> 
                                        ) : (
                                            <Play size={18} />
                                        )}
                                        Verify Seeds
                                    </button>
                                </div>

                                <div className="bg-black/20 border-2 border-white/5 rounded p-4 h-64 overflow-y-auto custom-scrollbar">
                                    <h3 className="text-sm uppercase font-header text-white/40 mb-2 sticky top-0 bg-[#2f2f2f] py-1 z-10">
                                        Verification Results
                                    </h3>
                                    {verificationResults.length === 0 ? (
                                        <div className="text-center text-white/20 py-8">
                                            No seeds verified yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {verificationResults.map((res, i) => (
                                                <div key={i} className={cn(
                                                    "flex items-center justify-between p-2 rounded border text-sm",
                                                    res.passed 
                                                        ? "bg-green-500/10 border-green-500/20 text-green-200"
                                                        : "bg-red-500/10 border-red-500/20 text-red-200"
                                                )}>
                                                    <span className="font-mono">{res.seed}</span>
                                                    <div className="flex items-center gap-2">
                                                        {res.passed ? (
                                                            <>
                                                                <span className="text-xs opacity-60">Score: {res.score}</span>
                                                                <Check size={14} />
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-xs opacity-60">{res.error || "Mismatch"}</span>
                                                                <AlertCircle size={14} />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in flex flex-col items-center justify-center text-center py-12">
                            <div className="w-24 h-24 bg-[var(--balatro-blue)] rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                <Check size={48} className="text-white" strokeWidth={4} />
                            </div>
                            
                            <h2 className="text-3xl font-header">Ready to Forge?</h2>
                            
                            <div className="max-w-md bg-black/20 border border-white/10 rounded-lg p-6 text-left space-y-2 w-full">
                                <div className="flex justify-between">
                                    <span className="text-white/40">ID:</span>
                                    <span className="font-mono">{meta.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Title:</span>
                                    <span>{meta.title}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Seeds:</span>
                                    <span className="text-[var(--balatro-green)]">{verificationResults.filter(r => r.passed).length} valid</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="balatro-button balatro-button-gold px-12 py-4 text-xl flex items-center gap-3 mt-8"
                            >
                                {isSubmitting ? "Forging..." : "Create Ritual"}
                            </button>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="mt-auto pt-8 flex justify-between border-t border-white/10">
                        <button 
                            onClick={handleBack}
                            disabled={step === 1}
                            className="flex items-center gap-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>

                        {step < 4 && (
                            <button 
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && !meta.id) || 
                                    (step === 3 && verificationResults.filter(r => r.passed).length === 0)
                                }
                                className="balatro-button balatro-button-blue px-6 py-2 flex items-center gap-2"
                            >
                                Next
                                <ArrowRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
