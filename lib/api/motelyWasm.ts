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
/** Whether a search is currently active. The API supports only one search at a time. */
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
 * Only one search can run at a time; starting a new one cancels any existing one.
 */
export async function searchSeedsWasm(
    jamlContent: string,
    options?: Partial<Pick<SearchOptions, 'cutoff' | 'specificSeed' | 'randomSeeds' | 'palindrome' | 'batchSize' | 'startBatch' | 'endBatch'>>,
): Promise<string> {
    const api = await getWasmApi();

    // Stop and dispose any existing search before starting a new one
    if (searchRunning) {
        try { api.stopSearch(); } catch (e) { console.warn('[MotelyWasm] stopSearch failed', e); }
        try { await api.disposeSearch(); } catch (e) { console.warn('[MotelyWasm] disposeSearch failed', e); }
        searchRunning = false;
    }

    searchRunning = true;

    // Start search — promise resolves when search completes
    const threadCount = typeof navigator !== 'undefined' ? Math.max(1, (navigator.hardwareConcurrency || 4) - 1) : 4;
    console.log(`[MotelyWasm] Starting search with ${threadCount} threads`);

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
            searchRunning = false;
            notifyListeners({ type: 'complete', data: status });
            try { await api.disposeSearch(); } catch (e) { console.warn('[MotelyWasm] disposeSearch on complete failed', e); }
        })
        .catch(async (err: any) => {
            searchRunning = false;
            notifyListeners({ type: 'error', message: err?.message || String(err) });
            try { await api.disposeSearch(); } catch (e) { console.warn('[MotelyWasm] disposeSearch on error failed', e); }
        });

    return 'active';
}

/**
 * Cancel the active search.
 */
export async function cancelSearch(): Promise<void> {
    if (searchRunning && wasmApi) {
        searchRunning = false;
        try { wasmApi.stopSearch(); } catch (e) { console.warn('[MotelyWasm] cancel stopSearch failed', e); }
        try { await wasmApi.disposeSearch(); } catch (e) { console.warn('[MotelyWasm] cancel disposeSearch failed', e); }
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

