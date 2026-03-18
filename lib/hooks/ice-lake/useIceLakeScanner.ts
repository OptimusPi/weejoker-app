import { useCallback } from 'react';
import { evaluateSeed } from '@/lib/jaml/jamlEvaluator';
import { analyzeSeedWasm } from '@/lib/motelyWasm';
import { useIceLake } from './useIceLake';
import { JamlFilter } from '../useJamlFilter';
import { normalizeAnalysis } from '@/lib/seedAnalyzer';

export function useIceLakeScanner() {
    const { query, connectToPartitions, isLoading: isDbLoading } = useIceLake();

    /**
     * Stream seeds from Ice Lake -> Motely WASM -> Result
     * 
     * @param partitions List of partitions to scan (e.g. ["ranks/2s", "ranks/3s"])
     * @param bucketUrl Base R2 URL
     * @param filter JAML Filter to evaluate against
     * @param onResult Callback for each matching seed
     * @param batchSize Number of seeds to fetch from DB at once
     */
    const scanIceLake = useCallback(async (
        partitions: string[],
        bucketUrl: string,
        filter: JamlFilter,
        onResult: (seed: string, score: number) => void,
        batchSize = 100
    ) => {
        // 1. Connect to partitions (creates 'active_partition' view)
        await connectToPartitions(partitions, bucketUrl);

        // 2. Fetch seeds in batches
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            // Fetch batch
            const sql = `SELECT seed FROM active_partition LIMIT ${batchSize} OFFSET ${offset}`;
            const rows = await query(sql);

            if (rows.length === 0) {
                hasMore = false;
                break;
            }

            // 3. Process batch in parallel
            const promises = rows.map(async (row: any) => {
                const seed = row.seed;
                try {
                    // Analyze with Motely (C# WASM)
                    const rawAnalysis = await analyzeSeedWasm(seed, filter.deck || 'Erratic', filter.stake || 'White');
                    const analysis = normalizeAnalysis(rawAnalysis);

                    // Evaluate with JAML (TS)
                    const evaluation = evaluateSeed(analysis, filter);

                    if (evaluation.isMatch) {
                        onResult(seed, evaluation.score);
                    }
                } catch (e) {
                    console.warn(`Failed to analyze seed ${seed}`, e);
                }
            });

            await Promise.all(promises);
            offset += batchSize;

            // Optional: Yield to UI thread to prevent freezing
            await new Promise(r => setTimeout(r, 0));
        }

    }, [connectToPartitions, query]);

    return {
        scanIceLake,
        isDbLoading
    };
}
