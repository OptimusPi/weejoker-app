"use client";

import { useState, useMemo, useEffect } from "react";
import { SeedData } from "@/lib/types";
import { SeedCard } from "./SeedCard";
import { FilterBar } from "./FilterBar";
import { DailyWee } from "./DailyWee";
import { SeedAnalysisOverlay } from "./SeedAnalysisOverlay";
import { useDuckDB } from "@/components/DuckDBProvider";
import { SeedScatterPlot } from "./SeedScatterPlot";

interface ExplorerProps {
    initialSeeds: SeedData[];
}

export default function Explorer({ initialSeeds }: ExplorerProps) {
    const { db, conn, loading: dbLoading } = useDuckDB();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("default");
    const [selectedSeed, setSelectedSeed] = useState<SeedData | null>(null);
    const [seeds, setSeeds] = useState<SeedData[]>(initialSeeds);
    const [isDbReady, setIsDbReady] = useState(false);

    // Initial Data Load into DuckDB
    useEffect(() => {
        if (!conn || isDbReady) return;

        const loadData = async () => {
            try {
                // 1. Try to load real data from Parquet
                // We assume the file is at /seeds.parquet in the public folder
                const parquetUrl = window.location.origin + '/seeds.parquet';

                // Check if file exists (optional, but good for fallback logic)
                const check = await fetch(parquetUrl, { method: 'HEAD' });

                if (check.ok) {
                    console.log("Found seeds.parquet, loading...");
                    await conn.query(`
                        CREATE TABLE IF NOT EXISTS seeds AS 
                        SELECT * FROM '${parquetUrl}'
                    `);
                    console.log("DuckDB: Parquet data loaded!");
                } else {
                    console.log("No seeds.parquet found, loading mock data...");
                    // 2. Fallback to Mock Data
                    await conn.query(`
                        CREATE TABLE IF NOT EXISTS seeds (
                            seed VARCHAR,
                            run_score INTEGER,
                            joker_wee INTEGER,
                            joker_hack INTEGER,
                            rank_2_count INTEGER,
                            suit_hearts INTEGER,
                            suit_diamonds INTEGER,
                            suit_clubs INTEGER,
                            suit_spades INTEGER
                        );
                    `);

                    // Clear existing
                    await conn.query('DELETE FROM seeds');

                    // Batch insert mock data
                    const stmt = await conn.prepare('INSERT INTO seeds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    for (const s of initialSeeds) {
                        await stmt.query(
                            s.seed,
                            s.run_score || 0,
                            s.joker_wee || 0,
                            s.joker_hack || 0,
                            s.rank_2_count || 0,
                            s.suit_hearts || 0,
                            s.suit_diamonds || 0,
                            s.suit_clubs || 0,
                            s.suit_spades || 0
                        );
                    }
                    await stmt.close();
                }

                setIsDbReady(true);
            } catch (e) {
                console.error("DuckDB load error:", e);
            }
        };

        loadData();
    }, [conn, initialSeeds, isDbReady]);

    // Query Logic
    useEffect(() => {
        if (!conn || !isDbReady) return;

        const runQuery = async () => {
            let query = "SELECT * FROM seeds";
            const params: any[] = [];

            if (search) {
                query += " WHERE seed LIKE ?";
                params.push(`%${search.toUpperCase()}%`);
            }

            switch (sort) {
                case "wee_desc": query += " ORDER BY joker_wee DESC"; break;
                case "hack_desc": query += " ORDER BY joker_hack DESC"; break;
                case "hearts_desc": query += " ORDER BY suit_hearts DESC"; break;
                case "spades_desc": query += " ORDER BY suit_spades DESC"; break;
                default: query += " ORDER BY run_score DESC";
            }

            // Limit for performance UI
            query += " LIMIT 50";

            try {
                // Construct prepared statement if using parameters (DuckDB-Wasm prepared statements are a bit manual)
                // For simplicity with this wrapper, simple concatenation for the mock is fine, 
                // but strictly we should use the prepared statement API if inputs were untrusted.
                // Since 'search' is local state, we'll use a direct query for this demo step.

                // Note: DuckDB WASM usually handles parameterized queries via prepared statements.
                // For this quick impl, I'll interpolate carefully.
                const safeSearch = search.replace(/'/g, "''").toUpperCase();
                let sql = `SELECT * FROM seeds`;
                if (search) sql += ` WHERE seed LIKE '%${safeSearch}%'`;

                switch (sort) {
                    case "wee_desc": sql += " ORDER BY joker_wee DESC"; break;
                    case "hack_desc": sql += " ORDER BY joker_hack DESC"; break;
                    case "hearts_desc": sql += " ORDER BY suit_hearts DESC"; break;
                    case "spades_desc": sql += " ORDER BY suit_spades DESC"; break;
                    default: sql += " ORDER BY run_score DESC";
                }
                sql += " LIMIT 50";

                const arrowTable = await conn.query(sql);
                const result = arrowTable.toArray().map((row: any) => row.toJSON());

                // Map back to our SeedData type (keys might be lowercased by default but DuckDB preserves case usually? check types)
                // DuckDB/Arrow toJSON usually returns object with column names.
                setSeeds(result);
            } catch (e) {
                console.error("Query failed", e);
            }
        };

        const timer = setTimeout(runQuery, 200); // Debounce
        return () => clearTimeout(timer);
    }, [conn, isDbReady, search, sort]);


    // Daily seed logic (deterministic for demo purposes, pick the one with most 2s)
    // We can compute this from local data for now to avoid async daily flicker
    const dailySeed = useMemo(() => {
        if (seeds.length > 0) {
            // Just fallback to first sorted by default or similar
            return initialSeeds.reduce((prev, current) => {
                return (prev.rank_2_count || 0) > (current.rank_2_count || 0) ? prev : current;
            });
        }
        return initialSeeds[0];
    }, [initialSeeds, seeds]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <DailyWee seed={dailySeed} />

            <FilterBar onSearch={setSearch} onSortChange={setSort} />

            <div className="flex justify-end mb-2">
                <span className="text-xs font-pixel text-zinc-500 uppercase">
                    {dbLoading ? "Initializing DB..." : isDbReady ? "Powered by DuckDB WASM" : "Loading Data..."}
                </span>
            </div>

            {/* VISUALIZATION SECTION */}
            <div className="mb-8">
                <SeedScatterPlot data={seeds} />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {seeds.map((seed) => (
                    <SeedCard
                        key={seed.seed}
                        seed={seed}
                        onAnalyze={setSelectedSeed}
                    />
                ))}

                {seeds.length === 0 && (
                    <div className="col-span-full py-20 text-center text-zinc-500">
                        {isDbReady ? "No seeds found matching your criteria." : "Loading seeds..."}
                    </div>
                )}
            </div>

            {selectedSeed && (
                <SeedAnalysisOverlay
                    seed={selectedSeed}
                    onClose={() => setSelectedSeed(null)}
                />
            )}
        </div>
    );
}
