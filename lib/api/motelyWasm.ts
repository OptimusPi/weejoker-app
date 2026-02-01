import type { MotelyWasmApi, AlgorithmSearchProgress, SearchHit } from 'motely-wasm';

/**
 * Motely WASM Bridge
 * Interfaces with the .NET WebAssembly build of the Motely seed analyzer.
 * Now powered by the 'motely-wasm' npm package!
 */

let wasmExports: MotelyWasmApi | null = null;
let initializationPromise: Promise<MotelyWasmApi> | null = null;

// Event types for the search
export type SearchEvent =
    | { type: 'progress', data: any }
    | { type: 'result', data: SearchHit }
    | { type: 'complete', data: any }
    | { type: 'error', message: string };

type SearchListener = (event: SearchEvent) => void;
const listeners = new Set<SearchListener>();

/**
 * Initializes the JS-to-WASM callback bridge.
 * This must be called before SearchSeeds is used.
 */
function initWasmCallbacks() {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    globalThis.MotelyWasmOnProgress = (progressJson: string) => {
        try {
            const data = JSON.parse(progressJson);
            // console.log("WASM Progress:", data);
            listeners.forEach(l => l({ type: 'progress', data }));
        } catch (e) {
            console.error("Progress JSON parse error:", e);
        }
    };

    // Batching for results to prevent UI flooding (Minimize JS Interop Overhead)
    let resultBatch: any[] = [];
    let batchTimeout: any = null;

    // @ts-ignore
    globalThis.MotelyWasmOnResult = (seed: string, score: number, talliesStr: string) => {
        const tallies = talliesStr ? talliesStr.split(',').map(Number) : [];
        resultBatch.push({ seed, score, tallies });

        if (resultBatch.length >= 50) {
            flushBatch();
        } else if (!batchTimeout) {
            batchTimeout = setTimeout(flushBatch, 100);
        }
    };

    const flushBatch = () => {
        if (resultBatch.length === 0) return;
        const batch = [...resultBatch];
        resultBatch = [];
        if (batchTimeout) clearTimeout(batchTimeout);
        batchTimeout = null;

        // Emit as a single 'batch-result' or individual events?
        // For compatibility, we'll emit individual events but in a quick loop, 
        // OR better, update the listener to handle batches. 
        // For now, let's keep it simple: emit them all in one JS Event Loop tick.
        batch.forEach(data => {
            listeners.forEach(l => l({ type: 'result', data }));
        });
    };

    // @ts-ignore
    globalThis.MotelyWasmOnComplete = (resultJson: string) => {
        try {
            const data = JSON.parse(resultJson);
            listeners.forEach(l => l({ type: 'complete', data }));
        } catch (e) {
            console.error("Complete JSON parse error:", e);
        }
    };
}

/**
 * Initializes the .NET WASM runtime using the npm package loader.
 * We point it to the public folder where we must serve the assets.
 */
export async function initMotelyWasm() {
    if (typeof window === 'undefined') return null;
    if (wasmExports) return wasmExports;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
        try {
            // console.log("🚀 Initializing Motely SIMD WASM (Custom Loader)...");
            initWasmCallbacks();

            const origin = window.location.origin;
            const dotnetPath = `${origin}/motely-wasm/_framework/dotnet.js`;

            // console.log(`📡 Loading dotnet runtime from: ${dotnetPath}`);
            // CRITICAL: webpackIgnore tells Next.js/Webpack not to try bundling this dynamic path
            const { dotnet } = await import(/* webpackIgnore: true */ /* @vite-ignore */ dotnetPath);

            const { getAssemblyExports, getConfig } = await dotnet
                .withConfigSrc(`${origin}/motely-wasm/_framework/dotnet.boot.js`)
                .create();

            const exports = await getAssemblyExports(getConfig().mainAssemblyName);
            wasmExports = exports.Motely.WASM.MotelyWasm;

            // console.log("✅ Motely WASM Ready.");
            return wasmExports;
        } catch (error: any) {
            console.error("❌ Failed to initialize Motely WASM:", error);
            initializationPromise = null;
            throw new Error(`WASM Init Failed: ${error.message || 'Unknown error'}`);
        }
    })();

    return initializationPromise;
}

/**
 * Analyzes a seed using the Motely SIMD WASM engine.
 */
export async function analyzeSeedWasm(
    seed: string,
    deck = 'Red',
    stake = 'White',
    minAnte = 1,
    maxAnte = 8,
    options = '{}'
) {
    const api = await initMotelyWasm();
    if (!api) throw new Error("WASM API not initialized");

    const json = await api.AnalyzeSeed(seed, deck, stake, minAnte, maxAnte, options);
    return JSON.parse(json);
}

/**
 * Searches for seeds using the JAML engine in WASM.
 * This returns as soon as the search STARTS. Results come via listeners.
 */
export async function searchSeedsWasm(
    jamlFilter: string,
    maxResults: number,
    seedList: string,
    threadCount?: number
) {
    const api = await initMotelyWasm();
    if (!api) throw new Error("WASM API not initialized");

    // Use navigator.hardwareConcurrency if threadCount not provided, 
    // but default to 1 if cross-origin headers are missing (SharedArrayBuffer forbidden)
    const isIsolated = typeof crossOriginIsolated !== 'undefined' ? crossOriginIsolated : false;

    // FORCE 1 thread if not isolated. SharedArrayBuffer will crash otherwise.
    const threads = threadCount || (typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4);
    const safeThreads = isIsolated ? threads : 1;

    if (!isIsolated && threads > 1) {
        console.warn("⚠️ crossOriginIsolated is FALSE. Forcing single-threaded WASM to prevent SharedArrayBuffer crash.");
    }

    // console.log(`🚀 Starting WASM Search. Threads: ${safeThreads}${!isIsolated ? ' (Fallback to 1 due to Insecure Context)' : ''}, MaxResults: ${maxResults}`);

    // @ts-ignore - Some browser builds of dotnet return Task, some return the value directly
    const searchTask = api.SearchSeeds(jamlFilter, seedList || null, safeThreads, maxResults);

    // Check if it's a promise/thenable
    if (searchTask && typeof searchTask.then === 'function') {
        searchTask
            .then((resultJson: string) => {
                // console.log("✅ WASM Search Task Completed (returned to engine)");
                try {
                    const summary = JSON.parse(resultJson);
                    if (summary.Error) {
                        listeners.forEach(l => l({ type: 'error', message: summary.Error }));
                    }
                } catch (e) { }
            })
            .catch((err: any) => {
                console.error("❌ WASM Search Task Crashed:", err);
                listeners.forEach(l => l({ type: 'error', message: err.message || String(err) }));
            });
    } else {
        // Direct value return
        // console.log("✅ WASM Search Started synchronously (or returned immediate handle)");
    }

    return { started: true };
}

/**
 * Subscribes to WASM search events.
 */
export function addSearchListener(listener: SearchListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Validates a JAML filter string.
 */
export async function validateJamlWasm(jamlString: string) {
    const api = await initMotelyWasm();
    if (!api) throw new Error("WASM API not initialized");

    const json = await api.ValidateJaml(jamlString);
    return JSON.parse(json);
}

export function isSearchRunning() {
    if (!wasmExports) return false;
    return wasmExports.IsSearchRunning();
}

export function cancelSearch() {
    if (!wasmExports) return;
    wasmExports.CancelSearch();
}

export function getSearchProgress() {
    if (!wasmExports) return 0;
    return wasmExports.GetSearchProgress();
}


