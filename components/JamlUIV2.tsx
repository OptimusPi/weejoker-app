"use client";

import React, { useState, useEffect, useRef } from 'react';

import JamlEditor from './JamlEditor';
import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { JAML_PRESETS } from '@/lib/jaml/presets';
import { searchSeedsWasm, cancelSearch, isSearchRunning, addSearchListener } from '@/lib/api/motelyWasm';
import { AgnosticSeedCard } from './AgnosticSeedCard';
import { WasmStatus } from './WasmStatus';
import { SearchResult, motelyApi } from '@/lib/api/motelyApi';
import { cn } from '@/lib/utils';
import {
    Search,
    Square,
    Loader2,
    Sparkles,
    Flame,
    PanelLeft,
    PanelRight,
    Maximize2,
    Minimize2,
    Settings,
    Globe,
    Cpu,
    AlertCircle,
    Terminal,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function JamlUIV2() {
    const {
        jamlText,
        setFromJaml
    } = useJamlFilter();

    // UI State
    const [leftPanelWidth, setLeftPanelWidth] = useState(300);
    const [rightPanelWidth, setRightPanelWidth] = useState(400);
    const [bottomPanelHeight, setBottomPanelHeight] = useState(150);
    const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
    const [isRightCollapsed, setIsRightCollapsed] = useState(false);
    const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

    // Search State
    const [searchMode, setSearchMode] = useState<'local' | 'remote'>('local');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [seedsProcessed, setSeedsProcessed] = useState(0);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [jamlDiagnostics, setJamlDiagnostics] = useState<any>(null);

    const stopRef = useRef(false);
    const searchCleanupRef = useRef<(() => void) | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchCleanupRef.current) searchCleanupRef.current();
            cancelSearch();
        };
    }, []);

    // Resizing Logic
    const isResizingLeft = useRef(false);
    const isResizingRight = useRef(false);
    const isResizingBottom = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingLeft.current) {
                setLeftPanelWidth(Math.max(200, Math.min(600, e.clientX)));
            }
            if (isResizingRight.current) {
                const width = window.innerWidth - e.clientX;
                setRightPanelWidth(Math.max(250, Math.min(800, width)));
            }
            if (isResizingBottom.current) {
                const height = window.innerHeight - e.clientY;
                setBottomPanelHeight(Math.max(100, Math.min(500, height)));
            }
        };

        const handleMouseUp = () => {
            isResizingLeft.current = false;
            isResizingRight.current = false;
            isResizingBottom.current = false;
            document.body.style.cursor = 'default';
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    useEffect(() => {
        const validate = async () => {
            if (!jamlText) return;
            try {
                const { validateJamlWasm } = await import('@/lib/api/motelyWasm');
                const result = await validateJamlWasm(jamlText);
                setJamlDiagnostics(result);
            } catch (e) {
                console.warn("Validation error:", e);
            }
        };

        const timer = setTimeout(validate, 500);
        return () => clearTimeout(timer);
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

        try {
            if (searchMode === 'local') {
                const cleanup = addSearchListener((event) => {
                    if (event.type === 'result') {
                        setSearchResults(prev => {
                            if (prev.some(r => r.seed === event.data.seed)) return prev;
                            return [...prev, {
                                seed: event.data.seed,
                                score: event.data.score,
                                tallies: event.data.tallies || []
                            } as any];
                        });
                    } else if (event.type === 'progress') {
                        setSeedsProcessed(event.data.SearchedCount || 0);
                    } else if (event.type === 'complete') {
                        setIsSearching(false);
                        if (searchCleanupRef.current) {
                            searchCleanupRef.current();
                            searchCleanupRef.current = null;
                        }
                    } else if (event.type === 'error') {
                        setSearchError(event.message);
                        setIsSearching(false);
                    }
                });

                searchCleanupRef.current = cleanup;
                await searchSeedsWasm(jamlText, 50, '');
            } else {
                // Remote API Search
                // @ts-ignore - method added dynamically or via recent edit
                const results = await motelyApi.searchSeedsRemote(jamlText);
                setSearchResults(results);
                setIsSearching(false);
            }
        } catch (err: any) {
            setSearchError(err.message);
            setIsSearching(false);
            if (searchCleanupRef.current) {
                searchCleanupRef.current();
                searchCleanupRef.current = null;
            }
        }
    };

    const handleStop = () => {
        stopRef.current = true;
        setIsSearching(false);
        cancelSearch();
        if (searchCleanupRef.current) {
            searchCleanupRef.current();
            searchCleanupRef.current = null;
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-[var(--balatro-black)] text-white overflow-hidden font-pixel">

            {/* TOP BAR */}
            <header className="h-14 border-b border-white/10 bg-black/40 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-header leading-none tracking-tighter">JAMLUIV2</h1>
                        <span className="text-[8px] opacity-40 uppercase">Modular Ritual Factory</span>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-2" />

                    {/* Mode Toggle */}
                    <div className="flex bg-black/60 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setSearchMode('local')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-md transition-all text-[10px]",
                                searchMode === 'local' ? "bg-[var(--balatro-purple)] text-white shadow-lg" : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <Cpu size={12} /> LOCAL WASM
                        </button>
                        <button
                            onClick={() => setSearchMode('remote')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1 rounded-md transition-all text-[10px]",
                                searchMode === 'remote' ? "bg-[var(--balatro-blue)] text-white shadow-lg" : "text-white/40 hover:text-white/60"
                            )}
                        >
                            <Globe size={12} /> REMOTE API
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isSearching && (
                        <div className="flex items-center gap-2 text-[var(--balatro-gold)] animate-pulse">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-[10px]">SEEKING... {seedsProcessed}</span>
                        </div>
                    )}
                    <button
                        onClick={handleSearch}
                        className={cn(
                            "balatro-button !py-1.5 !px-6 !text-sm",
                            isSearching ? "balatro-button-red underline" : "balatro-button-gold"
                        )}
                    >
                        {isSearching ? <Square size={14} /> : <Search size={14} />}
                        {isSearching ? 'STOP' : 'RUN SEARCH'}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex overflow-hidden relative">



                {/* CENTER PANEL: THE EDITOR */}
                <div className="flex-1 flex flex-col min-w-0 bg-black/10 relative">
                    {/* Panel Toggle Left */}
                    <button
                        onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center rounded-r-lg z-40 transition-all border-y border-r border-white/10"
                    >
                        <PanelLeft size={10} className={cn(isLeftCollapsed && "rotate-180")} />
                    </button>

                    <div className="flex-1 flex flex-col p-6 overflow-hidden">
                        <div className="flex-1 bg-black/40 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col relative">
                            <JamlEditor
                                initialJaml={jamlText} // Keep for initial load, but we rely on internal state after
                                onJamlChange={(val) => setFromJaml(val)}
                                className="flex-1 !bg-transparent"
                                key="main-editor" // Static key ensures we don't remount on every keystroke unless we want to
                            />

                            {/* BOTTOM PANEL: DIAGNOSTICS */}
                            {!isBottomCollapsed && (
                                <div
                                    className="bg-black/60 border-t border-white/10 flex flex-col overflow-hidden relative"
                                    style={{ height: bottomPanelHeight }}
                                >
                                    {/* Vertical Resize Handle */}
                                    <div
                                        className="absolute top-0 left-0 w-full h-1 cursor-row-resize hover:bg-[var(--balatro-purple)]/50 transition-colors z-50"
                                        onMouseDown={() => {
                                            isResizingBottom.current = true;
                                            document.body.style.cursor = 'row-resize';
                                        }}
                                    />
                                    <div className="flex-1 p-4 font-pixel overflow-y-auto custom-scrollbar">
                                        <div className="flex items-center gap-2 text-[var(--balatro-purple)] text-[10px] mb-2 uppercase opacity-60">
                                            <Terminal size={12} /> Diagnostic Console
                                        </div>
                                        {jamlDiagnostics?.errors?.length > 0 ? (
                                            <div className="space-y-1">
                                                {jamlDiagnostics.errors.map((err: any, i: number) => (
                                                    <div key={i} className="flex gap-2 text-red-400 text-[10px]">
                                                        <AlertCircle size={10} className="shrink-0 mt-0.5" />
                                                        <span>{err.message} (Line {err.line})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-green-400/50 text-[10px] italic">No syntax errors detected in JAML. Harmony achieved.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Bottom Panel Toggle */}
                            <button
                                onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                                className="absolute bottom-4 right-8 w-8 h-8 bg-black/60 hover:bg-black/80 flex items-center justify-center rounded-lg z-50 border border-white/10 shadow-lg text-white/40 hover:text-white"
                                title={isBottomCollapsed ? "Open Diagnostics" : "Close Diagnostics"}
                            >
                                {isBottomCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Panel Toggle Right */}
                    <button
                        onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-12 bg-white/5 hover:bg-white/10 flex items-center justify-center rounded-l-lg z-40 transition-all border-y border-l border-white/10"
                    >
                        <PanelRight size={10} className={cn(isRightCollapsed && "rotate-180")} />
                    </button>

                    {/* Floating Status */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-2 bg-[var(--balatro-black)]/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl flex items-center gap-4 z-50 animate-float-subtle">
                        <div className="flex items-center gap-2 text-[10px]">
                            <div className={cn("w-2 h-2 rounded-full", searchMode === 'local' ? "bg-[var(--balatro-purple)]" : "bg-[var(--balatro-blue)]")} />
                            <span className="opacity-60">{searchMode === 'local' ? 'LOCAL ENGINE ACTIVE' : 'REMOTE INSTANCE CONNECTED'}</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-2 text-[10px] text-[var(--balatro-gold)]">
                            <Sparkles size={12} />
                            <span>v2.1 STABLE</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: RESULTS */}
                {!isRightCollapsed && (
                    <div
                        className="bg-black/20 border-l border-white/5 flex flex-col relative"
                        style={{ width: rightPanelWidth }}
                    >
                        {/* Drag Handle Right */}
                        <div
                            className="absolute left-0 top-0 w-1 h-full cursor-col-resize hover:bg-[var(--balatro-blue)]/50 transition-colors z-50"
                            onMouseDown={() => {
                                isResizingRight.current = true;
                                document.body.style.cursor = 'col-resize';
                            }}
                        />

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[var(--balatro-gold)] text-xl font-header uppercase drop-shadow-md">Results</h3>
                                <div className="text-[8px] opacity-40">{searchResults.length} FOUND</div>
                            </div>

                            {searchResults.length > 0 ? (
                                <div className="space-y-4">
                                    {searchResults.map((result, idx) => (
                                        <div key={idx} className="animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                            <AgnosticSeedCard
                                                seed={result.seed}
                                                result={result}
                                                className="!scale-[0.80] !origin-left -mb-12"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-20">
                                    <Maximize2 size={32} />
                                    <span className="text-[10px] mt-4 uppercase tracking-widest">Awaiting Seeds</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>

            {/* STATUS BAR */}
            <footer className="h-8 border-t border-white/5 bg-black/60 flex items-center justify-between px-4 shrink-0 overflow-hidden">
                <div className="flex items-center gap-4 text-[7px] uppercase tracking-tighter opacity-40">
                    <span>Build: 013126</span>
                    <span>Env: Production</span>
                    <span>WASM: SIMD_ENABLED</span>
                </div>
                <div className="flex items-center gap-4 text-[7px] uppercase tracking-tighter opacity-40">
                    <span className="flex items-center gap-1"><Settings size={8} /> Latency: --ms</span>
                    <span>CPU: 0.1%</span>
                </div>
            </footer>

            <WasmStatus />
        </div>
    );
}
