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
            const filter = {
                deck: 'Erratic',
                stake: 'White',
                // This is a "pass-all" filter effectively, relying on the partition selection
                // But we could add "requirements" here like "has_rare_joker"
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
        <div className="p-6 bg-black/40 rounded-xl border border-white/10 font-pixel">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-header flex items-center gap-2 text-white">
                    <Database className="text-[var(--balatro-blue)]" />
                    Ice Lake Deep Scanner
                </h2>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/60">
                    <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                    {isScanning ? 'Scanning Ice Lake...' : 'Ready'}
                </div>
            </div>

            {/* Selection Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs uppercase text-white/40">Ranks</label>
                        <button onClick={handleFibonacci} className="text-[10px] uppercase text-[var(--balatro-gold)] hover:underline">
                            Select Fibonacci
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {RANKS.map(rank => (
                            <button
                                key={rank}
                                onClick={() => toggleSelection(rank, selectedRanks, setSelectedRanks)}
                                className={cn(
                                    "px-3 py-1 rounded text-xs transition-all border",
                                    selectedRanks.includes(rank)
                                        ? "bg-[var(--balatro-blue)] border-[var(--balatro-blue)] text-white"
                                        : "bg-black/40 border-white/10 text-white/40 hover:border-white/30"
                                )}
                            >
                                {rank}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                    <label className="text-xs uppercase text-white/40 block mb-3">Suits</label>
                    <div className="flex flex-wrap gap-2">
                        {SUITS.map(suit => (
                            <button
                                key={suit}
                                onClick={() => toggleSelection(suit, selectedSuits, setSelectedSuits)}
                                className={cn(
                                    "px-3 py-1 rounded text-xs transition-all border",
                                    selectedSuits.includes(suit)
                                        ? "bg-[var(--balatro-red)] border-[var(--balatro-red)] text-white"
                                        : "bg-black/40 border-white/10 text-white/40 hover:border-white/30"
                                )}
                            >
                                {suit}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-[var(--balatro-black)] rounded-lg border border-white/10">
                <div className="text-sm text-white/60">
                    Selected: <span className="text-white">{selectedRanks.length + selectedSuits.length}</span> partitions
                </div>
                
                <button 
                    onClick={handleScan}
                    disabled={isScanning || (selectedRanks.length === 0 && selectedSuits.length === 0)}
                    className={cn(
                        "balatro-button flex items-center gap-2 px-8 py-3 transition-all",
                        isScanning ? "opacity-50 cursor-wait" : "balatro-button-green hover:scale-105"
                    )}
                >
                    {isScanning ? <Loader2 className="animate-spin" /> : <Play size={18} fill="currentColor" />}
                    {isScanning ? 'Scanning...' : 'Start Deep Scan'}
                </button>
            </div>

            {/* Results Stream */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 text-xs uppercase text-white/40 px-2 mb-2 sticky top-0 bg-[#2C2C2C] py-2 z-10">
                    <span>Seed</span>
                    <span className="text-center">Motley Score</span>
                    <span className="text-right">Status</span>
                </div>
                
                {results.map((res, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded font-mono text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <span className="text-[var(--balatro-blue)] font-bold">{res.seed}</span>
                        <span className="text-center text-white/60">{res.score}</span>
                        <span className="text-right flex items-center justify-end gap-2 text-green-400">
                            <CheckCircle2 size={14} />
                            Verified
                        </span>
                    </div>
                ))}
                
                {results.length === 0 && !isScanning && (
                    <div className="text-center text-white/20 py-12 italic border-2 border-dashed border-white/5 rounded-lg">
                        Select partitions and start scanning to find perfect seeds...
                    </div>
                )}
            </div>
            
            {scannedCount > 0 && (
                <div className="mt-4 text-center text-xs text-white/40 uppercase tracking-widest">
                    Scanned {scannedCount} seeds from Ice Lake
                </div>
            )}
        </div>
    );
}
