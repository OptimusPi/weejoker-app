'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { initDuckDB } from '@/lib/duckdb';

interface DuckDBContextType {
    db: duckdb.AsyncDuckDB | null;
    conn: duckdb.AsyncDuckDBConnection | null;
    loading: boolean;
    error: Error | null;
}

const DuckDBContext = createContext<DuckDBContextType>({
    db: null,
    conn: null,
    loading: true,
    error: null,
});

export function useDuckDB() {
    return useContext(DuckDBContext);
}

export function DuckDBProvider({ children }: { children: React.ReactNode }) {
    const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
    const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function setup() {
            try {
                const database = await initDuckDB();
                const connection = await database.connect();

                if (isMounted) {
                    setDb(database);
                    setConn(connection);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to initialize DuckDB:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                    setLoading(false);
                }
            }
        }

        setup();

        return () => {
            isMounted = false;
            // Cleanup provided by Next.js/React lifecycle automatically usually, 
            // but we could close connection here if needed.
            if (conn) {
                conn.close().catch(console.error);
            }
            if (db) {
                db.terminate().catch(console.error);
            }
        };
    }, []);

    return (
        <DuckDBContext.Provider value={{ db, conn, loading, error }}>
            {children}
        </DuckDBContext.Provider>
    );
}
