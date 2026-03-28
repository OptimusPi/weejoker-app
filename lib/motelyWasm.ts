import {
    loadMotely,
    type CapabilitiesInfo,
    type MotelyWasmApi,
    type SearchStatusInfo,
    type SeedAnalysisInfo,
} from 'motely-wasm';

interface WasmSearchOptions {
    threadCount?: number;
    batchCharCount?: number;
    startBatch?: number;
    endBatch?: number;
    onProgress?: (...args: number[]) => void;
    onResult?: (seed: string, score: number) => void;
}

let apiPromise: Promise<MotelyWasmApi> | null = null;

async function createApi(): Promise<MotelyWasmApi> {
    try {
        // Let motely-wasm handle its own initialization
        return await loadMotely();
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to load Motely WASM runtime: ${msg}`);
    }
}

export async function getMotelyWasmApi(): Promise<MotelyWasmApi> {
    if (!apiPromise) {
        apiPromise = createApi().catch((error) => {
            apiPromise = null;
            throw error;
        });
    }

    return apiPromise;
}

export async function analyzeSeedWasm(seed: string, deck: string, stake: string): Promise<SeedAnalysisInfo> {
    const api = await getMotelyWasmApi();
    return api.analyzeSeed(seed, deck, stake);
}

export async function getWasmCapabilities(): Promise<CapabilitiesInfo> {
    const api = await getMotelyWasmApi();
    return api.getCapabilities();
}

export async function startJamlSearchWasm(jamlContent: string, options?: WasmSearchOptions): Promise<SearchStatusInfo> {
    const api = await getMotelyWasmApi();
    return api.startJamlSearch(jamlContent, options as any);
}

export async function stopMotelySearch(): Promise<void> {
    const api = await getMotelyWasmApi();
    api.stopSearch();
}

export async function disposeMotelySearch(): Promise<void> {
    const api = await getMotelyWasmApi();
    await api.disposeSearch();
}
