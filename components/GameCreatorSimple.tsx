"use client";

import React, { useState } from 'react';
import { useJamlFilter } from '@/lib/hooks/useJamlFilter';
import { JimboPanel, JimboInnerPanel, JimboButton, JimboTextArea } from './JimboPanel';
import { SearchResult } from '@/lib/api/motelyWasm';
import { AgnosticSeedCard } from './AgnosticSeedCard';

export function GameCreatorSimple() {
    const { jamlText, setFromJaml } = useJamlFilter();
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        setIsSearching(true);
        setError(null);
        setSearchResults([]);

        try {
            const { searchSeedsWasm, addSearchListener } = await import('@/lib/api/motelyWasm');
            
            addSearchListener((event) => {
                if (event.type === 'result') {
                    setSearchResults(prev => {
                        if (prev.some(r => r.seed === event.data.seed)) return prev;
                        return [...prev, event.data as SearchResult];
                    });
                } else if (event.type === 'complete' || event.type === 'error') {
                    setIsSearching(false);
                    if (event.type === 'error') setError(event.message || 'Unknown error');
                }
            });

            await searchSeedsWasm(jamlText);
        } catch (e: any) {
            setError(e.message || 'Search failed');
            setIsSearching(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 flex flex-col gap-6">
            <JimboPanel>
                <div className="flex flex-col gap-4">
                    <h2 className="font-header text-xl text-white uppercase text-center drop-shadow-md">
                        Game Creator
                    </h2>
                    
                    <JimboInnerPanel>
                        <JimboTextArea 
                            value={jamlText}
                            onChange={(e) => setFromJaml(e.target.value)}
                            className="w-full min-h-[300px] font-mono text-sm leading-relaxed bg-transparent border-none text-white focus:outline-none resize-y"
                            placeholder="Write your JAML here..."
                            spellCheck={false}
                        />
                    </JimboInnerPanel>

                    <JimboButton 
                        variant="gold" 
                        onClick={handleSearch} 
                        disabled={isSearching}
                        className="py-3 text-lg"
                    >
                        {isSearching ? 'SEARCHING...' : 'RUN SEARCH'}
                    </JimboButton>
                </div>
            </JimboPanel>

            {/* Results Area */}
            {searchResults.length > 0 && (
                <JimboPanel>
                    <h3 className="font-header text-lg text-white mb-4 text-center">
                        Found {searchResults.length} Seeds
                    </h3>
                    <JimboInnerPanel className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                        {searchResults.map((result) => (
                            <AgnosticSeedCard 
                                key={result.seed}
                                seed={result.seed}
                                result={result}
                            />
                        ))}
                    </JimboInnerPanel>
                </JimboPanel>
            )}

            {error && (
                <JimboPanel className="border-red-500">
                    <p className="font-pixel text-red-500 text-center uppercase tracking-widest">{error}</p>
                </JimboPanel>
            )}
        </div>
    );
}
