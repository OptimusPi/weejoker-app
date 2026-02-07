"use client";

/**
 * Motely WASM Bridge
 *
 * Uses the published motely-wasm npm package. Provides analyzeSeedWasm() and
 * searchSeedsWasm() for analyzer and JAML search.
 *
 * Recommended: call preloadWasm() on app mount (e.g. in ClientProviders) so
 * the first Analyze or JAML search doesn't wait on the full runtime load.
 */

import type {
    MotelyWasmApi,
    SeedAnalysisInfo,
    SearchStatusInfo,
    ValidateResult,
    VersionInfo,
    CapabilitiesInfo,
    SearchOptions,
} from 'motely-wasm';

let wasmApi: MotelyWasmApi | null = null;
let initPromise: Promise<MotelyWasmApi> | null = null;

/**
 * Initialize the WASM engine using the published npm package loader.
 * Call once; subsequent calls return the cached instance.
 */
async function initMotelyWasm(): Promise<MotelyWasmApi> {
    if (wasmApi) return wasmApi;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            // Dynamic import so Next.js doesn't try to bundle this server-side
            const { loadMotely } = await import('motely-wasm');
            // The next-plugin-motely-wasm transforms .wasm/.dat imports at copy time,
            // so static files in public/_framework are browser-safe. No API route needed.
            wasmApi = await loadMotely();

            const version = wasmApi.getVersion();
            const capabilities = wasmApi.getCapabilities();
            console.log(`[MotelyWasm] Loaded v${version.version} (${version.runtime})`);
            console.log(`[MotelyWasm] Capabilities: SIMD=${capabilities.simd}, Threads=${capabilities.threads}, Processors=${capabilities.processorCount}`);

            return wasmApi;
        } catch (error) {
            console.error("[MotelyWasm] Failed to load:", error);
            initPromise = null;
            throw error;
        }
    })();

    return initPromise;
}

/**
 * Get the WASM API, initializing if needed.
 */
export async function getWasmApi(): Promise<MotelyWasmApi> {
    return initMotelyWasm();
}

/**
 * Start loading the WASM runtime in the background (e.g. on app mount).
 * Call from a top-level client component so the first Analyze click doesn't wait on the full load.
 */
export function preloadWasm(): void {
    if (wasmApi || initPromise) return;
    initMotelyWasm().catch(() => { /* ignore; getWasmApi() will retry */ });
}

/**
 * Get version info from the WASM engine.
 */
export async function getVersion(): Promise<VersionInfo> {
    const api = await getWasmApi();
    return api.getVersion();
}

/**
 * Get capabilities info (SIMD, threading, etc).
 */
export async function getCapabilities(): Promise<CapabilitiesInfo> {
    const api = await getWasmApi();
    return api.getCapabilities();
}

/**
 * Analyze a seed using the WASM engine.
 * @param seed - Balatro seed string (e.g. "TACO1111")
 * @param deck - Deck name (e.g. "Red", "Erratic")
 * @param stake - Stake name (e.g. "White", "Gold")
 */
export async function analyzeSeedWasm(
    seed: string,
    deck: string = 'Red',
    stake: string = 'White',
): Promise<SeedAnalysisInfo> {
    const api = await getWasmApi();
    return api.analyzeSeed(seed, deck, stake);
}

/**
 * Validate JAML content using the WASM engine.
 */
export async function validateJamlWasm(jamlContent: string): Promise<ValidateResult> {
    const api = await getWasmApi();
    return api.validateJaml(jamlContent);
}

// ──────────────────────────────── Search ────────────────────────────────

let activeSearchId: string | null = null;
type SearchListener = (event: SearchEvent) => void;
const searchListeners: Set<SearchListener> = new Set();

export interface SearchEvent {
    type: 'result' | 'progress' | 'complete' | 'error';
    data?: any;
    message?: string;
}

/**
 * Add a listener for search events.
 * Returns a cleanup function.
 */
export function addSearchListener(listener: SearchListener): () => void {
    searchListeners.add(listener);
    return () => searchListeners.delete(listener);
}

function notifyListeners(event: SearchEvent) {
    searchListeners.forEach(listener => {
        try {
            listener(event);
        } catch (e) {
            console.error('[MotelyWasm] Listener error:', e);
        }
    });
}

/**
 * Start a JAML search using the WASM engine.
 * Search results are emitted to listeners.
 *
 * @param jamlContent - JAML filter content
 * @param options - Optional search parameters (threadCount, batchSize, etc.)
 * @returns searchId string (resolves once searchId is known)
 */
export async function searchSeedsWasm(
    jamlContent: string,
    options?: SearchOptions,
): Promise<string> {
    const api = await getWasmApi();

    // Stop any existing search
    if (activeSearchId) {
        try {
            api.stopSearch(activeSearchId);
            await api.disposeSearch(activeSearchId);
        } catch { /* ignore */ }
    }

    // Start new search
    const defaults: SearchOptions = {
        threadCount: typeof navigator !== 'undefined' ? Math.max(1, navigator.hardwareConcurrency - 1) : 4,
    };
    activeSearchId = null;

    // Track already-seen seeds to avoid duplicate result events
    const seenSeeds = new Set<string>();

    let resolveSearchId: ((id: string) => void) | null = null;
    const searchIdPromise = new Promise<string>((resolve) => {
        resolveSearchId = resolve;
    });

    const ensureSearchId = (id: string) => {
        if (!activeSearchId) {
            activeSearchId = id;
            if (resolveSearchId) {
                resolveSearchId(id);
                resolveSearchId = null;
            }
        }
    };

    const onProgress = (
        searchId: string,
        totalSeedsSearched: number,
        matchingSeeds: number,
        elapsedMs: number,
        resultCount: number,
    ) => {
        ensureSearchId(searchId);
        notifyListeners({
            type: 'progress',
            data: {
                SearchedCount: totalSeedsSearched,
                MatchingSeeds: matchingSeeds,
                ElapsedMs: elapsedMs,
                ResultCount: resultCount,
                progress: 'Running',
            },
        });
    };

    const onResult = (searchId: string, seed: string, score: number) => {
        ensureSearchId(searchId);
        if (seenSeeds.has(seed)) return;
        seenSeeds.add(seed);
        notifyListeners({
            type: 'result',
            data: { seed, score },
        });
    };

    api.startJamlSearch(jamlContent, { ...defaults, ...options, onProgress, onResult })
        .then(async (status) => {
            ensureSearchId(status.searchId);
            if (status.error) {
                notifyListeners({ type: 'error', message: status.error });
            } else {
                notifyListeners({ type: 'complete', data: status });
            }
            if (activeSearchId === status.searchId) {
                activeSearchId = null;
            }
            try {
                await api.disposeSearch(status.searchId);
            } catch { /* ignore */ }
        })
        .catch((e: any) => {
            notifyListeners({ type: 'error', message: e?.message || String(e) });
            activeSearchId = null;
        });

    return searchIdPromise;
}

/**
 * Cancel the active search.
 */
export async function cancelSearch(): Promise<void> {
    if (activeSearchId && wasmApi) {
        try {
            const id = activeSearchId;
            wasmApi.stopSearch(id);
            await wasmApi.disposeSearch(id);
        } catch { /* ignore */ }
        activeSearchId = null;
    }
}

/**
 * Check if a search is currently running.
 */
export function isSearchRunning(): boolean {
    return activeSearchId !== null;
}

/**
 * Get the current search progress.
 */
export async function getSearchProgress(): Promise<SearchStatusInfo | null> {
    if (!activeSearchId || !wasmApi) return null;
    try {
        return wasmApi.getSearchStatus(activeSearchId, 0);
    } catch {
        return null;
    }
}

// Simple result type used by UI components
export interface SearchResult {
    seed: string;
    score: number;
}

// Re-export types for convenience
export type { MotelyWasmApi, SeedAnalysisInfo, SearchStatusInfo, ValidateResult, VersionInfo, CapabilitiesInfo, SearchOptions };
