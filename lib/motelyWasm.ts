import bootsharp, {
  MotelyJamlSearchBuilder,
  MotelySingleSearchContext,
  SearchEvents,
  Motely,
} from 'motely-wasm';
import type { Analysis, BrowserWasm } from 'motely-wasm';

// Re-export for consumers
export { MotelyJamlSearchBuilder, MotelySingleSearchContext, SearchEvents, Motely };

/** Public URL path where `motely-wasm` bin/* is staged (see `scripts/copy-motely-wasm.mjs`). */
const MOTELY_WASM_PUBLIC_PATH = '/motely-wasm';

let bootPromise: Promise<void> | null = null;

async function ensureBooted(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      if (typeof window === 'undefined') {
        throw new Error(
          'Motely WASM is browser-only in this app. Use client-side analyzeSeedWasm() or the 501 API stub.'
        );
      }
      await bootsharp.boot({ root: MOTELY_WASM_PUBLIC_PATH });
    })().catch((error) => {
      bootPromise = null;
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to boot Motely WASM runtime: ${msg}`);
    });
  }
  return bootPromise;
}

// ── Version ────────────────────────────────────────────────────────────────

export async function getMotelyVersion(): Promise<string> {
  await ensureBooted();
  return MotelyJamlSearchBuilder.getVersion();
}

// ── Single seed analysis ───────────────────────────────────────────────────

export async function analyzeSeedWasm(
  seed: string,
  deck: string,
  stake: string
): Promise<Analysis.MotelySingleSearchContextImpl> {
  await ensureBooted();
  const deckEnum =
    Motely.MotelyDeck[deck as keyof typeof Motely.MotelyDeck] ??
    Motely.MotelyDeck.Erratic;
  const stakeEnum =
    Motely.MotelyStake[stake as keyof typeof Motely.MotelyStake] ??
    Motely.MotelyStake.White;
  return MotelySingleSearchContext.open(seed, deckEnum, stakeEnum);
}

// ── JAML Search ────────────────────────────────────────────────────────────

export interface SearchResultInfo {
  seed: string;
  score: number;
  tally: Int32Array;
}

export interface WasmSearchOptions {
  onProgress?: (seedsSearched: number) => void;
  onResult?: (seed: string, score: number, tally: Int32Array) => void;
}

export interface WasmSearchStatus {
  totalSeedsSearched: bigint;
  matchingSeeds: bigint;
}

let activeSession: BrowserWasm.IMotelySearchSession | null = null;
let progressUnsub: (() => void) | null = null;
let resultUnsub: (() => void) | null = null;
let completeUnsub: (() => void) | null = null;

function cleanupSubscriptions() {
  if (progressUnsub) { progressUnsub(); progressUnsub = null; }
  if (resultUnsub) { resultUnsub(); resultUnsub = null; }
  if (completeUnsub) { completeUnsub(); completeUnsub = null; }
}

export interface MotelyWasmApi {
  startJamlSearch(
    jamlContent: string,
    options?: WasmSearchOptions
  ): Promise<WasmSearchStatus>;
  stopSearch(): void;
}

export async function getMotelyWasmApi(): Promise<MotelyWasmApi> {
  await ensureBooted();
  return {
    startJamlSearch: (jamlContent, options) =>
      startJamlSearchWasm(jamlContent, options),
    stopSearch: () => {
      stopMotelySearchSync();
    },
  };
}

async function startJamlSearchWasm(
  jamlContent: string,
  options?: WasmSearchOptions
): Promise<WasmSearchStatus> {
  await ensureBooted();

  // Clean up any previous subscriptions
  cleanupSubscriptions();

  const builder = MotelyJamlSearchBuilder.loadJaml(jamlContent);
  MotelyJamlSearchBuilder.random(1_000_000);

  // Subscribe to events
  if (options?.onProgress) {
    const handler = (seedsSearched: bigint, _matchingSeeds: bigint) => {
      options.onProgress!(Number(seedsSearched));
    };
    SearchEvents.onProgress.subscribe(handler);
    progressUnsub = () => SearchEvents.onProgress.unsubscribe(handler);
  }

  if (options?.onResult) {
    const handler = (seed: string, score: number, tallyColumns: Int32Array) => {
      options.onResult!(seed, score, tallyColumns);
    };
    SearchEvents.onResult.subscribe(handler);
    resultUnsub = () => SearchEvents.onResult.unsubscribe(handler);
  }

  return new Promise<WasmSearchStatus>((resolve, reject) => {
    const completeHandler = (
      status: string,
      totalSeedsSearched: bigint,
      matchingSeeds: bigint
    ) => {
      cleanupSubscriptions();
      activeSession = null;
      resolve({ totalSeedsSearched, matchingSeeds });
    };
    SearchEvents.onComplete.subscribe(completeHandler);
    completeUnsub = () => SearchEvents.onComplete.unsubscribe(completeHandler);

    try {
      activeSession = MotelyJamlSearchBuilder.run();
    } catch (err) {
      cleanupSubscriptions();
      activeSession = null;
      reject(err);
    }
  });
}

function stopMotelySearchSync(): void {
  if (activeSession) {
    activeSession.cancel();
    activeSession = null;
  }
  cleanupSubscriptions();
}

export async function stopMotelySearch(): Promise<void> {
  stopMotelySearchSync();
}

export async function disposeMotelySearch(): Promise<void> {
  stopMotelySearchSync();
}

// ── Capabilities (simplified for v7) ──────────────────────────────────────

export interface WasmCapabilities {
  version: string;
  threads: boolean;
  simd: boolean;
  processorCount: number;
}

export async function getWasmCapabilities(): Promise<WasmCapabilities> {
  await ensureBooted();
  return {
    version: MotelyJamlSearchBuilder.getVersion(),
    threads: typeof SharedArrayBuffer !== 'undefined',
    simd: true, // NativeAOT-LLVM WASM always has SIMD
    processorCount: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 1 : 1,
  };
}
