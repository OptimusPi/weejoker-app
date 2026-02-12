"use client";

import { useState, useEffect, useCallback } from 'react';
import { useIceLakeScanner } from '@/lib/hooks/ice-lake/useIceLakeScanner';
import { Search, Database, Loader2, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// R2 Bucket Base URL
const BUCKET_URL = "https://r2.weejoker.app/parquet_lake";

const RANKS = ['2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Jacks', 'Queens', 'Kings', 'Aces'];
const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

export function SeedExplorer() {
    const { scanIceLake, isDbLoading } = useIceLakeScanner();
    
    const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
    const [selectedSuits, setSelectedSuits] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [results, setResults] = useState<{seed: string, score: number}[]>([]);
    const [scannedCount, setScannedCount] = useState(0);

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleFibonacci = () => {
        setSelectedRanks(['Aces', '2s', '3s', '5s', '8s']);
        setSelectedSuits([]);
    };

    const handleScan = async () => {
        if (selectedRanks.length === 0 && selectedSuits.length === 0) return;
        
        setIsScanning(true);
        setResults([]);
        setScannedCount(0);

        // Construct partition paths
        const partitions = [
            ...selectedRanks.map(r => `ranks/${r}`),
            ...selectedSuits.map(s => `suits/${s}`)
        ];

        try {
            // Example Filter: Just find valid seeds (Motley will run analysis)
            // In a real app, we'd pass a complex JAML filter here
            const filter: any = {
                name: 'Deep Scan',
                description: 'Ice Lake Scan',
                author: 'WeeJoker',
                defaults: { deck: 'Erratic', stake: 'White' },
                deck: 'Erratic',
                stake: 'White',
                must: [],
                should: [],
                mustNot: []
            };

            await scanIceLake(
                partitions, 
                BUCKET_URL, 
                filter, 
                (seed, score) => {
                    setResults(prev => [...prev, { seed, score }].slice(0, 100)); // Limit display
                    setScannedCount(c => c + 1);
                },
                50 // Batch size
            );
        } catch (e) {
            console.error("Scan failed", e);
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-black/40 rounded-xl border border-white/10 font-pixel">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                <h2 className="text-xl md:text-2xl font-header flex items-center gap-2 text-white">
                    <Database className="text-[var(--balatro-blue)]" size={24} />
                    Deep Scanner
                </h2>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/80 bg-black/40 px-3 py-1.5 rounded self-start md:self-auto border border-white/10">
                    <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-white/40'}`} />
                    {isScanning ? 'Scanning...' : 'Ready'}
                </div>
            </div>

            {/* Selection Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs uppercase text-white/60 tracking-wider">Ranks</label>
                        <button onClick={handleFibonacci} className="text-[10px] uppercase text-[var(--balatro-gold)] hover:underline tracking-wider font-bold">
                            Select Fibonacci
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {RANKS.map(rank => (
                            <button
                                key={rank}
                                onClick={() => toggleSelection(rank, selectedRanks, setSelectedRanks)}
                                className={cn(
                                    "px-3 py-1.5 rounded text-xs transition-all border shadow-sm",
                                    selectedRanks.includes(rank)
                                        ? "bg-[var(--balatro-blue)] border-[var(--balatro-blue)] text-white shadow-[0_2px_0_rgba(0,0,0,0.3)] transform translate-y-[-1px]"
                                        : "bg-black/40 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                )}
                            >
                                {rank}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                    <label className="text-xs uppercase text-white/60 block mb-3 tracking-wider">Suits</label>
                    <div className="flex flex-wrap gap-2">
                        {SUITS.map(suit => (
                            <button
                                key={suit}
                                onClick={() => toggleSelection(suit, selectedSuits, setSelectedSuits)}
                                className={cn(
                                    "px-3 py-1.5 rounded text-xs transition-all border shadow-sm",
                                    selectedSuits.includes(suit)
                                        ? "bg-[var(--balatro-red)] border-[var(--balatro-red)] text-white shadow-[0_2px_0_rgba(0,0,0,0.3)] transform translate-y-[-1px]"
                                        : "bg-black/40 border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                                )}
                            >
                                {suit}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-4 gap-4 p-4 bg-[var(--balatro-black)] rounded-lg border border-white/10 shadow-inner">
                <div className="text-sm text-white/80 text-center md:text-left">
                    Selected: <span className="text-white font-bold">{selectedRanks.length + selectedSuits.length}</span> partitions
                </div>
                
                <button 
                    onClick={handleScan}
                    disabled={isScanning || (selectedRanks.length === 0 && selectedSuits.length === 0)}
                    className={cn(
                        "balatro-button flex items-center justify-center gap-2 px-6 py-4 transition-all w-full md:w-auto text-base tracking-widest uppercase shadow-[0_4px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-[4px]",
                        isScanning ? "opacity-50 cursor-wait bg-gray-600 shadow-none translate-y-[4px]" : "balatro-button-green hover:brightness-110"
                    )}
                >
                    {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                    {isScanning ? 'Scanning...' : 'Start Deep Scan'}
                </button>
            </div>

            {/* Results Stream */}
            <div className="space-y-1 max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar bg-black/20 rounded-lg p-1 border border-white/5">
                <div className="grid grid-cols-3 text-[10px] md:text-xs uppercase text-white/40 px-3 mb-2 sticky top-0 bg-[#1a1a1a] py-2 z-10 shadow-sm rounded-t border-b border-white/5 tracking-wider">
                    <span>Seed</span>
                    <span className="text-center">Score</span>
                    <span className="text-right">Status</span>
                </div>
                
                {results.map((res, i) => (
                    <div key={i} className="grid grid-cols-3 items-center p-2 mx-1 bg-white/5 hover:bg-white/10 rounded font-mono text-xs md:text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 border border-transparent hover:border-white/10 transition-colors">
                        <span className="text-[var(--balatro-blue)] font-bold truncate tracking-wide">{res.seed}</span>
                        <span className="text-center text-white/80">{res.score}</span>
                        <div className="text-right flex items-center justify-end gap-1.5 text-green-400">
                            <CheckCircle2 size={14} />
                            <span className="hidden sm:inline text-[10px] uppercase tracking-wide">Verified</span>
                        </div>
                    </div>
                ))}
                
                {results.length === 0 && !isScanning && (
                    <div className="text-center text-white/30 py-12 flex flex-col items-center justify-center gap-2">
                        <Search size={32} className="opacity-20 mb-2" />
                        <div className="text-sm">Ready to scan</div>
                        <div className="text-[10px] opacity-60">Select partitions above to begin</div>
                    </div>
                )}
            </div>
            
            {scannedCount > 0 && (
                <div className="mt-3 text-center text-[10px] text-white/40 uppercase tracking-widest font-mono">
                    Scanned {scannedCount.toLocaleString()} seeds
                </div>
            )}
        </div>
    );
}
