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

                let rawResult = null;

                // 1. Try WASM (Canonical Engine)
                try {
                    console.log(`[useSeedAnalyzer] Analyzing ${seed} via WASM...`);
                    rawResult = await analyzeSeedWasm(seed, "erratic", "white", 1, 8);
                } catch (wasmError) {
                    console.error("[useSeedAnalyzer] WASM Analysis failed:", wasmError);
                    throw wasmError; // Stop here, don't fallback to broken API
                }

                if (rawResult) {
                    const normalized = normalizeAnalysis(rawResult);
                    setData(normalized);
                } else {
                    throw new Error("Could not analyze seed with any available engine.");
                }
            } catch (err) {
                console.error("[useSeedAnalyzer] Final analysis error:", err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        runAnalysis();
    }, [seed]);

    return { data, loading, error };
}
