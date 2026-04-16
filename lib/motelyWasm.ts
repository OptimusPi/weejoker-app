'use client';

import dotnet, { MotelyWasm, Motely } from 'motely-wasm';
import { decodeMotelyItemName, motelyItemCategory } from 'jaml-ui/motely';

const MAX_ANTES = 8;
const MAX_SHOP_ITEMS = 6;
const MAX_PACKS = 2;
const MAX_TAGS = 4;

let bootPromise: Promise<void> | null = null;

async function ensureBooted(): Promise<void> {
  if (!bootPromise) {
    bootPromise = (async () => {
      if (typeof window === 'undefined') throw new Error('Motely WASM is browser-only');
      await dotnet.boot();
    })().catch((e) => {
      bootPromise = null;
      throw new Error(`Failed to boot Motely WASM: ${e instanceof Error ? e.message : String(e)}`);
    });
  }
  return bootPromise;
}

/** "AmberAcorn" → "Amber Acorn" */
function enumKeyToName(key: string | undefined): string {
  if (!key) return 'Unknown';
  return key.replace(/([A-Z])/g, ' $1').trim();
}

// ── Version ──────────────────────────────────────────────────────────────────

export async function getMotelyVersion(): Promise<string> {
  await ensureBooted();
  return MotelyWasm.getVersion();
}

// ── Single-seed analysis ──────────────────────────────────────────────────────

/**
 * Runs a full seed analysis using the 11.x stream API.
 * Returns a raw object shaped for normalizeAnalysis() in seedAnalyzer.ts.
 */
export async function openSingleSeedContext(
  seed: string,
  deck: string,
  stake: string
): Promise<Record<string, unknown>> {
  await ensureBooted();

  const deckEnum = Motely.MotelyDeck[deck as keyof typeof Motely.MotelyDeck] ?? Motely.MotelyDeck.Red;
  const stakeEnum = Motely.MotelyStake[stake as keyof typeof Motely.MotelyStake] ?? Motely.MotelyStake.White;

  const ctx = MotelyWasm.createSearchContext(seed.toUpperCase(), deckEnum, stakeEnum);

  let erraticDeckComposition: string[] = [];
  if (deckEnum === Motely.MotelyDeck.Erratic) {
    try {
      const deckStream = ctx.createErraticDeckPrngStream();
      const deckChunk = ctx.getNextErraticDeckCardChunk(deckStream, 52);
      erraticDeckComposition = Array.from(deckChunk.items, (v) => decodeMotelyItemName(v) ?? `card#${v}`);
    } catch { /* non-erratic decks won't have this stream */ }
  }

  let runState: Motely.MotelyJsRunState = { voucherBitfield: 0, bossBitfield: 0 };
  let bossStream = ctx.createBossStream();
  const antes: unknown[] = [];

  for (let ante = 1; ante <= MAX_ANTES; ante++) {
    const bossResult = ctx.getNextBossForAnte(bossStream, ante, runState);
    bossStream = bossResult.stream;
    runState = bossResult.runState;
    const boss = enumKeyToName(Motely.MotelyBossBlind[bossResult.boss]);

    const voucherResult = ctx.getAnteFirstVoucher(ante, runState);
    runState = voucherResult.runState;
    const voucher = enumKeyToName(Motely.MotelyVoucher[voucherResult.voucher]);

    const tagChunk = ctx.getNextTagChunk(ctx.createTagStream(ante), MAX_TAGS);
    const tags = Array.from(tagChunk.tags, (t) => enumKeyToName(Motely.MotelyTag[t]));

    const packChunk = ctx.getNextBoosterPackChunk(ctx.createBoosterPackStream(ante), MAX_PACKS);
    const packs = Array.from(packChunk.packs, (p) => ({
      type: enumKeyToName(Motely.MotelyBoosterPack[p]),
      items: [] as string[],
    }));

    const shopStream = ctx.createShopItemStream(
      ante,
      runState,
      Motely.MotelyShopStreamFlags.Default,
      Motely.MotelyJokerStreamFlags.Default
    );
    const shopChunk = ctx.getNextShopItemChunk(shopStream, MAX_SHOP_ITEMS);
    const shopQueue = Array.from(shopChunk.items, (v) => ({ name: decodeMotelyItemName(v) ?? `item#${v}`, category: motelyItemCategory(v) }));

    antes.push({ ante, boss, voucher, smallBlindTag: tags[0] ?? '', bigBlindTag: tags[1] ?? '', shopQueue, packs });
  }

  return { seed: seed.toUpperCase(), deck, stake, erraticDeckComposition, antes };
}

// ── JAML Search ───────────────────────────────────────────────────────────────

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

export interface MotelyWasmApi {
  startJamlSearch(jamlContent: string, options?: WasmSearchOptions): Promise<WasmSearchStatus>;
  stopSearch(): void;
}

let activeSearch: Motely.IMotelyWasmSearch | null = null;

export async function getMotelyWasmApi(): Promise<MotelyWasmApi> {
  await ensureBooted();
  return {
    startJamlSearch: (jamlContent, options) => startJamlSearchWasm(jamlContent, options),
    stopSearch: stopMotelySearchSync,
  };
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function startJamlSearchWasm(jamlContent: string, options?: WasmSearchOptions): Promise<WasmSearchStatus> {
  await ensureBooted();
  stopMotelySearchSync();

  const search = MotelyWasm.startRandomSearch(jamlContent, 1_000_000);
  activeSearch = search;
  const completionPromise = search.waitForCompletion();

  while (true) {
    const snapshot = search.getSnapshot();
    const chunk = search.drainResults(256);
    for (const result of chunk) {
      options?.onResult?.(result.seed, result.score, result.tallyColumns);
    }
    options?.onProgress?.(Number(snapshot.totalSeedsSearched));
    if (snapshot.isCompleted) break;
    await sleep(25);
  }

  const tail = search.drainResults(1_000_000);
  for (const result of tail) {
    options?.onResult?.(result.seed, result.score, result.tallyColumns);
  }

  const completion = await completionPromise;
  activeSearch = null;
  return { totalSeedsSearched: completion.totalSeedsSearched, matchingSeeds: completion.matchingSeeds };
}

function stopMotelySearchSync(): void {
  if (activeSearch) {
    try { activeSearch.cancel(); } catch { /* noop */ }
    activeSearch = null;
  }
}

export async function stopMotelySearch(): Promise<void> { stopMotelySearchSync(); }
export async function disposeMotelySearch(): Promise<void> { stopMotelySearchSync(); }

// ── Capabilities ──────────────────────────────────────────────────────────────

export interface WasmCapabilities {
  version: string;
  threads: boolean;
  simd: boolean;
  processorCount: number;
}

export async function getWasmCapabilities(): Promise<WasmCapabilities> {
  await ensureBooted();
  return {
    version: MotelyWasm.getVersion(),
    threads: typeof SharedArrayBuffer !== 'undefined',
    simd: true,
    processorCount: typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency ?? 1) : 1,
  };
}

