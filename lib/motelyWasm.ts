import bootsharp, { MotelyWasmHost, SearchEvents, Motely } from 'motely-wasm';
import type { Analysis } from 'motely-wasm';

// Re-export for consumers
export { MotelyWasmHost, SearchEvents, Motely };

let bootPromise: Promise<void> | null = null;

async function ensureBooted(): Promise<void> {
    if (!bootPromise) {
        bootPromise = bootsharp.boot().then(() => {}).catch((error) => {
            bootPromise = null;
            const msg = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to boot Motely WASM runtime: ${msg}`);
        });
    }
    return bootPromise;
}

export async function getMotelyVersion(): Promise<string> {
    await ensureBooted();
    return MotelyWasmHost.getVersion();
}

export async function analyzeSeedWasm(
    seed: string,
    deck: string,
    stake: string
): Promise<Analysis.IMotelySingleSearchContext> {
    await ensureBooted();
    const deckEnum = Motely.MotelyDeck[deck as keyof typeof Motely.MotelyDeck] ?? Motely.MotelyDeck.Erratic;
    const stakeEnum = Motely.MotelyStake[stake as keyof typeof Motely.MotelyStake] ?? Motely.MotelyStake.White;
    return MotelyWasmHost.motelySingleSearchContext(seed, deckEnum, stakeEnum);
}

export interface WasmSearchOptions {
    onProgress?: (seedsSearched: bigint, matchingSeeds: bigint, elapsedMs: bigint) => void;
    onResult?: (seed: string, score: number, tallyColumns: Int32Array) => void;
    onComplete?: (status: string, seedsSearched: bigint, matchingSeeds: bigint) => void;
}

export async function startJamlSearchWasm(
    jamlContent: string,
    options?: WasmSearchOptions
): Promise<void> {
    await ensureBooted();
    const config = MotelyWasmHost.loadJaml(jamlContent);

    // Subscribe to events before starting
    if (options?.onProgress) SearchEvents.onProgress.subscribe(options.onProgress);
    if (options?.onResult) SearchEvents.onResult.subscribe(options.onResult);
    if (options?.onComplete) SearchEvents.onComplete.subscribe(options.onComplete);

    MotelyWasmHost.startRandomSearch(config, 1_000_000);
}

export async function stopMotelySearch(): Promise<void> {
    await ensureBooted();
    MotelyWasmHost.stopSearch();
}
