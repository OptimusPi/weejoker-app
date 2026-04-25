"use client";

/**
 * motely-wasm — NativeAOT-LLVM WASM, single `index.mjs`, one thread (browser or Node).
 * Prefer `jaml-ui` helpers for display; this module wires boot + search + analysis for the app.
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
  /** Ignored — WASM search is fixed single-threaded; kept for call-site compatibility. */
  threadCount?: number;
}

export type SeedAnalysisInfo = Record<string, unknown>;
export type ValidateResult = { valid: boolean; errors?: string[] };

import motely, {
  Motely,
  MotelyWasm,
  MotelyWasmEvents,
} from "motely-wasm";

import { buildSingleSeedAnalysis } from "@/lib/motely/singleSeedAnalysis";

let bootPromise: Promise<void> | null = null;

async function ensureBooted(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error(
      "[MotelyWasm] Browser-only. For Route Handlers use `@/lib/server/motelyAnalyze` (motely-wasm)."
    );
  }
  if (!bootPromise) {
    bootPromise = (async () => {
      await motely.boot({ root: "https://r2.weejoker.app/motely-wasm" });
    })().catch((e) => {
      bootPromise = null;
      throw e;
    });
  }
  return bootPromise;
}

function wasmSearchStateLabel(state: Motely.MotelyWasmSearchState): string {
  const name = Motely.MotelyWasmSearchState[state];
  return typeof name === "string" ? name : String(state);
}

function disposeSearchHandle(s: Motely.IMotelyWasmSearch | null): void {
  if (!s) return;
  const ext = s as Motely.IMotelyWasmSearch & { dispose?: () => void };
  try {
    ext.dispose?.();
  } catch {
    /* noop */
  }
}

// --- High-level facade ---

let activeSession: Motely.IMotelyWasmSearch | null = null;
const searchUnsubs: Array<() => void> = [];

function cleanupSearchSubs() {
  searchUnsubs.splice(0).forEach((u) => u());
}

async function getFacade() {
  await ensureBooted();
  return {
    getVersion(): VersionInfo {
      return {
        version: MotelyWasm.getVersion(),
        runtime: "NativeAOT-LLVM WASM (single-thread)",
      };
    },
    getCapabilities(): CapabilitiesInfo {
      return {
        version: MotelyWasm.getVersion(),
        threads: false,
        simd: true,
        processorCount: 1,
      };
    },
    async analyzeSeed(
      seed: string,
      deck: string,
      stake: string
    ): Promise<SeedAnalysisInfo> {
      await ensureBooted();
      return buildSingleSeedAnalysis(seed, deck, stake);
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
          onResult?: (seed: string, score: number, tally: Int32Array) => void;
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
        disposeSearchHandle(activeSession);
        activeSession = null;
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
        MotelyWasmEvents.onProgress.subscribe(h);
        searchUnsubs.push(() => MotelyWasmEvents.onProgress.unsubscribe(h));
      }
      if (options?.onResult) {
        const h = (seed: string, score: number, tally: Int32Array) => {
          resultCount += 1;
          options.onResult!(seed, score, tally);
        };
        MotelyWasmEvents.onResult.subscribe(h);
        searchUnsubs.push(() => MotelyWasmEvents.onResult.unsubscribe(h));
      }

      let search: Motely.IMotelyWasmSearch;
      try {
        if (options?.specificSeed?.trim()) {
          search = MotelyWasm.startSeedListSearch(jamlContent, [
            options.specificSeed.trim(),
          ]);
        } else if (
          options?.batchSize != null &&
          options?.startBatch != null &&
          options?.endBatch != null
        ) {
          search = MotelyWasm.startSequentialSearch(
            jamlContent,
            options.batchSize,
            BigInt(options.startBatch),
            BigInt(options.endBatch)
          );
        } else {
          search = MotelyWasm.startRandomSearch(
            jamlContent,
            options?.randomSeeds ?? 1_000_000
          );
        }
      } catch (e) {
        cleanupSearchSubs();
        throw e;
      }

      activeSession = search;

      return new Promise<SearchStatusInfo>((resolve) => {
        const completeHandler = (_status: string, totalSeedsSearched: bigint, matchingSeeds: bigint) => {
          MotelyWasmEvents.onComplete.unsubscribe(completeHandler);
          cleanupSearchSubs();
          disposeSearchHandle(search);
          activeSession = null;
          resolve({
            status: _status,
            totalSearched: Number(totalSeedsSearched),
            matchingSeeds: Number(matchingSeeds),
            elapsedMs: Date.now() - startMs,
            resultCount,
          });
        };
        MotelyWasmEvents.onComplete.subscribe(completeHandler);
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
        disposeSearchHandle(activeSession);
        activeSession = null;
      }
    },
    async disposeSearch() {
      this.stopSearch();
    },
    async validateJaml(jamlContent: string): Promise<ValidateResult> {
      await ensureBooted();
      const msg = MotelyWasm.validateJaml(jamlContent);
      if (msg && msg !== "valid") {
        return { valid: false, errors: [msg] };
      }
      return { valid: true };
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

export type SearchEvent =
  | {
      type: "result";
      data: {
        seed: string;
        score: number;
        tally: Int32Array;
        tallies: number[];
      };
    }
  | {
      type: "progress";
      data: {
        SearchedCount?: number;
        matchingSeeds?: number;
        elapsedMs?: number;
        resultCount?: number;
      };
    }
  | { type: "complete"; data?: SearchStatusInfo }
  | { type: "error"; message?: string };

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

  isSearchActive = true;

  const searchPromise = api.startJamlSearch(jamlContent, {
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
