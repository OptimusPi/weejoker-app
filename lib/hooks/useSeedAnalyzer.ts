"use client";

import { useState, useEffect } from 'react';
import { AnalyzedSeed, normalizeAnalysis } from '../seedAnalyzer';
import { analyzeSeedWasm } from '../api/motelyWasm';


export function useSeedAnalyzer(seed: string | null) {
    const [data, setData] = useState<AnalyzedSeed | null | undefined>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!seed || seed === "LOCKED") {
            setData(null);
            return;
        }

        const runAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                // Yield to main thread
                await new Promise(resolve => setTimeout(resolve, 10));

                console.log(`[useSeedAnalyzer] Analyzing ${seed} via WASM...`);
                const rawResult = await analyzeSeedWasm(seed, "erratic", "white", 1, 8);

                if (rawResult) {
                    const normalized = normalizeAnalysis(rawResult);
                    setData(normalized);
                } else {
                    throw new Error("No analysis result returned");
                }
            } catch (err) {
                console.error("[useSeedAnalyzer] Analysis error:", err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        runAnalysis();
    }, [seed]);

    return { data, loading, error };
}

