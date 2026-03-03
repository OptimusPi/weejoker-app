import * as duckdb from '@duckdb/duckdb-wasm';

// Initialize DuckDB
export async function initDuckDB() {
    // Select bundle based on browser feature detection (lazy — safe in SSR)
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], { type: 'text/javascript' })
    );

    // Instantiate the asynchronous version of DuckDB-Wasm
    const worker = new Worker(worker_url);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainWorker!, bundle.pthreadWorker);
    URL.revokeObjectURL(worker_url);

    return db;
}
