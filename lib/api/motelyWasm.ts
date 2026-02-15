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
            console.log('[MotelyWasm] Loading WASM runtime (threaded)...');
            wasmApi = await loadMotely({
                threads: 'on'
            });
            const version = wasmApi.getVersion();
            console.log(`[MotelyWasm] Loaded v${version.version} (${version.runtime})`);
            return wasmApi;
        } catch (error) {
            initPromise = null;
            throw error;
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
let activeSearchId: string | null = null;

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
    options?: Partial<Pick<SearchOptions, 'cutoff' | 'specificSeed' | 'randomSeeds' | 'palindrome' | 'batchSize' | 'startBatch' | 'endBatch'>>,
): Promise<string> {
    const api = await getWasmApi();

    // Stop and dispose any existing search
    if (activeSearchId) {
        try { api.stopSearch(activeSearchId); } catch { /* noop */ }
        try { await api.disposeSearch(activeSearchId); } catch { /* noop */ }
        activeSearchId = null;
    }

    // Track searchId from first callback
    let capturedSearchId: string | null = null;

    // Start search — promise resolves when search completes
    const threadCount = typeof navigator !== 'undefined' ? Math.max(1, (navigator.hardwareConcurrency || 4) - 1) : 4;
    console.log(`[MotelyWasm] Starting search with ${threadCount} threads`);

    const searchPromise = api.startJamlSearch(jamlContent, {
        threadCount,
        ...options,
        onProgress: (searchId: string, totalSeedsSearched: number, matchingSeeds: number, elapsedMs: number, resultCount: number) => {
            if (!capturedSearchId) {
                capturedSearchId = searchId;
                activeSearchId = searchId;
            }
            notifyListeners({
                type: 'progress',
                data: { SearchedCount: totalSeedsSearched, matchingSeeds, elapsedMs, resultCount }
            });
        },
        onResult: (searchId: string, seed: string, score: number) => {
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
            const finishedId = capturedSearchId || status.searchId;
            if (activeSearchId === finishedId) {
                activeSearchId = null;
            }
            // Free WASM memory for completed search
            try { await api.disposeSearch(finishedId); } catch { /* noop */ }
        })
        .catch(async (err: any) => {
            notifyListeners({ type: 'error', message: err?.message || String(err) });
            if (activeSearchId && capturedSearchId) {
                try { await api.disposeSearch(capturedSearchId); } catch { /* noop */ }
            }
            activeSearchId = null;
        });

    return capturedSearchId || 'pending';
}

/**
 * Cancel the active search.
 */
export async function cancelSearch(): Promise<void> {
    if (activeSearchId && wasmApi) {
        const id = activeSearchId;
        activeSearchId = null;
        try { wasmApi.stopSearch(id); } catch { /* noop */ }
        try { await wasmApi.disposeSearch(id); } catch { /* noop */ }
    }
}

/**
 * Check if a search is currently running.
 */
export function isSearchRunning(): boolean {
    return activeSearchId !== null;
}

/**
 * Validate JAML content.
 */
export async function validateJamlWasm(jamlContent: string) {
    const api = await getWasmApi();
    return api.validateJaml(jamlContent);
}

// Re-export types for convenience
// export type { MotelyWasmApi, SeedAnalysisInfo, SearchStatusInfo, SearchResultInfo, VersionInfo, CapabilitiesInfo };
