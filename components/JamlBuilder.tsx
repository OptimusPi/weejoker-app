"use client";

import React, { useState, useRef, useEffect } from 'react';

import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { DECK_OPTIONS, STAKE_OPTIONS } from '@/lib/data/constants';
import JamlEditor from './JamlEditor';

import { cn } from '@/lib/utils';
import { X, Edit2, Loader2, Search, Square, Copy, RotateCcw, Flame, Sparkles } from 'lucide-react';
import type { SearchResultInfo } from 'motely-wasm';
import { AgnosticSeedCard } from './AgnosticSeedCard';
import { WasmStatus } from './WasmStatus';
import { JAML_PRESETS } from '@/lib/jaml/jamlPresets';
import { JimboPanel, JimboInnerPanel } from './JimboPanel';

export default function JamlBuilder() {
    const {
        filter,
        jamlText,
        setFromJaml,
        updateFilter,
        addClause,
        editClause,
        deleteClause,
        editingClause,
        setEditingClause
    } = useJamlFilter();

    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResultInfo[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [seedsProcessed, setSeedsProcessed] = useState(0);
    const stopRef = useRef(false);
    const searchCleanupRef = useRef<(() => void) | null>(null);

    // Cleanup search on unmount
    useEffect(() => {
        return () => {
            if (searchCleanupRef.current) searchCleanupRef.current();
            import('motely-wasm').then(({ loadMotely }) => loadMotely().then(api => { api.stopSearch(); api.disposeSearch(); }));
        };
    }, []);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = async () => {
        // Stop any existing search
        if (isSearching) {
            handleStop();
        }

        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);
        setSeedsProcessed(0);
        stopRef.current = false;

        try {
            const { loadMotely } = await import('motely-wasm');
            const api = await loadMotely();

            searchCleanupRef.current = () => {
                api.stopSearch();
            };

            await api.startJamlSearch(jamlText, {
                onProgress: (totalSeedsSearched) => {
                    setSeedsProcessed(totalSeedsSearched);
                },
                onResult: (seed, score) => {
                    setSearchResults(prev => {
                        if (prev.some(r => r.seed === seed)) return prev;
                        return [...prev, { seed, score } as any];
                    });
                }
            });

            setIsSearching(false);
            if (searchCleanupRef.current) {
                searchCleanupRef.current = null;
            }
        } catch (e: any) {
            console.error("Local search error:", e);
            setSearchError(e.message || 'Local search failed');
            setIsSearching(false);
        }
    };

    const handleStop = async () => {
        stopRef.current = true;
        setIsSearching(false);

        try {
            const { loadMotely } = await import('motely-wasm');
            const api = await loadMotely();
            api.stopSearch();
            await api.disposeSearch();
        } catch { }

        if (searchCleanupRef.current) {
            searchCleanupRef.current();
            searchCleanupRef.current = null;
        }
    };


    const handleCopyJaml = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(jamlText).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        }
    };

    const handleResetJaml = () => {
        if (confirm("Reset editor to default JAML?")) {
            setFromJaml(""); // useJamlFilter handles the default
        }
    };

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4 flex-1 overflow-hidden flex flex-col gap-4 bg-[var(--jimbo-panel-edge)]">
            <div className="flex flex-col lg:grid lg:grid-cols-[1fr_400px] gap-6 h-full overflow-hidden">
                {/* LEFT COLUMN: Interactive God-Like Editor (Main Workspace) */}
                <div className="flex flex-col gap-6 overflow-hidden min-h-0">
                    {/* CONTROL BAR */}
                    <JimboPanel className="py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4 items-center">
                                <div>
                                    <h2 className="text-white text-xl font-header mb-1 uppercase tracking-widest leading-none">JAML IDE</h2>
                                    <p className="text-[var(--jimbo-grey)] font-pixel text-[10px] uppercase tracking-wide">Joker Creator v2.0</p>
                                </div>
                                <div className="h-8 w-px bg-[var(--jimbo-panel-edge)] mx-2" />
                                <div className="flex gap-1">
                                    <button
                                        onClick={handleCopyJaml}
                                        className="p-2 hover:bg-white/5 rounded text-[var(--jimbo-grey)] hover:text-white transition-colors"
                                        title="Copy JAML"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={handleResetJaml}
                                        className="p-2 hover:bg-white/5 rounded text-[var(--jimbo-grey)] hover:text-white transition-colors"
                                        title="Reset Editor"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                {isSearching && (
                                    <JimboInnerPanel className="flex items-center gap-2 mr-2 px-3 py-1 font-pixel text-[10px] text-[var(--jimbo-grey)]">
                                        <Loader2 size={12} className="animate-spin text-[var(--jimbo-gold)]" />
                                        <span>SEARCHING...</span>
                                    </JimboInnerPanel>
                                )}
                                <button
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                    className="jimbo-btn jimbo-btn-gold !py-2 !px-4 !text-sm flex items-center gap-2"
                                >
                                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                                    RUN SEARCH
                                </button>
                                {isSearching && (
                                    <button
                                        onClick={handleStop}
                                        className="jimbo-btn jimbo-btn-red !py-2 !px-4 !text-sm"
                                    >
                                        STOP
                                    </button>
                                )}
                            </div>
                        </div>
                    </JimboPanel>

                    {/* THE GOD-LIKE EDITOR - (YEAH I FUCKIN WISH... IDIOT..) */}
                    <JimboInnerPanel className="flex-1 min-h-0 flex flex-col !p-0 overflow-hidden border-[var(--jimbo-panel-edge)]">
                        <JamlEditor
                            initialJaml={jamlText}
                            onJamlChange={(val: string) => setFromJaml(val)}
                            className="flex-1"
                        />
                    </JimboInnerPanel>
                </div>

                {/* RIGHT COLUMN: Search Results (Sidebar) */}
                <div className="flex flex-col gap-6 overflow-hidden pb-10">
                    {/* SEARCH RESULTS */}
                    <JimboPanel className="h-full overflow-hidden flex flex-col border-[var(--jimbo-gold)]">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <h3 className="text-[var(--jimbo-gold)] text-xl font-header drop-shadow-md uppercase">
                                    Results {searchResults.length > 0 && `(${searchResults.length})`}
                                </h3>
                                {isSearching && (
                                    <div className="flex items-center gap-2 font-pixel text-[10px] text-[var(--jimbo-blue)] animate-pulse">
                                        <Sparkles size={12} className="animate-spin" />
                                        <span>{seedsProcessed}</span>
                                    </div>
                                )}
                            </div>
                            {isSearching && <Loader2 size={16} className="animate-spin text-[var(--jimbo-blue)]" />}
                        </div>

                        {/* Spectral Progress Bar */}
                        {isSearching && (
                            <JimboInnerPanel className="w-full h-1 !p-0 mb-4 overflow-hidden border-[var(--jimbo-panel-edge)]">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--jimbo-blue)] via-[var(--jimbo-purple)] to-[var(--jimbo-red)] animate-gradient-x transition-all duration-300 w-[var(--progress-w)]"
                                    // eslint-disable-next-line react/forbid-component-props
                                    style={{ '--progress-w': `${Math.min((searchResults.length / 50) * 100, 100)}%` } as React.CSSProperties}
                                />
                            </JimboInnerPanel>
                        )}

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                            {searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {searchResults.map((result: SearchResultInfo) => (
                                        <AgnosticSeedCard
                                            key={result.seed}
                                            seed={result.seed}
                                            jamlFilter={filter}
                                            className="!scale-95 !origin-top"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <JimboInnerPanel className="h-full flex flex-col items-center justify-center italic font-pixel text-sm p-4 text-center border-dashed">
                                    {searchError ? (
                                        <div className="text-[var(--jimbo-red)] bg-[#211] p-4 rounded text-center border border-[var(--jimbo-red)]">
                                            <div className="font-header text-lg mb-1">SEARCH FAILED</div>
                                            <div className="text-[var(--jimbo-grey)]">{searchError}</div>
                                        </div>
                                    ) : (
                                        <div className="text-[var(--jimbo-grey)]">
                                            {isSearching ? 'SEEKING...' : 'RESULTS WILL APPEAR HERE'}
                                        </div>
                                    )}
                                </JimboInnerPanel>
                            )}
                        </div>
                    </JimboPanel>
                </div>
            </div>

            <WasmStatus />
        </div>
    );
}

