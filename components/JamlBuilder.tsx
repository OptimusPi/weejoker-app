import React, { useState, useRef } from 'react';
import { JamlGenie } from './JamlGenie';
import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { DECK_OPTIONS, STAKE_OPTIONS } from '@/lib/data/constants';
import Editor from '@monaco-editor/react';
import { ClauseEditor } from './ClauseEditor';
import { cn } from '@/lib/utils';
import { X, Edit2, Loader2, Search, Square } from 'lucide-react';
import { motelyApi, SearchResult } from '@/lib/api/motelyApi';
import { AgnosticSeedCard } from './AgnosticSeedCard';

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
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = async () => {
        setIsSearching(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            // Step 1: Save the current JAML as a new filter
            const saveResult = await motelyApi.saveFilter({
                filterId: filter.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '_' + Date.now(),
                filterJaml: jamlText,
                createNew: true,
            });

            const filterId = saveResult.filterId;

            // Step 2: Start search with the saved filter
            const searchResult = await motelyApi.startSearch({
                filterId,
                deck: filter.deck,
                stake: filter.stake,
            });

            const searchId = searchResult.searchId;
            setActiveSearchId(searchId);

            // Step 3: Poll for results
            const pollResults = async () => {
                try {
                    const status = await motelyApi.getSearchStatus(searchId);
                    if (status.results && status.results.length > 0) {
                        setSearchResults(status.results);
                    }
                    if (status.isRunning) {
                        pollRef.current = setTimeout(pollResults, 1000);
                    } else {
                        setIsSearching(false);
                        setActiveSearchId(null);
                    }
                } catch (e: any) {
                    setSearchError(e.message || 'Failed to get search results');
                    setIsSearching(false);
                }
            };
            pollResults();

        } catch (e: any) {
            setSearchError(e.message || 'Search failed');
            setIsSearching(false);
        }
    };

    const handleStopSearch = async () => {
        if (activeSearchId) {
            try {
                await motelyApi.stopSearch({ searchId: activeSearchId });
            } catch { /* ignore */ }
        }
        if (pollRef.current) {
            clearTimeout(pollRef.current);
        }
        setIsSearching(false);
        setActiveSearchId(null);
    };

    const handleSaveClause = (clause: any) => {
        if (!editingClause) return;

        if (editingClause.index !== null) {
            editClause(editingClause.bucket, editingClause.index, clause);
        } else {
            addClause(editingClause.bucket, clause);
        }
        setEditingClause(null);
    };

    const renderClauseList = (bucket: 'must' | 'should' | 'mustNot', title: string) => {
        const clauses = filter[bucket];
        const isEmpty = clauses.length === 0;

        // Map bucket to specific Balatro color variables for styling
        const styles = {
            must: {
                borderColor: 'border-[var(--balatro-green)]',
                textColor: 'text-[var(--balatro-green)]',
                btnColor: 'balatro-button-green'
            },
            should: {
                borderColor: 'border-[var(--balatro-blue)]',
                textColor: 'text-[var(--balatro-blue)]',
                btnColor: 'balatro-button-blue'
            },
            mustNot: {
                borderColor: 'border-[var(--balatro-red)]',
                textColor: 'text-[var(--balatro-red)]',
                btnColor: 'balatro-button-red'
            }
        };

        const style = styles[bucket];

        return (
            <div className={`balatro-panel ${style.borderColor} flex-1 min-h-[160px] flex flex-col`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`${style.textColor} text-2xl font-header drop-shadow-md`}>
                        {title}
                    </h3>
                    <button
                        onClick={() => setEditingClause({ bucket, index: null })}
                        className={`balatro-button ${style.btnColor} !py-1 !px-4 text-lg`}
                    >
                        +
                    </button>
                </div>

                <div className="flex-1 space-y-2">
                    {
                        clauses.map((clause, idx) => (
                            <div key={idx} className="bg-[var(--balatro-light-black)] border border-white/10 rounded p-2 flex justify-between items-center group">
                                <div>
                                    <div className="font-header text-lg text-white leading-none">
                                        {clause.type}: {clause.value}
                                    </div>
                                    <div className="font-pixel text-xs text-white/50">
                                        {clause.antes && clause.antes.length > 0 && `Antes: ${clause.antes.join(', ')}`}
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingClause({ bucket, index: idx })}
                                        className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white"
                                        aria-label="Edit clause"
                                        title="Edit clause"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteClause(bucket, idx)}
                                        className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300"
                                        aria-label="Delete clause"
                                        title="Delete clause"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    };

    const renderAnteSelector = () => (
        <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((ante) => (
                <button
                    key={ante}
                    onClick={() => {
                        const current = filter.defaults.antes;
                        const next = current.includes(ante)
                            ? current.filter(x => x !== ante)
                            : [...current, ante].sort();
                        updateFilter({ defaults: { ...filter.defaults, antes: next } });
                    }}
                    className={cn(
                        "w-10 h-10 rounded text-xl font-header shadow-sm transition-all",
                        filter.defaults.antes.includes(ante)
                            ? 'bg-[var(--balatro-blue)] text-white shadow-[0_2px_0_black] translate-y-0'
                            : 'bg-[var(--balatro-modal-inner)] text-[var(--balatro-text-dark)] hover:brightness-110'
                    )}
                >
                    {ante}
                </button>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-[1400px] mx-auto p-4 h-[calc(100vh-80px)] overflow-hidden flex flex-col gap-4">

            {/* MODAL EDITOR */}
            {editingClause && (
                <ClauseEditor
                    bucket={editingClause.bucket}
                    clause={editingClause.index !== null ? filter[editingClause.bucket][editingClause.index] : null}
                    onSave={handleSaveClause}
                    onClose={() => setEditingClause(null)}
                />
            )}

            {/* 1. TOP ROW: Editor & Metadata */}
            <div className="grid grid-cols-[1fr_350px] gap-6 h-full">

                {/* LEFT COLUMN: The Builder */}
                <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">

                    {/* HEADER PANEL (Red) */}
                    <div className="balatro-panel border-[var(--balatro-red)]">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-[var(--balatro-gold)] text-3xl font-header uppercase mb-1 drop-shadow-md">
                                    JAML Builder
                                </h2>
                                <p className="text-[var(--balatro-text-light)] text-sm font-pixel opacity-70">
                                    Filter Configuration Setup
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="balatro-button balatro-button-gold !py-2 !px-6 text-lg flex items-center gap-2"
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                >
                                    {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                                    {isSearching ? 'SEARCHING...' : 'SEARCH'}
                                </button>
                                {isSearching && (
                                    <button
                                        className="balatro-button balatro-button-orange !py-2 !px-4 text-lg flex items-center gap-2"
                                        onClick={handleStopSearch}
                                    >
                                        <Square size={16} />
                                        STOP
                                    </button>
                                )}
                                <button className="balatro-button balatro-button-red !py-2 !px-4 text-lg" onClick={() => window.location.reload()}>
                                    RESET
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 bg-[var(--balatro-black)] p-4 rounded-lg border border-[var(--balatro-outline-dark)]/20">
                            <div>
                                <label htmlFor="filter-name" className="block text-[var(--balatro-blue)] font-header mb-1 text-lg">FILTER NAME</label>
                                <input
                                    id="filter-name"
                                    className="balatro-input w-full"
                                    value={filter.name}
                                    placeholder="Enter filter name..."
                                    onChange={e => updateFilter({ name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label htmlFor="deck-type" className="block text-[var(--balatro-blue)] font-header mb-1 text-lg">DECK TYPE</label>
                                <select
                                    id="deck-type"
                                    className="balatro-input w-full cursor-pointer"
                                    value={filter.deck}
                                    onChange={e => updateFilter({ deck: e.target.value })}
                                >
                                    {DECK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="stake-select" className="block text-[var(--balatro-blue)] font-header mb-1 text-lg">STAKE</label>
                                <select
                                    id="stake-select"
                                    className="balatro-input w-full cursor-pointer"
                                    value={filter.stake}
                                    onChange={e => updateFilter({ stake: e.target.value })}
                                >
                                    {STAKE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-[var(--balatro-light-black)] rounded-lg">
                            <label className="block text-[var(--balatro-gold)] font-header mb-2 text-lg">TARGET ANTES</label>
                            {renderAnteSelector()}
                        </div>
                    </div>

                    {/* CLAUSES GRID */}
                    <div className="grid grid-cols-1 gap-4">
                        {renderClauseList('must', 'must')}
                        {renderClauseList('should', 'should')}
                        {renderClauseList('mustNot', 'mustNot')}
                    </div>

                    {/* SEARCH RESULTS */}
                    {(searchResults.length > 0 || searchError || isSearching) && (
                        <div className="balatro-panel border-[var(--balatro-gold)] mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-[var(--balatro-gold)] text-2xl font-header drop-shadow-md">
                                    Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                                </h3>
                                {isSearching && (
                                    <div className="flex items-center gap-2 text-[var(--balatro-blue)] font-pixel text-sm">
                                        <Loader2 size={16} className="animate-spin" />
                                        Searching...
                                    </div>
                                )}
                            </div>

                            {searchError && (
                                <div className="bg-[var(--balatro-red)] text-white p-3 rounded-lg font-pixel text-sm mb-4">
                                    {searchError}
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar p-1">
                                    {searchResults.map((result) => (
                                        <AgnosticSeedCard
                                            key={result.seed}
                                            result={result}
                                            deckSlug={filter.deck.toLowerCase().split(' ')[0]}
                                            stakeSlug={filter.stake.toLowerCase().split(' ')[0]}
                                        />
                                    ))}
                                </div>
                            )}

                            {!isSearching && searchResults.length === 0 && !searchError && (
                                <div className="text-center font-pixel text-sm text-white/50 py-12 bg-black/20 rounded-lg border border-white/5">
                                    No results yet. Click SEARCH to find the perfect seed.
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* RIGHT COLUMN: Genie & Preview */}
                <div className="flex flex-col gap-4 h-full">
                    {/* SNIPPETS LIBRARY */}
                    <div className="balatro-panel border-[var(--balatro-blue)] flex flex-col max-h-[220px]">
                        <h3 className="text-[var(--balatro-blue)] text-xl font-header uppercase mb-3 drop-shadow-md">
                            Snippets
                        </h3>
                        <div className="grid grid-cols-1 gap-2 overflow-y-auto custom-scrollbar pr-1">
                            {[
                                { name: 'The Soul Hunter', jaml: 'must:\n  - type: Spectral\n    value: The Soul' },
                                { name: 'Invisible Synergy', jaml: 'must:\n  - type: Joker\n    value: Invisible Joker\n    antes: [1, 2, 3]' },
                                { name: 'Blueprint Search', jaml: 'should:\n  - type: Joker\n    value: Blueprint\n    score: 50' },
                                { name: 'No 7s Challenge', jaml: 'mustNot:\n  - type: PlayingCard\n    value: 7' },
                            ].map(snippet => (
                                <button
                                    key={snippet.name}
                                    onClick={() => setFromJaml(snippet.jaml)}
                                    className="bg-black/20 hover:bg-black/40 border border-white/10 rounded p-2 text-left group transition-colors"
                                >
                                    <div className="text-[var(--balatro-gold)] font-header text-sm group-hover:text-white">{snippet.name}</div>
                                    <div className="text-[10px] font-pixel text-white/40 truncate italic">{snippet.jaml.split('\n')[1]}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* JAML GENIE */}
                    <div className="h-[300px]">
                        <JamlGenie onJamlGenerated={(jaml) => setFromJaml(jaml)} />
                    </div>

                    {/* JAML TEXT PREVIEW (Green/Code) */}
                    <div className="balatro-panel border-[var(--balatro-grey)] flex-1 overflow-hidden flex flex-col bg-[#2a2a2a]">
                        <div className="flex justify-between items-center mb-2 px-1">
                            <h3 className="text-[var(--balatro-text-light)] text-xl font-header uppercase drop-shadow-md">
                                Live JAML Preview
                            </h3>
                            <button
                                onClick={() => navigator.clipboard.writeText(jamlText)}
                                className="text-xs font-pixel text-[var(--balatro-blue)] hover:underline"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                        <div className="balatro-panel-inner flex-1 p-0 overflow-hidden relative">
                            <Editor
                                height="100%"
                                defaultLanguage="yaml"
                                value={jamlText}
                                theme="balatro"
                                options={{
                                    readOnly: false,
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    fontFamily: 'var(--font-mono)',
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    renderLineHighlight: 'none',
                                    contextmenu: false,
                                    padding: { top: 16, bottom: 16 }
                                }}
                                onChange={(value) => {
                                    if (value) setFromJaml(value);
                                }}
                                beforeMount={(monaco) => {
                                    monaco.editor.defineTheme('balatro', {
                                        base: 'vs-dark',
                                        inherit: true,
                                        rules: [
                                            { token: 'key', foreground: '4BC292' }, // Green keys
                                            { token: 'string', foreground: '009dff' }, // Blue strings
                                            { token: 'number', foreground: 'eac058' }, // Gold numbers
                                            { token: 'keyword', foreground: 'FE5F55' } // Red keywords
                                        ],
                                        colors: {
                                            'editor.background': '#374244', // Balatro Black
                                            'editor.foreground': '#FFFFFF',
                                            'editor.lineHighlightBackground': '#4f636740',
                                            'editorLineNumber.foreground': '#5f7377',
                                            'editorCursor.foreground': '#009dff'
                                        }
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
