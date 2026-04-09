"use client";

/**
 * Motely WASM — main `motely-wasm` package with side-loaded `/motely-wasm` runtime.
 * Binaries are copied to `public/motely-wasm` via `scripts/copy-motely-wasm.mjs` (predev/prebuild).
 */

export interface VersionInfo {
  version: string;
  runtime: string;
}

export interface CapabilitiesInfo {
  version: string;
  threads: boolean;
  simd: boolean;
  processorCount: number;
}

export interface SearchStatusInfo {
  status: string;
  totalSearched?: number;
  matchingSeeds?: number;
  elapsedMs?: number;
  resultCount?: number;
}

export interface SearchOptions {
  cutoff?: number;
  specificSeed?: string;
  randomSeeds?: number;
  palindrome?: boolean;
  batchSize?: number;
  startBatch?: number;
  endBatch?: number;
  threadCount?: number;
}

export type SeedAnalysisInfo = Record<string, unknown>;
export type ValidateResult = { valid: boolean; errors?: string[] };

import bootsharp, {
  MotelyJamlSearchBuilder,
  MotelySingleSearchContext,
  SearchEvents,
  Motely,
  MotelyWasmHost,
} from "motely-wasm";

const MOTELY_WASM_PUBLIC_PATH = "/motely-wasm";

let bootPromise: Promise<void> | null = null;

async function ensureBooted(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error(
      "[MotelyWasm] Browser-only. For Route Handlers use `@/lib/server/motelyAnalyze` (motely-wasm-compat)."
    );
  }
  if (!bootPromise) {
    bootPromise = (async () => {
      await bootsharp.boot({ root: MOTELY_WASM_PUBLIC_PATH });
    })().catch((e) => {
      bootPromise = null;
      throw e;
    });
  }
  return bootPromise;
}

// --- High-level facade (replaces legacy loadMotely / MotelyWasmApi) ---

let activeSession: import("motely-wasm").BrowserWasm.IMotelySearchSession | null = null;
const searchUnsubs: Array<() => void> = [];

function cleanupSearchSubs() {
  searchUnsubs.splice(0).forEach((u) => u());
}

async function getFacade() {
  await ensureBooted();
  return {
    getVersion(): VersionInfo {
      return {
        version: MotelyJamlSearchBuilder.getVersion(),
        runtime: "NativeAOT-LLVM WASM",
      };
    },
    getCapabilities(): CapabilitiesInfo {
      return {
        version: MotelyJamlSearchBuilder.getVersion(),
        threads: typeof SharedArrayBuffer !== "undefined",
        simd: true,
        processorCount:
          typeof navigator !== "undefined"
            ? navigator.hardwareConcurrency ?? 1
            : 1,
      };
    },
    async analyzeSeed(
      seed: string,
      deck: string,
      stake: string
    ): Promise<SeedAnalysisInfo> {
      await ensureBooted();
      const deckEnum =
        Motely.MotelyDeck[deck as keyof typeof Motely.MotelyDeck] ??
        Motely.MotelyDeck.Erratic;
      const stakeEnum =
        Motely.MotelyStake[stake as keyof typeof Motely.MotelyStake] ??
        Motely.MotelyStake.White;
      const ctx = MotelySingleSearchContext.open(seed, deckEnum, stakeEnum);
      try {
        return JSON.parse(JSON.stringify(ctx)) as SeedAnalysisInfo;
      } catch {
        return { seed, deck, stake, analysis: ctx } as SeedAnalysisInfo;
      }
    },
    async startJamlSearch(
      jamlContent: string,
      options?: Partial<
        SearchOptions & {
          onProgress?: (
            totalSearched: number,
            matching: number,
            elapsedMs: number,
            resultCount: number
          ) => void;
          onResult?: (seed: string, score: number) => void;
        }
      >
    ): Promise<SearchStatusInfo> {
      await ensureBooted();
      cleanupSearchSubs();
      if (activeSession) {
        try {
          activeSession.cancel();
        } catch {
          /* noop */
        }
        activeSession = null;
      }

      MotelyJamlSearchBuilder.loadJaml(jamlContent);
      if (options?.specificSeed?.trim()) {
        MotelyJamlSearchBuilder.seedList([options.specificSeed.trim()]);
      } else if (
        options?.batchSize != null &&
        options?.startBatch != null &&
        options?.endBatch != null
      ) {
        MotelyJamlSearchBuilder.configured(
          options.batchSize,
          BigInt(options.startBatch),
          BigInt(options.endBatch)
        );
      } else {
        MotelyJamlSearchBuilder.random(options?.randomSeeds ?? 1_000_000);
      }

      const startMs = Date.now();
      let resultCount = 0;

      if (options?.onProgress) {
        const h = (searched: bigint, matching: bigint) => {
          options.onProgress!(
            Number(searched),
            Number(matching),
            Date.now() - startMs,
            resultCount
          );
        };
        SearchEvents.onProgress.subscribe(h);
        searchUnsubs.push(() => SearchEvents.onProgress.unsubscribe(h));
      }
      if (options?.onResult) {
        const h = (seed: string, score: number, _t: Int32Array) => {
          resultCount += 1;
          options.onResult!(seed, score);
        };
        SearchEvents.onResult.subscribe(h);
        searchUnsubs.push(() => SearchEvents.onResult.unsubscribe(h));
      }

      return await new Promise<SearchStatusInfo>((resolve, reject) => {
        const done = (
          status: string,
          total: bigint,
          matching: bigint
        ) => {
          cleanupSearchSubs();
          activeSession = null;
          resolve({
            status,
            totalSearched: Number(total),
            matchingSeeds: Number(matching),
            elapsedMs: Date.now() - startMs,
            resultCount,
          });
        };
        const onComplete = (
          status: string,
          total: bigint,
          matching: bigint
        ) => {
          SearchEvents.onComplete.unsubscribe(onComplete);
          done(status, total, matching);
        };
        SearchEvents.onComplete.subscribe(onComplete);
        searchUnsubs.push(() =>
          SearchEvents.onComplete.unsubscribe(onComplete)
        );
        try {
          activeSession = MotelyJamlSearchBuilder.run();
        } catch (e) {
          cleanupSearchSubs();
          activeSession = null;
          reject(e);
        }
      });
    },
    stopSearch() {
      cleanupSearchSubs();
      if (activeSession) {
        try {
          activeSession.cancel();
        } catch {
          /* noop */
        }
        activeSession = null;
      }
    },
    async disposeSearch() {
      this.stopSearch();
    },
    async validateJaml(jamlContent: string): Promise<ValidateResult> {
      await ensureBooted();
      try {
        MotelyWasmHost.loadJaml(jamlContent);
        return { valid: true };
      } catch (e) {
        return {
          valid: false,
          errors: [e instanceof Error ? e.message : String(e)],
        };
      }
    },
  };
}

type WasmFacade = Awaited<ReturnType<typeof getFacade>>;
let facadePromise: Promise<WasmFacade> | null = null;

async function getWasmApi() {
  if (!facadePromise) facadePromise = getFacade();
  return facadePromise;
}

export async function getVersion(): Promise<VersionInfo> {
  const api = await getWasmApi();
  return api.getVersion();
}

export async function getCapabilities(): Promise<CapabilitiesInfo> {
  const api = await getWasmApi();
  return api.getCapabilities();
}

export async function analyzeSeedWasm(
  seed: string,
  deck: string = "erratic",
  stake: string = "white",
  _ante?: number,
  _shop?: number
): Promise<SeedAnalysisInfo> {
  const api = await getWasmApi();
  const capDeck = deck.charAt(0).toUpperCase() + deck.slice(1).toLowerCase();
  const capStake = stake.charAt(0).toUpperCase() + stake.slice(1).toLowerCase();
  const VALID_DECKS = [
    "Red",
    "Blue",
    "Yellow",
    "Green",
    "Black",
    "Magic",
    "Nebula",
    "Ghost",
    "Abandoned",
    "Checkered",
    "Zodiac",
    "Painted",
    "Anaglyph",
    "Plasma",
    "Erratic",
  ];
  let d = capDeck;
  if (!VALID_DECKS.includes(d)) {
    console.warn(`[MotelyWasm] Unknown deck '${deck}', defaulting to Erratic`);
    d = "Erratic";
  }
  return api.analyzeSeed(seed.toUpperCase(), d, capStake);
}

export interface SearchEvent {
  type: "result" | "progress" | "complete" | "error";
  data?: unknown;
  message?: string;
}

export interface SearchResult {
  seed: string;
  score?: number;
  tally?: Int32Array;
  tallies?: number[] | null;
}

type SearchListener = (event: SearchEvent) => void;
const searchListeners = new Set<SearchListener>();
let isSearchActive = false;

function notifyListeners(event: SearchEvent) {
  searchListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (e) {
      console.error("[MotelyWasm] Listener error:", e);
    }
  });
}

export function addSearchListener(listener: SearchListener): () => void {
  searchListeners.add(listener);
  return () => searchListeners.delete(listener);
}

export async function searchSeedsWasm(
  jamlContent: string,
  options?: Partial<
    Pick<
      SearchOptions,
      | "cutoff"
      | "specificSeed"
      | "randomSeeds"
      | "palindrome"
      | "batchSize"
      | "startBatch"
      | "endBatch"
    >
  >
): Promise<string> {
  const api = await getWasmApi();

  if (isSearchActive) {
    try {
      api.stopSearch();
    } catch {
      /* noop */
    }
    try {
      await api.disposeSearch();
    } catch {
      /* noop */
    }
    isSearchActive = false;
  }

  const threadCount =
    typeof navigator !== "undefined"
      ? Math.max(1, (navigator.hardwareConcurrency || 4) - 1)
      : 4;
  console.log(`[MotelyWasm] Starting search with ${threadCount} threads`);

  isSearchActive = true;

  const searchPromise = api.startJamlSearch(jamlContent, {
    threadCount,
    ...options,
    onProgress: (
      totalSearched: number,
      matching: number,
      elapsedMs: number,
      resultCount: number
    ) => {
      notifyListeners({
        type: "progress",
        data: {
          SearchedCount: totalSearched,
          matchingSeeds: matching,
          elapsedMs,
          resultCount,
        },
      });
    },
    onResult: (seed: string, score: number, tally: Int32Array) => {
      notifyListeners({
        type: "result",
        data: { seed, score, tally, tallies: Array.from(tally) },
      });
    },
  });

  searchPromise
    .then(async (status: SearchStatusInfo) => {
      notifyListeners({ type: "complete", data: status });
      isSearchActive = false;
      try {
        await api.disposeSearch();
      } catch {
        /* noop */
      }
    })
    .catch(async (err: unknown) => {
      notifyListeners({
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
      isSearchActive = false;
      try {
        await api.disposeSearch();
      } catch {
        /* noop */
      }
    });

  return "active";
}

export async function cancelSearch(): Promise<void> {
  if (isSearchActive && facadePromise) {
    isSearchActive = false;
    const api = await facadePromise;
    try {
      api.stopSearch();
    } catch {
      /* noop */
    }
    try {
      await api.disposeSearch();
    } catch {
      /* noop */
    }
  }
}

export function isSearchRunning(): boolean {
  return isSearchActive;
}

export async function validateJamlWasm(jamlContent: string) {
  const api = await getWasmApi();
  return api.validateJaml(jamlContent);
}
