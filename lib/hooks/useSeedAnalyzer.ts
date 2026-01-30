"use client";

import { useState, useEffect } from 'react';
import { analyzeSeed, AnalyzedSeed } from '../seedAnalyzer';

export function useSeedAnalyzer(seed: string | null) {
    const [data, setData] = useState<AnalyzedSeed | null | undefined>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!seed) {
            setData(null);
            return;
        }

        const runAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                // Yield to main thread to allow UI to show loading state
                await new Promise(resolve => setTimeout(resolve, 10));

                const result = analyzeSeed(seed, "erratic", "white", 8);
                setData(result);
            } catch (err) {
                console.error("Analysis failed:", err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        };

        runAnalysis();
    }, [seed]);

    return { data, loading, error };
}
