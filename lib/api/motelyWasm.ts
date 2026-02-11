"use client";

/**
 * Motely WASM Bridge
 *
 * Clean wrapper around the motely-wasm npm package.
 * Handles lazy initialization and provides typed APIs for consumers.
 */

import type {
    MotelyWasmApi,
    SeedAnalysisInfo,
    SearchStatusInfo,
    SearchResultInfo,
    VersionInfo,
    CapabilitiesInfo,
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
            console.log('[MotelyWasm] Loading WASM runtime...');
            wasmApi = await loadMotely();
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
    maxResults: number = 1000,
    deck: string = '',
): Promise<string> {
    const api = await getWasmApi();

    // Stop any existing search
    if (activeSearchId) {
        try { api.stopSearch(activeSearchId); } catch { /* noop */ }
        activeSearchId = null;
    }

    // Track searchId from first callback
    let capturedSearchId: string | null = null;

    // Start search — promise resolves when search completes
    const searchPromise = api.startJamlSearch(jamlContent, {
        onProgress: (searchId, totalSeedsSearched, matchingSeeds, elapsedMs, resultCount) => {
            if (!capturedSearchId) {
                capturedSearchId = searchId;
                activeSearchId = searchId;
            }
            notifyListeners({
                type: 'progress',
                data: { SearchedCount: totalSeedsSearched, matchingSeeds, elapsedMs, resultCount }
            });
        },
        onResult: (searchId, seed, score) => {
            notifyListeners({
                type: 'result',
                data: { seed, score }
            });
        },
    });

    // Handle completion asynchronously (don't block the caller)
    searchPromise
        .then((status) => {
            notifyListeners({ type: 'complete', data: status });
            if (activeSearchId === (capturedSearchId || status.searchId)) {
                activeSearchId = null;
            }
        })
        .catch((err) => {
            notifyListeners({ type: 'error', message: err?.message || String(err) });
            activeSearchId = null;
        });

    return capturedSearchId || 'pending';
}

/**
 * Cancel the active search.
 */
export function cancelSearch(): void {
    if (activeSearchId && wasmApi) {
        try { wasmApi.stopSearch(activeSearchId); } catch { /* noop */ }
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
 * Validate JAML content.
 */
export async function validateJamlWasm(jamlContent: string) {
    const api = await getWasmApi();
    return api.validateJaml(jamlContent);
}

// Re-export types for convenience
export type { MotelyWasmApi, SeedAnalysisInfo, SearchStatusInfo, SearchResultInfo, VersionInfo, CapabilitiesInfo };
