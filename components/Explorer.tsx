"use client";

import { useState, useMemo, useEffect } from "react";
import { SeedData } from "@/lib/types";
import { SeedCard } from "./SeedCard";
import { FilterBar } from "./FilterBar";
import { DailyWee } from "./DailyWee";
import { SeedAnalysisOverlay } from "./SeedAnalysisOverlay";
import { SeedScatterPlot } from "./SeedScatterPlot";

interface ExplorerProps {
    initialSeeds: SeedData[];
}

export default function Explorer({ initialSeeds }: ExplorerProps) {
    // Remove DuckDB - it's overkill for 55KB and causing hangs
    const [seeds, setSeeds] = useState<SeedData[]>(initialSeeds);
    const [filteredSeeds, setFilteredSeeds] = useState<SeedData[]>(initialSeeds);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("default");
    const [selectedSeed, setSelectedSeed] = useState<SeedData | null>(null);
    const [loading, setLoading] = useState(true);

    // Data loading
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/seeds.csv');
                if (!response.ok) throw new Error("Failed to fetch csv");
                const csvText = await response.text();

                const lines = csvText.split('\n').filter(l => l.trim().length > 0);
                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

                const parsedData: SeedData[] = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const obj: any = {};
                    headers.forEach((h, i) => {
                        const val = values[i];
                        obj[h] = isNaN(Number(val)) ? val : Number(val);
                    });
                    return obj as SeedData;
                });

                setSeeds(parsedData);
                setFilteredSeeds(parsedData);
                setLoading(false);
                console.log("Loaded seeds:", parsedData.length);
            } catch (e) {
                console.error("CSV Load Error:", e);
                setLoading(false); // Fail gracefully
            }
        };
        loadData();
    }, []);

    // client-side filter/sort
    useEffect(() => {
        let result = [...seeds];

        if (search) {
            const q = search.toUpperCase();
            result = result.filter(s => s.seed.includes(q));
        }

        switch (sort) {
            case "wee_desc": result.sort((a, b) => ((b.WeeJoker_Ante1 as number) || 0) - ((a.WeeJoker_Ante1 as number) || 0) || (b.score || 0) - (a.score || 0)); break;
            case "hack_desc": result.sort((a, b) => ((b.Hack_Ante1 as number) || 0) - ((a.Hack_Ante1 as number) || 0) || (b.score || 0) - (a.score || 0)); break;
            case "hearts_desc": result.sort((a, b) => ((b.twos as number) || 0) - ((a.twos as number) || 0) || (b.score || 0) - (a.score || 0)); break; // Mapped to twos
            case "spades_desc": result.sort((a, b) => (b.score || 0) - (a.score || 0)); break;
            default: result.sort((a, b) => (b.score || 0) - (a.score || 0));
        }

        setFilteredSeeds(result.slice(0, 50)); // Limit for display
    }, [seeds, search, sort]);

    // Daily seed logic (deterministic for demo purposes, pick the one with most 2s)
    // We can compute this from local data for now to avoid async daily flicker
    const dailySeed = useMemo(() => {
        if (seeds.length > 0) {
            // Just fallback to first sorted by default or similar
            return initialSeeds.reduce((prev, current) => {
                return (prev.score || 0) > (current.score || 0) ? prev : current;
            });
        }
        return initialSeeds[0];
    }, [initialSeeds, seeds]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="bg-black/30 p-6 rounded-xl border border-white/10 mb-8">
                <h3 className="text-2xl font-header text-white mb-2">Seed Archive</h3>
                <p className="font-pixel text-zinc-400 text-sm">Search the full history of Wee Joker seeds.</p>
            </div>

            <FilterBar onSearch={setSearch} onSortChange={setSort} />

            <div className="flex justify-end mb-2">
                <span className="text-xs font-pixel text-zinc-500 uppercase">
                    {loading ? "Loading Data..." : "Loaded from CSV"}
                </span>
            </div>

            {/* VISUALIZATION SECTION */}
            <div className="mb-8">
                <SeedScatterPlot data={seeds} />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSeeds.map((seed, i) => (
                    <SeedCard
                        key={seed.seed + i}
                        seed={seed}
                        dayNumber={0}
                        onAnalyze={() => setSelectedSeed(seed)}
                    />
                ))}

                {filteredSeeds.length === 0 && (
                    <div className="col-span-full py-20 text-center text-zinc-500">
                        {loading ? "Loading seeds..." : "No seeds found matching your criteria."}
                    </div>
                )}
            </div>

            {
                selectedSeed && (
                    <SeedAnalysisOverlay
                        seed={selectedSeed}
                        onClose={() => setSelectedSeed(null)}
                    />
                )
            }

            {/* External CTA */}
            <div className="mt-16 mb-8 text-center">
                <a
                    href="https://weejoker.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transform hover:scale-105 active:scale-95 transition-transform duration-150"
                >
                    <div className="balatro-btn text-xl md:text-2xl px-8 py-4 bg-balatro-blue hover:bg-balatro-blue-dark border-balatro-blue-dark shadow-lg">
                        Visit WeeJoker.app
                    </div>
                </a>
                <p className="mt-4 text-balatro-silver-light font-pixel text-sm opacity-60">
                    Find your next broken run.
                </p>
            </div>
        </div >
    );
}
