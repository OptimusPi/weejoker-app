import {
    loadMotely,
    type CapabilitiesInfo,
    type MotelyWasmApi,
    type SearchStatusInfo,
    type SeedAnalysisInfo,
} from 'motely-wasm';

const loadAttempts = [
    { baseUrl: '/motely-framework', threads: 'auto' as const },
    { baseUrl: '/motely-framework-st', threads: 'off' as const },
    { baseUrl: '/_framework', threads: 'auto' as const },
    { baseUrl: '/_framework_st', threads: 'off' as const },
    { baseUrl: 'https://r2.weejoker.app/_framework', threads: 'auto' as const },
    { baseUrl: 'https://r2.weejoker.app/_framework_st', threads: 'off' as const },
    { baseUrl: 'https://seeds.erraticdeck.app/_framework', threads: 'auto' as const },
    { baseUrl: 'https://seeds.erraticdeck.app/_framework_st', threads: 'off' as const },
    undefined,
] as const;

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
    const errors: string[] = [];

    for (const attempt of loadAttempts) {
        try {
            return attempt ? await loadMotely(attempt) : await loadMotely();
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
    }

    throw new Error(errors.filter(Boolean).join(' | ') || 'Failed to load Motely WASM runtime');
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
