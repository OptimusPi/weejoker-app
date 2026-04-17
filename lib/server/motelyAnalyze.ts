import "server-only";

import motely from "motely-wasm";

import { buildSingleSeedAnalysis } from "@/lib/motely/singleSeedAnalysis";

/**
 * Node Route Handlers: same `motely-wasm` package as the browser — NativeAOT-LLVM WASM,
 * single-threaded, embedded in `index.mjs` (no separate compat / `-node` package).
 */

let bootPromise: Promise<void> | null = null;

async function bootMotely(): Promise<void> {
  await motely.boot();
}

/** One boot per server process; clear on failure so the next request can retry. */
export async function ensureMotelyServerBoot(): Promise<void> {
  bootPromise ??= bootMotely().catch((err) => {
    bootPromise = null;
    throw err;
  });
  await bootPromise;
}

/** Raw analysis payload for `normalizeAnalysis` (same shape as client `analyzeSeedWasm`). */
export async function analyzeSeedServer(
  seed: string,
  deck: string,
  stake: string
): Promise<Record<string, unknown>> {
  await ensureMotelyServerBoot();
  return buildSingleSeedAnalysis(seed, deck, stake);
}
