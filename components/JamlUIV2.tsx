"use client";

import React, { useState, useEffect, useRef } from 'react';

import { InteractiveJamlEditor } from '@/Blueprint/src/components/blueprint/jamlView/InteractiveJamlEditor';
import { JamlGenie } from './JamlGenie';
import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { JAML_PRESETS } from '@/lib/jaml/presets';
import { AgnosticSeedCard } from './AgnosticSeedCard';
import { WasmStatus } from './WasmStatus';
import { SearchResult, motelyApi } from '@/lib/api/motelyApi';
import { cn } from '@/lib/utils';
import { DeckSprite, DECK_MAP, STAKE_MAP } from './DeckSprite';
import {
    Search,
    Square,
    Loader2,
    Sparkles,
    Flame,
    Maximize2,
    Cpu,
    Globe,
    Terminal,
    Activity,
    Database,
    Zap,
    MessageSquare,
    Monitor
} from 'lucide-react';

/**
 * Reusable Dashboard Tile with Balatro Color Coding
 */
function Tile({
    title,
    color = "red",
    icon: Icon,
    children,
    className,
    headerRight
}: {
    title: string;
    color?: "red" | "orange" | "purple" | "green" | "blue" | "teal" | "gold";
    icon?: any;
    children: React.ReactNode;
    className?: string;
    headerRight?: React.ReactNode;
}) {
    const colorMap = {
        red: "border-[var(--balatro-red)] shadow-[0_0_15px_rgba(254,95,85,0.15)]",
        orange: "border-[var(--balatro-orange)] shadow-[0_0_15px_rgba(253,162,0,0.15)]",
        purple: "border-[var(--balatro-purple)] shadow-[0_0_15px_rgba(136,103,165,0.15)]",
        green: "border-[var(--balatro-green)] shadow-[0_0_15px_rgba(75,194,146,0.15)]",
        blue: "border-[var(--balatro-blue)] shadow-[0_0_15px_rgba(0,157,255,0.15)]",
        teal: "border-[#00ffaa] shadow-[0_0_15px_rgba(0,255,170,0.15)]",
        gold: "border-[var(--balatro-gold)] shadow-[0_0_15px_rgba(234,192,88,0.15)]",
    };

    const textColorMap = {
        red: "text-[var(--balatro-red)]",
        orange: "text-[var(--balatro-orange)]",
        purple: "text-[var(--balatro-purple)]",
        green: "text-[var(--balatro-green)]",
        blue: "text-[var(--balatro-blue)]",
        teal: "text-[#00ffaa]",
        gold: "text-[var(--balatro-gold)]",
    };

    return (
        <div className={cn(
            "balatro-panel flex flex-col overflow-hidden transition-all duration-300",
            colorMap[color],
            className
        )}>
            <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <div className="flex items-center gap-2">
                    {Icon && <Icon size={16} className={textColorMap[color]} />}
                    <h3 className={cn("font-header text-sm uppercase tracking-widest", textColorMap[color])}>
                        {title}
                    </h3>
                </div>
                {headerRight}
            </div>
            <div className="flex-1 min-h-0 bg-black/20 rounded-lg overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}

export default function JamlUIV2() {
    const {
        jamlText,
        setFromJaml
    } = useJamlFilter();

    // Search State
    const [searchMode, setSearchMode] = useState<'local' | 'remote'>('local');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [seedsProcessed, setSeedsProcessed] = useState(0);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [jamlDiagnostics, setJamlDiagnostics] = useState<any>(null);
    const [technicalLogs, setTechnicalLogs] = useState<string[]>(["[SYSTEM] Initializing Motely Nexus...", "[SYSTEM] WASM Engine Standby."]);

    const stopRef = useRef(false);
    const searchCleanupRef = useRef<(() => void) | null>(null);
    const seenSeedsRef = useRef<Set<string>>(new Set());

    // Deck & Stake Selection
    const [deckSlug, setDeckSlug] = useState('Ghost');
    const [stakeSlug, setStakeSlug] = useState('White');
    const [showDeckSelector, setShowDeckSelector] = useState(false);

    // Logging helper
    const addLog = (msg: string) => {
        setTechnicalLogs(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchCleanupRef.current) searchCleanupRef.current();
        };
    }, []);

    // JAML Validation Hook (WASM REMOVED)
    useEffect(() => {
        // Disabled
    }, [jamlText]);

    const handleSearch = async () => {
        if (isSearching) {
            handleStop();
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);
        setSeedsProcessed(0);
        stopRef.current = false;
        seenSeedsRef.current.clear();

        addLog(`Initiating ${searchMode.toUpperCase()} search...`);

        try {
            if (searchMode === 'local') {
                // WASM REMOVED
                addLog("CRITICAL: WASM ENGINE MISSING");
                setSearchError("WASM Engine Removed");
                setIsSearching(false);
            } else {
                // Remote API Search
                // @ts-ignore
                const results = await motelyApi.searchSeedsRemote(jamlText);
                setSearchResults(results);
                setIsSearching(false);
                addLog(`Remote search initiated. Polling for results...`);
            }
        } catch (err: any) {
            setSearchError(err.message);
            addLog(`CRITICAL: ${err.message}`);
            setIsSearching(false);
        }
    };

    const [analysisSeed, setAnalysisSeed] = useState('');
    const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);

    const handleAnalyze = () => {
        if (!analysisSeed) return;
        addLog(`Analyzing Seed: ${analysisSeed}...`);
        setActiveAnalysis(analysisSeed);
    };

    const handleStop = () => {
        stopRef.current = true;
        setIsSearching(false);
        setActiveAnalysis(null);
        // cancelSearch();
        if (searchCleanupRef.current) {
            searchCleanupRef.current();
            searchCleanupRef.current = null;
        }
    };

    return (
        <div className="min-h-screen w-screen flex flex-col bg-black/60 text-white overflow-x-hidden font-pixel">

            {/* HEADER: COMMAND CENTER BAR */}
            <header className="h-14 border-b border-white/10 bg-black/60 flex items-center justify-between px-6 shrink-0 relative z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--balatro-red)] to-[var(--balatro-purple)] animate-pulse shadow-[0_0_15px_var(--balatro-red)] flex items-center justify-center">
                            <Monitor size={16} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-header leading-none tracking-tighter text-white">COMMAND STATION</h1>
                            <span className="text-[8px] opacity-40 uppercase tracking-widest">Motely Global Seed Nexus v3.2</span>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    <div className="flex bg-black/60 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setSearchMode('local')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-[10px] font-pixel",
                                searchMode === 'local' ? "bg-[var(--balatro-purple)] text-white shadow-lg" : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <Cpu size={12} /> LOCAL ENGINE
                        </button>
                        <button
                            onClick={() => setSearchMode('remote')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-[10px] font-pixel",
                                searchMode === 'remote' ? "bg-[var(--balatro-blue)] text-white shadow-lg" : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <Globe size={12} /> CLOUD COMPUTE
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isSearching && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-[var(--balatro-gold)]/20 animate-spectral-pulse">
                            <Loader2 size={16} className="animate-spin text-[var(--balatro-gold)]" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-[var(--balatro-gold)] uppercase leading-none">Scanning...</span>
                                <span className="text-[12px] text-white font-header leading-none mt-1">{seedsProcessed.toLocaleString()} SEEDS</span>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleSearch}
                        className={cn(
                            "balatro-button !py-2 !px-8 !text-lg !h-11 min-w-[180px]",
                            isSearching ? "balatro-button-red active:translate-y-0" : "balatro-button-gold"
                        )}
                    >
                        {isSearching ? <Square size={18} fill="currentColor" /> : <Search size={18} />}
                        {isSearching ? 'ABORT MISSION' : 'START RITUAL'}
                    </button>
                </div>
            </header>

            {/* RESPONSIVE DASHBOARD LAYOUT */}
            <main className="flex-1 flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-12 gap-4 p-4 min-h-0 overflow-y-auto lg:overflow-hidden bg-[#0f1415]">

                {/* 1. JAML EDITOR (MAIN LEFT) - Full width mobile, col-span-9 desktop */}
                <Tile
                    title="JAML Specification"
                    color="red"
                    icon={Terminal}
                    className="w-full lg:w-auto lg:col-span-9 lg:row-span-11 min-h-[500px] lg:min-h-0"
                >
                    <InteractiveJamlEditor
                        initialJaml={jamlText}
                        onJamlChange={(val) => setFromJaml(val || '')}
                    />
                </Tile>

                {/* 2. MATCHES (TOP RIGHT) */}
                <Tile
                    title="Matches Found"
                    color="purple"
                    icon={Database}
                    className="w-full lg:w-auto lg:col-span-3 lg:row-span-5 min-h-[300px] lg:min-h-0"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {searchResults.length > 0 ? (
                                <div className="space-y-4">
                                    {searchResults.map((result, idx) => (
                                        <AgnosticSeedCard
                                            key={result.seed}
                                            seed={result.seed}
                                            result={result}
                                            className="!scale-[0.80] !origin-left -mb-12 animate-in fade-in slide-in-from-right-4 duration-300"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center opacity-20 text-center p-4">
                                    <Database size={24} />
                                    <p className="text-[10px] mt-2 uppercase tracking-widest font-header">Awaiting telemetry</p>
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-black/40 border-t border-white/5 flex justify-between items-center shrink-0">
                            <span className="text-[9px] opacity-40">AUTO-EXPORT: OFF</span>
                        </div>
                    </div>
                </Tile>

                {/* 3. SEED INSPECTION (MIDDLE RIGHT) */}
                <Tile
                    title="Seed Inspection"
                    color="orange"
                    icon={Zap}
                    className="w-full lg:w-auto lg:col-span-3 lg:row-span-4 min-h-[250px] lg:min-h-0"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 p-3 shrink-0 bg-black/20 flex-col overflow-visible z-20">
                            <div className="w-full flex flex-col gap-1 relative">
                                <label className="text-[9px] opacity-40 uppercase pl-1">Target Seed</label>

                                <div className="flex bg-black/40 border border-white/10 rounded overflow-visible relative">
                                    <input
                                        className="balatro-input !bg-transparent !border-none !h-10 !text-xl tracking-[0.2em] uppercase flex-1 text-center min-w-0"
                                        placeholder="SEED"
                                        value={analysisSeed}
                                        onChange={(e) => setAnalysisSeed(e.target.value.toUpperCase())}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                                    />

                                    {/* DECK SELECTOR SPLIT BUTTON */}
                                    <button
                                        onClick={() => setShowDeckSelector(!showDeckSelector)}
                                        className="px-3 border-l border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors flex items-center gap-2 group relative bg-black/20"
                                    >
                                        <div className="relative pointer-events-none transform scale-75 origin-right">
                                            <DeckSprite deck={deckSlug} stake={stakeSlug} size={30} />
                                        </div>
                                        <div className="flex flex-col items-start mr-1">
                                            <span className="text-[9px] text-[var(--balatro-blue)] font-bold uppercase leading-none">{deckSlug}</span>
                                            <span className="text-[7px] text-white/50 uppercase leading-none mt-0.5">{stakeSlug} Stake</span>
                                        </div>
                                    </button>

                                    {/* DROPDOWN MENU */}
                                    {showDeckSelector && (
                                        <div className="absolute top-full right-0 mt-2 w-[280px] bg-black/90 border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-4 z-[100]">

                                            {/* Decks Grid */}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[9px] font-bold text-[var(--balatro-blue)] uppercase tracking-widest pl-1">Deck Architecture</span>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {Object.keys(DECK_MAP).map(deck => (
                                                        <button
                                                            key={deck}
                                                            onClick={() => { setDeckSlug(deck); setShowDeckSelector(false); }}
                                                            className={cn(
                                                                "relative aspect-[2/3] rounded border transition-all overflow-hidden group",
                                                                deckSlug.toLowerCase() === deck ? "border-[var(--balatro-gold)] shadow-[0_0_10px_var(--balatro-gold)] ring-1 ring-[var(--balatro-gold)]" : "border-white/10 hover:border-white/30"
                                                            )}
                                                            title={deck}
                                                        >
                                                            <div className="absolute inset-0 flex items-center justify-center transform scale-75">
                                                                <DeckSprite deck={deck} size={40} />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Stakes Grid */}
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[9px] font-bold text-[var(--balatro-red)] uppercase tracking-widest pl-1">Stake Difficulty</span>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {Object.keys(STAKE_MAP).map(stake => (
                                                        <button
                                                            key={stake}
                                                            onClick={() => { setStakeSlug(stake); setShowDeckSelector(false); }}
                                                            className={cn(
                                                                "relative h-10 rounded border transition-all overflow-hidden group flex items-center justify-center",
                                                                stakeSlug.toLowerCase() === stake ? "border-[var(--balatro-gold)] bg-[var(--balatro-gold)]/10" : "border-white/10 hover:border-white/30 bg-black/40"
                                                            )}
                                                            title={stake}
                                                        >
                                                            <div className="transform scale-75 pointer-events-none">
                                                                <DeckSprite deck={deckSlug} stake={stake} size={30} className="!w-[30px] !h-[40px] overflow-hidden" />
                                                                {/* Hack: The sprite shows the deck too, which is cool for preview */}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleAnalyze}
                                className="balatro-button balatro-button-orange !py-0 !h-8 w-full !text-xs mt-2"
                            >
                                ANALYZE
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-black/40">
                            {activeAnalysis ? (
                                <AgnosticSeedCard
                                    seed={activeAnalysis}
                                    deckSlug={deckSlug}
                                    stakeSlug={stakeSlug}
                                    jamlConfig={jamlText}
                                    className="!scale-75 !origin-top-left w-[130%]"
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center opacity-20">
                                    <Zap size={24} />
                                </div>
                            )}
                        </div>
                    </div>
                </Tile>

                {/* 4. SYSTEM STATE (BOTTOM RIGHT) */}
                <Tile
                    title="Engine State"
                    color="green"
                    icon={Activity}
                    className="w-full lg:w-auto lg:col-span-3 lg:row-span-2 min-h-[150px] lg:min-h-0"
                >
                    <div className="p-3 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] opacity-40 uppercase">Status</span>
                            <span className="text-[10px] text-[var(--balatro-green)] font-header">ONLINE</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/20 p-1.5 rounded border border-white/5">
                                <span className="block text-[7px] opacity-30 uppercase">Threads</span>
                                <span className="text-xs font-header text-white">MAX</span>
                            </div>
                            <div className="flex-1 bg-black/20 p-1.5 rounded border border-white/5">
                                <span className="block text-[7px] opacity-30 uppercase">Queue</span>
                                <span className="text-xs font-header text-white">EMPTY</span>
                            </div>
                        </div>
                    </div>
                </Tile>

            </main>

            {/* STATUS BAR FOOTER */}
            <footer className="h-8 border-t border-white/5 bg-black/90 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-6 text-[8px] uppercase tracking-widest text-white/40 font-pixel">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]" />
                        SYSTEM: OPERATIONAL
                    </span>
                    <span className="flex items-center gap-2">
                        <Zap size={10} className="text-[var(--balatro-gold)]" />
                        LATENCY: 42MS
                    </span>
                    <span className="flex items-center gap-2">
                        <Flame size={10} className="text-[var(--balatro-red)]" />
                        REVENUE: 0.00$ / HR
                    </span>
                </div>

                <div className="flex items-center gap-6 text-[8px] uppercase tracking-widest text-white/40 font-pixel">
                    <span>{new Date().toLocaleTimeString()} CST</span>
                    <span className="text-[var(--balatro-blue)]">SECURE UPLINK ESTABLISHED</span>
                </div>
            </footer>

            <WasmStatus />
        </div>
    );
}
