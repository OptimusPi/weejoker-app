"use client";

import { useState } from 'react';
import { useIceLakeScanner } from '@/lib/hooks/ice-lake/useIceLakeScanner';
import { Search, Database, Loader2, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ICELAKE_BUCKET_URL,
  buildIceLakePartitions,
  ICELAKE_PATH_STYLE,
} from '@/lib/iceLakeConfig';

const RANKS = ['2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s', 'Jacks', 'Queens', 'Kings', 'Aces'];
const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

export function SeedExplorer() {
    const { scanIceLake, isDbLoading } = useIceLakeScanner();

    const [selectedRanks, setSelectedRanks] = useState<string[]>([]);
    const [selectedSuits, setSelectedSuits] = useState<string[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [results, setResults] = useState<{ seed: string, score: number }[]>([]);
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

        const partitions = buildIceLakePartitions(selectedRanks, selectedSuits);

        try {
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
                ICELAKE_BUCKET_URL,
                filter,
                (seed, score) => {
                    setResults(prev => [...prev, { seed, score }].slice(0, 100));
                    setScannedCount(c => c + 1);
                },
                50
            );
        } catch (e) {
            console.error("Scan failed", e);
        } finally {
            setIsScanning(false);
        }
    };

    const totalSelected = selectedRanks.length + selectedSuits.length;

    return (
        <div className="jimbo-panel gap-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-header flex items-center gap-2 text-white">
                    <Database className="text-[var(--jimbo-blue)]" size={18} />
                    Deep Scanner
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-[var(--jimbo-grey)]">
                    <span className={cn(
                        "w-2 h-2 rounded-full",
                        isScanning ? "bg-[var(--jimbo-dark-green)] animate-pulse" : "bg-[var(--jimbo-grey)] opacity-50"
                    )} />
                    {isScanning ? 'Scanning...' : 'Ready'}
                </div>
            </div>

            <p className="text-[10px] text-[var(--jimbo-grey)] font-mono truncate" title={ICELAKE_BUCKET_URL}>
                Source: {ICELAKE_BUCKET_URL} · paths: {ICELAKE_PATH_STYLE}
            </p>

            {/* Rank/Suit Selection — THE key UI to preserve */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Ranks */}
                <div className="jimbo-inner-panel">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs text-white/50">Ranks</label>
                        <button
                            onClick={handleFibonacci}
                            className="text-[10px] text-[var(--jimbo-gold)] hover:underline"
                        >
                            Fibonacci
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {RANKS.map(rank => (
                            <button
                                key={rank}
                                onClick={() => toggleSelection(rank, selectedRanks, setSelectedRanks)}
                                className={cn(
                                    "px-2.5 py-1 rounded-sm text-xs border transition-all hover:bg-white/10 hover:text-white",
                                    selectedRanks.includes(rank)
                                        ? "bg-[var(--jimbo-blue)] border-[var(--jimbo-blue)] text-white shadow-xl"
                                        : "bg-[#111] border-[var(--jimbo-panel-edge)] text-[var(--jimbo-grey)]"
                                )}
                            >
                                {rank}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Suits */}
                <div className="jimbo-inner-panel">
                    <label className="text-xs text-white/50 block mb-2">Suits</label>
                    <div className="flex flex-wrap gap-1.5">
                        {SUITS.map(suit => (
                            <button
                                key={suit}
                                onClick={() => toggleSelection(suit, selectedSuits, setSelectedSuits)}
                                className={cn(
                                    "px-2.5 py-1 rounded text-xs border transition-all hover:bg-white/10 hover:text-white",
                                    selectedSuits.includes(suit)
                                        ? "bg-[var(--jimbo-red)] border-[var(--jimbo-red)] text-white shadow-[0_2px_0_rgba(0,0,0,0.3)]"
                                        : "bg-[#111] border-[var(--jimbo-panel-edge)] text-[var(--jimbo-grey)]"
                                )}
                            >
                                {suit}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scan Button */}
            <button
                onClick={handleScan}
                disabled={isScanning || totalSelected === 0}
                className={cn(
                    "jimbo-btn text-base",
                    isScanning ? "jimbo-btn-gold opacity-60" : "jimbo-btn-green"
                )}
            >
                {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                {isScanning ? `Scanning... (${scannedCount})` : `Scan ${totalSelected} Partition${totalSelected !== 1 ? 's' : ''}`}
            </button>

            {/* Results */}
            <div className="jimbo-inner-panel flex-1 min-h-[120px] max-h-[250px] overflow-y-auto">
                <div className="results-header-bg grid grid-cols-3 text-[10px] text-white/40 px-2 mb-2 sticky top-0 py-1 z-10"
                >
                    <span>Seed</span>
                    <span className="text-center">Score</span>
                    <span className="text-right">Status</span>
                </div>

                {results.map((res, i) => (
                    <div key={i} className="grid grid-cols-3 items-center p-1.5 mx-1 rounded font-mono text-xs hover:bg-white/5 transition-colors">
                        <span className="text-[var(--jimbo-blue)] truncate">{res.seed}</span>
                        <span className="text-center text-white/70">{res.score}</span>
                        <div className="text-right flex items-center justify-end gap-1 text-[var(--jimbo-green)]">
                            <CheckCircle2 size={12} />
                        </div>
                    </div>
                ))}

                {results.length === 0 && !isScanning && (
                    <div className="text-center text-white/20 py-8 flex flex-col items-center gap-1">
                        <Search size={24} className="opacity-30" />
                        <span className="text-xs">Select partitions above to scan</span>
                    </div>
                )}
            </div>

            {scannedCount > 0 && (
                <div className="text-center text-[10px] text-white/30 font-mono">
                    {scannedCount.toLocaleString()} seeds scanned
                </div>
            )}
        </div>
    );
}
