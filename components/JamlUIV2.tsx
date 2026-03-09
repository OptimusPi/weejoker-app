"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';

import JamlEditor from '@/components/JamlEditor';
import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { AgnosticSeedCard } from './AgnosticSeedCard';
import { WasmStatus } from './WasmStatus';
import { SearchResult } from '@/lib/api/motelyWasm';
import { cn } from '@/lib/utils';
import { DeckSprite, DECK_MAP, STAKE_MAP } from './DeckSprite';
import { MotelyVersionBadge } from './MotelyVersionBadge';
import { JimboPanel, JimboInnerPanel } from './JimboPanel';
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
 * Reusable Dashboard Tile with Sleek Professional Aesthetics
 */
const TILE_TEXT: Record<string, string> = {
    red: "text-[var(--jimbo-red)]",
    blue: "text-[var(--jimbo-blue)]",
    green: "text-[var(--jimbo-dark-green)]",
    gold: "text-[var(--jimbo-gold)]",
    purple: "text-[var(--jimbo-purple)]",
    teal: "text-teal-400",
    orange: "text-[var(--jimbo-orange)]"
};

const TILE_BG_SOFT: Record<string, string> = {
    red: "bg-[var(--jimbo-red)]/10",
    blue: "bg-[var(--jimbo-blue)]/10",
    green: "bg-[var(--jimbo-dark-green)]/10",
    gold: "bg-[var(--jimbo-gold)]/10",
    purple: "bg-[var(--jimbo-purple)]/10",
    teal: "bg-teal-400/10",
    orange: "bg-[var(--jimbo-orange)]/10"
};

function Tile({
    title,
    color = "blue",
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
    return (
        <JimboPanel className={cn(
            "flex flex-col transition-all duration-300 group relative",
            TILE_BG_SOFT[color],
            className
        )}>
            {/* Minimal Decorative Dots */}
            <div className="absolute top-3 right-4 flex gap-1.5 opacity-10 group-hover:opacity-30 transition-opacity">
                {[1, 2, 3].map(i => (
                    <div key={i} className={cn("w-1 h-1 rounded-full", TILE_TEXT[color].replace('text-', 'bg-'))} />
                ))}
            </div>

            <div className="flex items-center justify-between mb-3 px-1 shrink-0 relative z-10">
                <div className="flex items-center gap-2.5">
                    {Icon && <Icon size={18} className={cn("opacity-70", TILE_TEXT[color])} />}
                    <h3 className={cn("font-header text-sm tracking-[0.25em] opacity-90", TILE_TEXT[color])}>
                        {title}
                    </h3>
                </div>
                <div className="scale-90 origin-right">
                    {headerRight}
                </div>
            </div>

            <JimboInnerPanel className="flex-1 min-h-0 !p-0 overflow-hidden flex flex-col border-[var(--jimbo-panel-edge)]">
                {children}
            </JimboInnerPanel>
        </JimboPanel>
    );
}

export default function JamlUIV2() {
    const {
        filter,
        jamlText,
        setFromJaml
    } = useJamlFilter();

    // Search State
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
    const [deckSlug, setDeckSlug] = useState('Erratic');
    const [stakeSlug, setStakeSlug] = useState('White');
    const [showDeckSelector, setShowDeckSelector] = useState(false);

    const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
    // Logging helper
    const addLog = useCallback((msg: string) => {
        setTechnicalLogs(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, []);


    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchCleanupRef.current) searchCleanupRef.current();
        };
    }, []);


    const handleSearch = async () => {
        if (isSearching) {
            handleStop();
            return;
        }

        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);
        setSeedsProcessed(0);
        seenSeedsRef.current.clear();
        stopRef.current = false;
        setActiveAnalysis(null);
        addLog(`Spinning up WASM Thread Pool...`);

        // Dynamic import of the WASM engine
        const { searchSeedsWasm, addSearchListener, cancelSearch } = await import('@/lib/api/motelyWasm');

        searchCleanupRef.current = async () => {
            await cancelSearch();
        };

        addSearchListener((event: any) => {
            if (stopRef.current) return;

            if (event.type === 'result') {
                const result = event.data as SearchResult;
                if (!seenSeedsRef.current.has(result.seed)) {
                    seenSeedsRef.current.add(result.seed);
                    setSearchResults(prev => [result, ...prev].slice(0, 10));
                    addLog(`MATCH: ${result.seed} (${result.score?.toLocaleString()})`);
                }
            } else if (event.type === 'progress') {
                setSeedsProcessed(event.data?.SearchedCount || 0);
            } else if (event.type === 'complete') {
                setIsSearching(false);
                addLog(`Search completed. ${event.data?.totalSeedsSearched || 0} seeds analyzed.`);
            } else if (event.type === 'error') {
                setSearchError(event.message || 'Unknown error');
                setIsSearching(false);
                addLog(`ERROR: ${event.message}`);
            }
        });

        try {
            await searchSeedsWasm(jamlText);
        } catch (err: any) {
            setSearchError(err.message);
            setIsSearching(false);
            addLog(`ERROR: ${err.message}`);
        }
    };

    const handleStop = () => {
        stopRef.current = true;
        setIsSearching(false);
        if (searchCleanupRef.current) searchCleanupRef.current();
        addLog(`Search aborted by user.`);
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--jimbo-panel-edge)]">
            {/* Main Application Shell */}
            <div className="flex-1 grid grid-cols-12 gap-5 p-5 min-h-0 overflow-y-auto lg:overflow-hidden">

                {/* Left Column: Command Console & Filter */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-5 min-h-[600px] lg:min-h-0 shrink-0">
                    <Tile
                        title="Ritual manifest (JAML)"
                        icon={Terminal}
                        color="blue"
                        className="flex-1 min-h-[300px]"
                        headerRight={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleSearch()}
                                    className={cn(
                                        "jimbo-btn !px-4 !py-1 text-sm h-9 min-w-[120px]",
                                        isSearching ? "jimbo-btn-red" : "jimbo-btn-blue"
                                    )}
                                >
                                    {isSearching ? (
                                        <><Square size={14} className="mr-2" fill="currentColor" /> Abort</>
                                    ) : (
                                        <><Flame size={16} className="mr-2" /> Ignite Engine</>
                                    )}
                                </button>
                            </div>
                        }
                    >
                        <JamlEditor
                            initialJaml={jamlText}
                            onJamlChange={(txt) => setFromJaml(txt)}
                        />
                    </Tile>

                    <Tile
                        title="Telemetry Feed"
                        icon={Activity}
                        color="teal"
                        className="h-[200px] shrink-0"
                    >
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-1 custom-scrollbar bg-[#111]">
                            {technicalLogs.map((log, i) => (
                                <div key={i} className={cn(
                                    "transition-opacity duration-500",
                                    i === technicalLogs.length - 1 ? "text-teal-400 opacity-100" : "text-[var(--jimbo-grey)] opacity-80"
                                )}>
                                    {log}
                                </div>
                            ))}
                            <div ref={el => el?.scrollIntoView({ behavior: 'smooth' })} />
                        </div>
                    </Tile>
                </div>

                {/* Right Column: Search Results & Analysis */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-5 min-h-0">
                    <div className="flex items-center justify-between px-2 h-10 shrink-0">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-[var(--jimbo-grey)] uppercase tracking-[0.2em]">Deployment State</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
                                    <MotelyVersionBadge minimal className="text-teal-400" />
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[10px] text-[var(--jimbo-grey)] uppercase tracking-[0.2em]">Seeds Processed</span>
                                <span className="text-xs font-header text-[var(--jimbo-blue)] uppercase tracking-widest">{seedsProcessed > 0 ? seedsProcessed.toLocaleString() : '--'}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <JimboInnerPanel
                                    onClick={() => setShowDeckSelector(!showDeckSelector)}
                                    className="flex items-center gap-3 !py-2 hover:border-white transition-colors cursor-pointer"
                                >
                                    <DeckSprite deck={deckSlug} stake={stakeSlug} size={28} />
                                    <div className="text-left">
                                        <div className="text-[10px] text-[var(--jimbo-grey)] uppercase tracking-widest leading-none mb-1">{stakeSlug} STAKE</div>
                                        <div className="text-sm font-header text-white uppercase tracking-wider leading-none">{deckSlug} DECK</div>
                                    </div>
                                </JimboInnerPanel>
                            </div>
                        </div>
                    </div>

                    <Tile
                        title="Seed Inspection Vault"
                        icon={Database}
                        color="blue"
                        className="flex-1"
                        headerRight={
                            <div className="flex items-center gap-3 text-xs font-header tracking-widest text-[var(--jimbo-blue)] opacity-80">
                                {isSearching && <Loader2 size={14} className="animate-spin" />}
                                <span>{seedsProcessed.toLocaleString()} seeds scanned</span>
                            </div>
                        }
                    >
                        <div className="flex-1 flex flex-col min-h-0">
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto custom-scrollbar">
                                    {searchResults.map((res, i) => (
                                        <div key={res.seed} className="juice-pop juice-pop-delay" {...{ style: { '--delay': `${i * 0.05}s` } as React.CSSProperties }}>
                                            <AgnosticSeedCard
                                                seed={res.seed}
                                                jamlFilter={filter}
                                                className={cn(
                                                    "transition-all duration-300 border-2",
                                                    activeAnalysis === res.seed ? "border-[var(--jimbo-blue)] scale-[1.02] shadow-[0_0_20px_rgba(30,160,230,0.2)]" : "border-transparent opacity-90 grayscale-[0.3] hover:grayscale-0 hover:opacity-100"
                                                )}
                                                onClick={() => setActiveAnalysis(res.seed)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-[var(--jimbo-grey)] p-10 text-center">
                                    <Zap size={64} className="mb-4 opacity-10" />
                                    <p className="font-header text-xl uppercase tracking-[0.3em] text-white">Ignite engine to populate vault</p>
                                    <p className="font-pixel text-[10px] mt-2 tracking-widest uppercase">Waiting for JAML instruction set...</p>
                                </div>
                            )}
                        </div>
                    </Tile>
                </div>
            </div>
        </div>
    );
}
