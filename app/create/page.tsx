"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, AlertCircle, Upload, FileText, Play } from "lucide-react";
import { JimboPanel, JimboInnerPanel, JimboButton, JimboInput, JimboTextArea } from "@/components/JimboPanel";
import JamlEditor from "@/components/JamlEditor";
import { useJamlFilter } from "@/lib/hooks/useJamlFilter";
import { evaluateSeed } from "@/lib/jaml/jamlEvaluator";
import { analyzeSeedWasm } from "@/lib/motelyWasm";
import { normalizeAnalysis } from "@/lib/seedAnalyzer";
import { cn } from "@/lib/utils";
import { RitualChallengeBoard } from "@/components/RitualChallengeBoard";

const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

function normalizeRitualId(value: string) {
    return value
        .replace(/\s+/g, '_')
        .replace(/[^A-Za-z0-9_]/g, '')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64);
}

function normalizeSeed(value: string) {
    const normalized = value
        .trim()
        .replace(/^['"\s]+|['"\s]+$/g, '')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase();

    if (!normalized || normalized.length > 8) {
        return null;
    }

    return normalized;
}

function parseSeedFileText(text: string) {
    const lines = text.split(/\r?\n/);
    const seeds = lines
        .map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return null;

            let candidate = trimmed;
            if (trimmed.includes(',')) {
                if (trimmed.startsWith('"')) {
                    const quoted = trimmed.match(/^"([^"]*)"/);
                    candidate = quoted?.[1] || trimmed;
                } else {
                    candidate = trimmed.split(',')[0] || trimmed;
                }
            }

            const normalized = normalizeSeed(candidate);
            if (!normalized) return null;
            if (index === 0 && normalized.toLowerCase() === 'seed') return null;
            return normalized;
        })
        .filter((seed): seed is string => !!seed);

    return Array.from(new Set(seeds));
}

export default function CreateRitualPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);
    const [existingPlayUrl, setExistingPlayUrl] = useState<string | null>(null);
    const [suggestedId, setSuggestedId] = useState<string | null>(null);

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

    const previewSeed = useMemo(() => verificationResults.find(r => r.passed)?.seed || '', [verificationResults]);
    const previewObjectives = useMemo(() => {
        const fallbackObjective = meta.defaultObjective || 'Wee Joker';
        if (!jamlText) return [fallbackObjective];
        const mustBlock = jamlText.split('must:')[1]?.split('should:')[0]?.split('mustNot:')[0];
        if (mustBlock) {
            const values: string[] = [];
            const valueMatches = mustBlock.matchAll(/value:\s*([^ \n#]+)/g);
            for (const match of valueMatches) {
                values.push(match[1].trim());
            }
            return values.length > 0 ? values : [fallbackObjective];
        }
        return [fallbackObjective];
    }, [jamlText, meta.defaultObjective]);

    const handleNext = () => setStep(s => Math.min(4, s + 1));
    const handleBack = () => {
        if (step === 1) router.push('/');
        else setStep(s => Math.max(1, s - 1));
    };

    const handleVerifySeeds = async () => {
        setIsVerifying(true);
        setVerificationResults([]);
        const seeds = Array.from(new Set(seedsInput.split(/[\n,]+/).map(normalizeSeed).filter((seed): seed is string => !!seed)));
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

    const handleSeedFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);

        if (file.size > MAX_UPLOAD_BYTES) {
            setUploadError('Upload too large. Max size is 24 MB.');
            event.target.value = '';
            return;
        }

        try {
            const text = await file.text();
            const parsedSeeds = parseSeedFileText(text);

            if (parsedSeeds.length === 0) {
                setUploadError('No valid seeds found in that file.');
                return;
            }

            setSeedsInput(parsedSeeds.join('\n'));
            setVerificationResults([]);
        } catch (error) {
            console.error(error);
            setUploadError('Could not read that upload. Try CSV or TXT.');
        } finally {
            event.target.value = '';
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setCreateError(null);
        setExistingPlayUrl(null);
        setSuggestedId(null);
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

            if (!res.ok) {
                const data = await res.json().catch(() => null) as { error?: string; playUrl?: string; suggestedId?: string } | null;
                setCreateError(data?.error || 'Failed to create ritual');
                setExistingPlayUrl(data?.playUrl || null);
                setSuggestedId(data?.suggestedId || null);
                return;
            }

            const data = await res.json() as { id: string };
            router.push(`/${data.id}`);
        } catch (err) {
            console.error(err);
            setCreateError(`Failed to create ritual: ${err}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-4 md:p-8 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-xl mx-auto mb-6 text-center">
                <h1 className="text-4xl md:text-5xl font-header text-[var(--jimbo-gold)] mb-2">
                    Joker Creator
                </h1>
                <p className="text-[var(--jimbo-grey)] text-lg font-header">Design your own daily challenge</p>
                <div className="flex justify-center gap-3 mt-4">
                    {[1, 2, 3, 4].map(i => (
                        <div
                            key={i}
                            className={cn(
                                "w-3 h-3 rounded-full transition-all duration-300",
                                step >= i
                                    ? "bg-[var(--jimbo-gold)] scale-110 shadow-[0_0_10px_rgba(255,152,0,0.4)]"
                                    : "bg-[var(--jimbo-panel-edge)]"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* Main Panel */}
            <JimboPanel
                onBack={handleBack}
                backLabel={step === 1 ? "Back to Home" : "Back"}
                className="w-full max-w-xl mb-20"
            >
                {/* Step 1: Metadata */}
                {step === 1 && (
                    <div className="space-y-5">
                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-header text-[var(--jimbo-blue)] mb-1">Basics</h2>
                            <div className="h-1 w-16 bg-[var(--jimbo-blue)] mx-auto rounded-full opacity-50" />
                        </div>

                        <JimboInnerPanel className="space-y-4">
                            <div>
                                <label className="block text-xs text-[var(--jimbo-blue)] mb-1 font-header tracking-wider">Ritual ID</label>
                                <JimboInput
                                    placeholder="Cloud9_Challenge"
                                    value={meta.id}
                                    onChange={e => setMeta({ ...meta, id: normalizeRitualId(e.target.value) })}
                                />
                                <p className="mt-1 text-xs font-pixel text-[var(--jimbo-grey)]">
                                    Letters, numbers, and underscores only. Spaces become underscores.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--jimbo-blue)] mb-1 font-header tracking-wider">Title</label>
                                <JimboInput
                                    placeholder="My Cool Challenge"
                                    value={meta.title}
                                    onChange={e => setMeta({ ...meta, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--jimbo-grey)] mb-1 font-header tracking-wider">Tagline</label>
                                <JimboInput
                                    placeholder="Can you beat the heat?"
                                    value={meta.tagline}
                                    onChange={e => setMeta({ ...meta, tagline: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--jimbo-grey)] mb-1 font-header tracking-wider">Author</label>
                                <JimboInput
                                    placeholder="Jimbo"
                                    value={meta.author}
                                    onChange={e => setMeta({ ...meta, author: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-[var(--jimbo-grey)] mb-1 font-header tracking-wider">Objective</label>
                                    <JimboInput
                                        placeholder="Wee Joker"
                                        value={meta.defaultObjective}
                                        onChange={e => setMeta({ ...meta, defaultObjective: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--jimbo-grey)] mb-1 font-header tracking-wider">Start Date</label>
                                    <JimboInput
                                        type="date"
                                        title="Start date"
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
                        <h2 className="text-2xl font-header flex items-center gap-2 mb-4 text-[var(--jimbo-red)]">
                            <FileText size={20} />
                            Define Rules (JAML)
                        </h2>
                        <JimboInnerPanel className="min-h-[400px]">
                            <JamlEditor initialJaml={jamlText} onJamlChange={(text) => setFromJaml(text)} />
                        </JimboInnerPanel>

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
                            Upload & Verify Seeds
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="block text-sm text-[var(--jimbo-grey)]">Upload CSV/TXT or paste seeds</label>
                                <JimboInput
                                    type="file"
                                    accept=".csv,.txt,text/csv,text/plain"
                                    onChange={handleSeedFileUpload}
                                />
                                <p className="text-xs font-pixel text-[var(--jimbo-grey)]">
                                    Max upload: 24 MB. CSV reads the first column. TXT reads one seed per line.
                                </p>
                                {uploadError && (
                                    <div className="text-[var(--jimbo-red)] font-pixel text-sm">
                                        {uploadError}
                                    </div>
                                )}
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
                                <h3 className="text-sm font-header text-[var(--jimbo-grey)] mb-2">Verification Results</h3>
                                {verificationResults.length === 0 ? (
                                    <div className="text-center text-[var(--jimbo-grey)] py-8">No seeds verified yet.</div>
                                ) : (
                                    <div className="space-y-2">
                                        {verificationResults.map((res, i) => (
                                            <div key={i} className={cn(
                                                "flex items-center justify-between p-2 rounded border text-sm",
                                                res.passed
                                                    ? "bg-[var(--jimbo-dark-green)] border-[var(--jimbo-green)] text-white"
                                                    : "bg-[var(--jimbo-dark-red)] border-[var(--jimbo-red)] text-white"
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
                        {/* preview card */}
                        {previewSeed && (
                            <div className="mb-4">
                                <RitualChallengeBoard
                                    seed={previewSeed}
                                    objectives={previewObjectives}
                                    ritualTitle={meta.title}
                                    ritualId={meta.id || undefined}
                                    isLocked={false}
                                    dayNumber={1}
                                    jamlConfig={jamlText}
                                    onCopy={() => { }}
                                    onShowHowTo={() => { }}
                                    onOpenSubmit={() => { }}
                                    onOpenLeaderboard={() => { }}
                                    canGoBack={false}
                                    canGoForward={false}
                                    displayDate={new Date(meta.epoch).toLocaleDateString()}
                                />
                            </div>
                        )}

                        <div className="w-24 h-24 rounded-full bg-[var(--jimbo-blue)] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,147,255,0.4)]">
                            <Check size={48} className="text-white" strokeWidth={4} />
                        </div>

                        <h2 className="text-3xl font-header">Ready to Create?</h2>

                        <JimboInnerPanel className="max-w-md text-left space-y-2 w-full">
                            <div className="flex justify-between">
                                <span className="text-[var(--jimbo-grey)]">ID:</span>
                                <span className="font-mono">{meta.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--jimbo-grey)]">Title:</span>
                                <span>{meta.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[var(--jimbo-grey)]">Seeds:</span>
                                <span className="text-[var(--jimbo-green)]">{verificationResults.filter(r => r.passed).length} valid</span>
                            </div>
                        </JimboInnerPanel>

                        <JimboButton variant="red" onClick={handleSubmit} disabled={isSubmitting} className="px-12 py-4 text-xl mt-4">
                            {isSubmitting ? "Forging..." : "Create Ritual"}
                        </JimboButton>

                        {createError && (
                            <JimboInnerPanel className="max-w-md w-full space-y-3 text-left">
                                <div className="text-[var(--jimbo-red)] font-pixel text-sm">{createError}</div>
                                {existingPlayUrl && (
                                    <button
                                        type="button"
                                        onClick={() => router.push(existingPlayUrl)}
                                        className="jimbo-btn jimbo-btn-blue w-full"
                                    >
                                        Play Existing Ritual
                                    </button>
                                )}
                                {suggestedId && (
                                    <button
                                        type="button"
                                        onClick={() => setMeta(current => ({ ...current, id: suggestedId }))}
                                        className="jimbo-btn jimbo-btn-red w-full"
                                    >
                                        Use Ritual ID {suggestedId}
                                    </button>
                                )}
                            </JimboInnerPanel>
                        )}
                    </div>
                )}
            </JimboPanel>
        </div>
    );
}
