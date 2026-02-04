"use client";

import { useState, useEffect } from 'react';
import { AnalyzedSeed, normalizeAnalysis } from '../seedAnalyzer';


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

                // WASM ENGINE REMOVED
                console.warn("[useSeedAnalyzer] WASM Engine has been removed.");
                throw new Error("WASM Engine Removed");

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
