"use client";

// DuckDB WASM and motely-wasm require browser APIs — prevent static prerendering
export const dynamic = 'force-dynamic';

import { useState } from "react";
import dynamic_ from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, AlertCircle, Upload, FileText, Play } from "lucide-react";
import { JimboPanel, JimboInnerPanel, JimboButton, JimboInput, JimboTextArea } from "@/components/JimboPanel";
import JamlEditor from "@/components/JamlEditor";
import { useJamlFilter } from "@/lib/hooks/useJamlFilter";
import { analyzeSeedWasm } from "@/lib/api/motelyWasm";
import { evaluateSeed } from "@/lib/jaml/jamlEvaluator";
import { normalizeAnalysis } from "@/lib/seedAnalyzer";
import { cn } from "@/lib/utils";

// Browser-only components: DuckDB accesses `document` at module init, react-json-view also requires DOM
const DuckDBProvider = dynamic_(
    () => import('@/components/DuckDBProvider').then(m => m.DuckDBProvider),
    { ssr: false, loading: () => <div className="text-sm opacity-50">Loading Ice Lake…</div> }
);
const SeedExplorer = dynamic_(
    () => import('@/components/SeedExplorer').then(m => m.SeedExplorer),
    { ssr: false }
);
const ReactJson = dynamic_(
    () => import('react-json-view'),
    { ssr: false }
);

export default function CreateRitualPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [meta, setMeta] = useState({
        id: "",
        title: "",
        tagline: "",
        author: "",
        defaultObjective: "",
        epoch: new Date().toISOString().split('T')[0]
    });

    const { jamlText, setFromJaml, filter } = useJamlFilter();
    const [seedsInput, setSeedsInput] = useState("");
    const [verificationResults, setVerificationResults] = useState<any[]>([]);
    const [isVerifying, setIsVerifying] = useState(false);

    // WASM search state
    const [wasmResults, setWasmResults] = useState<{seed:string,score:number}[]>([]);
    const [wasmSearching, setWasmSearching] = useState(false);
    const [wasmProcessed, setWasmProcessed] = useState(0);
    const [wasmError, setWasmError] = useState<string | null>(null);
    const wasmSeen = useState<Set<string>>(() => new Set())[0];

    // Add seed from explorer
    const handleAddSeed = async (seed: string) => {
        setSeedsInput(prev => prev ? prev + "\n" + seed : seed);
        // immediately verify the newly added seed
        try {
            const rawAnalysis = await analyzeSeedWasm(seed, filter.deck || 'Erratic', filter.stake || 'White');
            const analysis = normalizeAnalysis(rawAnalysis);
            const evaluation = evaluateSeed(analysis, filter);
            setVerificationResults(prev => [...prev, { seed, passed: evaluation.isMatch, score: evaluation.score, details: evaluation }]);
        } catch (err) {
            console.error(`Error analyzing seed ${seed}:`, err);
            setVerificationResults(prev => [...prev, { seed, passed: false, error: 'Analysis failed' }]);
        }
    };

    // WASM search handlers
    const handleWasmSearch = async () => {
        if (wasmSearching) {
            handleWasmStop();
            return;
        }
        setWasmSearching(true);
        setWasmError(null);
        setWasmResults([]);
        setWasmProcessed(0);
        wasmSeen.clear();

        const { searchSeedsWasm, addSearchListener, cancelSearch } = await import('@/lib/api/motelyWasm');
        const cleanup = addSearchListener((event: any) => {
            if (event.type === 'result') {
                const { seed, score } = event.data;
                if (!wasmSeen.has(seed)) {
                    wasmSeen.add(seed);
                    setWasmResults(prev => [{ seed, score }, ...prev].slice(0, 100));
                }
            } else if (event.type === 'progress') {
                setWasmProcessed(event.data?.SearchedCount || 0);
            } else if (event.type === 'complete') {
                setWasmSearching(false);
                cleanup();
            } else if (event.type === 'error') {
                setWasmError(event.message || 'unknown');
                setWasmSearching(false);
                cleanup();
            }
        });

        try {
            await searchSeedsWasm(jamlText);
        } catch (err: any) {
            setWasmError(err.message);
            setWasmSearching(false);
            cleanup();
        }
    };

    const handleWasmStop = () => {
        setWasmSearching(false);
        import('@/lib/api/motelyWasm').then(m => m.cancelSearch());
    };

    const handleNext = () => setStep(s => Math.min(4, s + 1));
    const handleBack = () => {
        if (step === 1) router.push('/');
        else setStep(s => Math.max(1, s - 1));
    };

    const handleVerifySeeds = async () => {
        setIsVerifying(true);
        setVerificationResults([]);
        const seeds = seedsInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
        const results = [];

        for (const seed of seeds) {
            try {
                const rawAnalysis = await analyzeSeedWasm(seed, filter.deck || 'Erratic', filter.stake || 'White');
                const analysis = normalizeAnalysis(rawAnalysis);
                const evaluation = evaluateSeed(analysis, filter);
                results.push({ seed, passed: evaluation.isMatch, score: evaluation.score, details: evaluation });
            } catch (err) {
                console.error(`Error verifying seed ${seed}:`, err);
                results.push({ seed, passed: false, error: "Analysis failed" });
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
            const res = await fetch('/api/rituals/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...meta, jaml: jamlText, seeds: validSeeds })
            });
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json() as { id: string };
            router.push(`/${data.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to create ritual: " + err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--balatro-black)] text-white font-pixel p-4 md:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-xl mx-auto mb-6 text-center">
                <h1 className="text-4xl md:text-5xl font-header text-[var(--balatro-blue)] drop-shadow-md mb-2">
                    Ritual Forge
                </h1>
                <p className="text-white/60 text-lg">Design your own daily challenge</p>
                <div className="flex justify-center gap-3 mt-4">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className={cn(
                                "w-3 h-3 rounded-full transition-all duration-300",
                                step >= i
                                    ? "bg-[var(--jimbo-gold)] scale-110 shadow-[0_0_10px_rgba(255,152,0,0.4)]"
                                    : "bg-white/10"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Main JimboPanel — Back button is structural */}
            <JimboPanel
                onBack={handleBack}
                backLabel={step === 1 ? "Back to Home" : "Back"}
                className="w-full max-w-xl mb-20"
            >
                {/* Step 1: Metadata */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-header text-[var(--balatro-blue)] mb-1">Ritual Basics</h2>
                            <div className="h-1 w-16 bg-[var(--balatro-blue)] mx-auto rounded-full opacity-50" />
                        </div>

                        <JimboInnerPanel className="space-y-4">
                            <div>
                                <label className="block text-xs text-[var(--balatro-blue)] mb-1 font-header tracking-wider">Ritual ID</label>
                                <JimboInput
                                    placeholder="my-cool-challenge"
                                    value={meta.id}
                                    onChange={e => setMeta({ ...meta, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--balatro-blue)] mb-1 font-header tracking-wider">Title</label>
                                <JimboInput
                                    placeholder="My Cool Challenge"
                                    value={meta.title}
                                    onChange={e => setMeta({ ...meta, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1 font-header tracking-wider">Tagline</label>
                                <JimboInput
                                    placeholder="Can you beat the heat?"
                                    value={meta.tagline}
                                    onChange={e => setMeta({ ...meta, tagline: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-white/40 mb-1 font-header tracking-wider">Author</label>
                                <JimboInput
                                    placeholder="Jimbo"
                                    value={meta.author}
                                    onChange={e => setMeta({ ...meta, author: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-white/40 mb-1 font-header tracking-wider">Objective</label>
                                    <JimboInput
                                        placeholder="Wee Joker"
                                        value={meta.defaultObjective}
                                        onChange={e => setMeta({ ...meta, defaultObjective: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-white/40 mb-1 font-header tracking-wider">Start Date</label>
                                    <JimboInput
                                        type="date"
                                        title="Start date for ritual"
                                        value={meta.epoch}
                                        onChange={e => setMeta({ ...meta, epoch: e.target.value })}
                                        className="[color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </JimboInnerPanel>

                        <JimboButton variant="red" onClick={handleNext} disabled={!meta.id} className="text-xl py-4">
                            Next Step <ArrowRight size={24} />
                        </JimboButton>
                    </div>
                )}

                {/* Step 2: JAML */}
                {step === 2 && (
                    <div className="flex flex-col pb-2">
                        <h2 className="text-2xl font-header flex items-center gap-2 mb-4 text-[var(--balatro-red)]">
                            <FileText size={20} />
                            Define Rules (Jaml)
                        </h2>
                        <JimboInnerPanel className="min-h-[400px]">
                            <JamlEditor initialJaml={jamlText} onJamlChange={(text) => setFromJaml(text)} />
                        </JimboInnerPanel>

                        {/* JSON preview of parsed filter */}
                        <div className="mt-4 text-sm">
                            <h3 className="font-header text-white/60 mb-1">Parsed Filter</h3>
                            <div className="bg-[var(--jimbo-panel-edge)] p-2 rounded max-h-64 overflow-auto">
                                <ReactJson
                                    src={filter}
                                    displayDataTypes={false}
                                    collapsed={1}
                                    name={null}
                                />
                            </div>
                        </div>

                        <JimboButton variant="red" onClick={handleNext} className="text-xl py-4 mt-4">
                            Next Step <ArrowRight size={24} />
                        </JimboButton>
                    </div>
                )}

                {/* Step 3: Seeds & Verify */}
                {step === 3 && (
                    <div className="space-y-4 pb-2">
                        <h2 className="text-2xl font-header flex items-center gap-2 text-[var(--jimbo-gold)]">
                            <Upload size={20} />
                            Upload / Scan Seeds
                        </h2>

                        {/* seed explorer - allowed inside DuckDBProvider */}
                        <DuckDBProvider>
                            <SeedExplorer onSelect={handleAddSeed} filter={filter} />
                        </DuckDBProvider>

                        {/* WASM full‑corpus search */}
                        <div className="jimbo-inner-panel mt-4 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-header text-white">WASM Search</span>
                                <button
                                    onClick={handleWasmSearch}
                                    className={cn(
                                        "balatro-button px-3 py-1 text-sm h-8",
                                        wasmSearching ? "balatro-button-red" : "balatro-button-blue"
                                    )}
                                >
                                    {wasmSearching ? 'Abort' : 'Search corpus'}
                                </button>
                            </div>
                            <div className="text-[11px] text-white/50 mb-2">
                                {wasmProcessed.toLocaleString()} seeds scanned
                                {wasmError && <span className="text-red-400 ml-2">{wasmError}</span>}
                            </div>
                            <div className="max-h-40 overflow-y-auto bg-black/20 p-1 font-mono text-xs">
                                {wasmResults.length === 0 && !wasmSearching && (
                                    <div className="text-center text-white/30 py-6">No matches yet</div>
                                )}
                                {wasmResults.map((r, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between items-center py-0.5 px-1 cursor-pointer hover:bg-white/5"
                                        onClick={() => handleAddSeed(r.seed)}
                                    >
                                        <span className="truncate w-2/3 text-[var(--jimbo-blue)]">{r.seed}</span>
                                        <span className="text-white/60 text-right w-1/3">{r.score?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="block text-sm text-white/60">Paste Seeds (Comma or Newline separated)</label>
                                <JimboTextArea
                                    className="h-48 font-mono text-sm"
                                    placeholder="SEED1234, SEED5678..."
                                    value={seedsInput}
                                    onChange={e => setSeedsInput(e.target.value)}
                                />
                                <JimboButton
                                    variant="green"
                                    onClick={handleVerifySeeds}
                                    disabled={isVerifying || !seedsInput.trim()}
                                    className="py-3 text-lg"
                                >
                                    {isVerifying ? <span className="animate-spin">⌛</span> : <Play size={18} fill="currentColor" />}
                                    Verify Seeds
                                </JimboButton>
                            </div>

                            <JimboInnerPanel className="h-64 overflow-y-auto">
                                <h3 className="text-sm font-header text-white/40 mb-2">Verification Results</h3>
                                {verificationResults.length === 0 ? (
                                    <div className="text-center text-white/20 py-8">No seeds verified yet.</div>
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
                            </JimboInnerPanel>
                        </div>

                        <JimboButton
                            variant="red"
                            onClick={handleNext}
                            disabled={verificationResults.filter(r => r.passed).length === 0}
                            className="text-xl py-4"
                        >
                            Next Step <ArrowRight size={24} />
                        </JimboButton>
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div className="space-y-6 flex flex-col items-center justify-center text-center py-8">
                        <div className="w-24 h-24 rounded-full bg-[var(--jimbo-blue)] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,147,255,0.4)]">
                            <Check size={48} className="text-white" strokeWidth={4} />
                        </div>

                        <h2 className="text-3xl font-header">Ready to Forge?</h2>

                        <JimboInnerPanel className="max-w-md text-left space-y-2 w-full">
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
                                <span className="text-[var(--jimbo-green)]">{verificationResults.filter(r => r.passed).length} valid</span>
                            </div>
                        </JimboInnerPanel>

                        <JimboButton variant="red" onClick={handleSubmit} disabled={isSubmitting} className="px-12 py-4 text-xl mt-4">
                            {isSubmitting ? "Forging..." : "Create Ritual"}
                        </JimboButton>
                    </div>
                )}
            </JimboPanel>
        </div>
    );
}
