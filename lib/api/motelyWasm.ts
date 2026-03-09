"use client";

/**
 * Motely WASM Bridge
 * 
 * Clean wrapper around the motely-wasm npm package.
 * Handles lazy initialization and provides typed APIs for consumers.
 */

export type {
    MotelyWasmApi,
    SeedAnalysisInfo,
    SearchStatusInfo,
    SearchResultInfo,
    VersionInfo,
    CapabilitiesInfo,
    SearchOptions,
    ValidateResult,
} from 'motely-wasm';

import type {
    MotelyWasmApi,
    SeedAnalysisInfo,
    SearchStatusInfo,
    SearchResultInfo,
    VersionInfo,
    CapabilitiesInfo,
    SearchOptions,
    ValidateResult,
} from 'motely-wasm';

// Singleton WASM API
let wasmApi: MotelyWasmApi | null = null;
let initPromise: Promise<MotelyWasmApi> | null = null;

function toMotelyLoadError(error: unknown): Error {
    const message = error instanceof Error ? error.message : String(error);

    if (/Failed to fetch dynamically imported module/i.test(message) || /\/dotnet\.js/i.test(message)) {
        return new Error(
            `[MotelyWasm] Failed to load the bundled single-thread runtime assets from motely-wasm. ` +
            `The package runtime files were not resolved correctly by the app bundler/host. Original error: ${message}`,
        );
    }

    return error instanceof Error ? error : new Error(message);
}

/**
 * Initialize and return the Motely WASM API (singleton).
 * Browser-only — throws in SSR/Edge.
 */
async function getWasmApi(): Promise<MotelyWasmApi> {
    if (typeof window === 'undefined') {
        throw new Error('[MotelyWasm] WASM only available in browser environment');
    }
    if (wasmApi) return wasmApi;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            const { loadMotely } = await import('motely-wasm');
            console.log('[MotelyWasm] Loading bundled single-thread WASM runtime...');
            const api = await loadMotely({
                threads: 'off',
            });
            wasmApi = api;

            const version = api.getVersion();
            console.log(`[MotelyWasm] Loaded v${version.version} (${version.runtime})`);
            return api;
        } catch (error) {
            initPromise = null;
            throw toMotelyLoadError(error);
        }
    })();

    return initPromise;
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
 */
export async function analyzeSeedWasm(
    seed: string,
    deck: string = 'erratic',
    stake: string = 'white',
    _ante?: number,
    _shop?: number
): Promise<SeedAnalysisInfo> {
    const api = await getWasmApi();

    // Normalize deck name to handle special cases
    let normalizedDeck = deck.toLowerCase();

    // Default to 'erratic' if empty or invalid
    if (!normalizedDeck || normalizedDeck === '') {
        normalizedDeck = 'erratic';
    }

    // Ensure we don't accidentally pass 'blueprint' or other non-deck strings
    // unless they are valid deck names in Motely
    const VALID_DECKS = [
        'red', 'blue', 'yellow', 'green', 'black', 'magic', 'nebula', 'ghost',
        'abandoned', 'checkered', 'zodiac', 'painted', 'anaglyph', 'plasma', 'erratic'
    ];

    if (!VALID_DECKS.includes(normalizedDeck)) {
        console.warn(`[MotelyWasm] Unknown deck '${deck}', defaulting to 'erratic'`);
        normalizedDeck = 'erratic';
    }

    return api.analyzeSeed(seed, normalizedDeck, stake);
}

// --- Search event system ---

export interface SearchEvent {
    type: 'result' | 'progress' | 'complete' | 'error';
    data?: any;
    message?: string;
}

export interface SearchResult {
    seed: string;
    score?: number;
    tallies?: number[] | null;
}

type SearchListener = (event: SearchEvent) => void;
const searchListeners: Set<SearchListener> = new Set();
let searchRunning = false;

function notifyListeners(event: SearchEvent) {
    searchListeners.forEach(listener => {
        try { listener(event); } catch (e) { console.error('[MotelyWasm] Listener error:', e); }
    });
}

/**
 * Add a listener for search events. Returns a cleanup function.
 */
export function addSearchListener(listener: SearchListener): () => void {
    searchListeners.add(listener);
    return () => searchListeners.delete(listener);
}

/**
 * Start a JAML search using the WASM engine.
 * Results are emitted to listeners via addSearchListener.
 */
export async function searchSeedsWasm(
    jamlContent: string,
    options?: Partial<Pick<SearchOptions, 'cutoff' | 'specificSeed' | 'randomSeeds' | 'palindrome' | 'batchCharCount' | 'startBatch' | 'endBatch'>>,
): Promise<string> {
    const api = await getWasmApi();

    // Stop and dispose any existing search
    if (searchRunning) {
        try { api.stopSearch(); } catch { /* noop */ }
        try { await api.disposeSearch(); } catch { /* noop */ }
        searchRunning = false;
    }

    // Start search — promise resolves when search completes
    const threadCount = 1;
    console.log('[MotelyWasm] Starting search in single-thread mode');
    searchRunning = true;

    const searchPromise = api.startJamlSearch(jamlContent, {
        threadCount,
        ...options,
        onProgress: (totalSeedsSearched: number, matchingSeeds: number, elapsedMs: number, resultCount: number) => {
            notifyListeners({
                type: 'progress',
                data: { SearchedCount: totalSeedsSearched, matchingSeeds, elapsedMs, resultCount }
            });
        },
        onResult: (seed: string, score: number) => {
            notifyListeners({
                type: 'result',
                data: { seed, score }
            });
        },
    });

    // Handle completion asynchronously (don't block the caller)
    searchPromise
        .then(async (status: SearchStatusInfo) => {
            notifyListeners({ type: 'complete', data: status });
            searchRunning = false;
            // Free WASM memory for completed search
            try { await api.disposeSearch(); } catch { /* noop */ }
        })
        .catch(async (err: any) => {
            notifyListeners({ type: 'error', message: err?.message || String(err) });
            searchRunning = false;
            try { await api.disposeSearch(); } catch { /* noop */ }
        });

    return 'active';
}

/**
 * Cancel the active search.
 */
export async function cancelSearch(): Promise<void> {
    if (searchRunning && wasmApi) {
        searchRunning = false;
        try { wasmApi.stopSearch(); } catch { /* noop */ }
        try { await wasmApi.disposeSearch(); } catch { /* noop */ }
    }
}

/**
 * Check if a search is currently running.
 */
export function isSearchRunning(): boolean {
    return searchRunning;
}

/**
 * Validate JAML content.
 */
export async function validateJamlWasm(jamlContent: string) {
    const api = await getWasmApi();
    return api.validateJaml(jamlContent);
}