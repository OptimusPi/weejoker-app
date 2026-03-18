import { useState, useCallback, useEffect } from 'react';
import { useDuckDB } from '@/components/DuckDBProvider';
import * as duckdb from '@duckdb/duckdb-wasm';

export interface RemoteSeedQuery {
    filter: string; // SQL WHERE clause
    limit?: number;
    orderBy?: string;
}

export interface RemoteSeedResult {
    seed: string;
    [key: string]: any;
}

function resolvePartitionSource(partition: string, bucketUrl: string) {
    const trimmed = partition.trim();
    const normalizedBucketUrl = bucketUrl.replace(/\/$/, '');

    if (/^https?:\/\//i.test(trimmed)) {
        const filename = trimmed.split('/').pop() || 'partition.parquet';
        return { url: trimmed, filename };
    }

    const normalizedPath = trimmed.replace(/^\/+/, '');
    const filename = normalizedPath.split('/').pop() || 'partition.parquet';
    const objectPath = normalizedPath.endsWith('.parquet') ? normalizedPath : `${normalizedPath}.parquet`;

    return {
        url: `${normalizedBucketUrl}/${objectPath}`,
        filename,
    };
}

/**
 * Hook to interact with the "Ice Lake" (R2 Parquet Data Lake)
 * Uses DuckDB WASM to query remote Parquet files directly via HTTP Range requests.
 */
export function useIceLake() {
    const { db, conn } = useDuckDB();
    const [currentPartition, setCurrentPartition] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectToPartitions = useCallback(async (partitions: string[], bucketUrl: string) => {
        if (!db) return;

        try {
            setIsLoading(true);
            setError(null);

            // Clean up old tables
            // Note: In a real app we might want to track registered tables to avoid collisions

            // Register each partition as a separate table or create a VIEW to union them?
            // DuckDB WASM supports querying multiple files: SELECT * FROM 'file1.parquet', 'file2.parquet'
            // So we just need to register them.

            const urls: string[] = [];

            for (const p of partitions) {
                const { url, filename } = resolvePartitionSource(p, bucketUrl);

                await db.registerFileURL(
                    filename,
                    url,
                    duckdb.DuckDBDataProtocol.HTTP,
                    false
                );
                urls.push(`'${filename}'`);
            }

            // Create a view that unions them all
            // "CREATE OR REPLACE VIEW active_view AS SELECT * FROM read_parquet([file1, file2])"
            const viewSql = `CREATE OR REPLACE VIEW active_partition AS SELECT * FROM read_parquet([${urls.join(', ')}])`;
            await conn?.query(viewSql);

            setCurrentPartition(partitions.join('+'));
            console.log(`🧊 Ice Lake: Connected to ${partitions.length} partitions`);

        } catch (err: any) {
            console.error("🧊 Ice Lake Connection Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [db, conn]);

    /**
     * Run a SQL query against the currently active partition
     */
    const query = useCallback(async (sql: string) => {
        if (!conn || !currentPartition) {
            throw new Error("No partition connected");
        }

        try {
            setIsLoading(true);
            const result = await conn.query(sql);
            return result.toArray().map((row: any) => row.toJSON());
        } catch (err: any) {
            console.error("Query Error:", err);
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [conn, currentPartition]);

    return {
        connectToPartition: (p: string, b: string) => connectToPartitions([p], b),
        connectToPartitions,
        query,
        currentPartition,
        isLoading,
        error
    };
}
