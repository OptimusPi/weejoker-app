"use client";

import { useState, useEffect } from 'react';
import { AnalyzedSeed, normalizeAnalysis } from '../seedAnalyzer';
import { analyzeSeedWasm } from '../api/motelyWasm';


export function useSeedAnalyzer(seed: string | null, deck: string = 'Erratic', stake: string = 'White') {
    const [data, setData] = useState<AnalyzedSeed | null | undefined>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!seed || seed === "LOCKED") {
            setData(null);
            return;
        }

        const abortController = new AbortController();
        const runAnalysis = async () => {
            setLoading(true);
            setError(null);
            try {
                const rawResult = await analyzeSeedWasm(seed, deck, stake);
                if (abortController.signal.aborted) return;

                if (rawResult) {
                    const normalized = normalizeAnalysis(rawResult);
                    setData(normalized);
                } else {
                    throw new Error("No analysis result returned");
                }
            } catch (err) {
                if (abortController.signal.aborted) return;
                console.error("[useSeedAnalyzer] Analysis error:", err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                if (!abortController.signal.aborted) setLoading(false);
            }
        };

        runAnalysis();
        return () => abortController.abort();
    }, [seed, deck, stake]);

    return { data, loading, error };
}

