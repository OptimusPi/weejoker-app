import "server-only";

import dotnet, {
  Motely,
  MotelySingleSearchContext,
} from "motely-wasm-compat";

/**
 * Node-only Motely engine: embedded `motely-wasm-compat` (no `/motely-wasm` static assets).
 * Imported only from Route Handlers / Server Actions — blocked from client bundles via `server-only`.
 */

let bootPromise: Promise<void> | null = null;

async function bootMotely(): Promise<void> {
  await dotnet.boot();
}

/** One Bootsharp boot per server process; clear on failure so the next request can retry. */
export async function ensureMotelyServerBoot(): Promise<void> {
  bootPromise ??= bootMotely().catch((err) => {
    bootPromise = null;
    throw err;
  });
  await bootPromise;
}

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
] as const;

function normalizeDeck(deck: string): keyof typeof Motely.MotelyDeck {
  const raw = deck.trim();
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  if (!VALID_DECKS.includes(cap as (typeof VALID_DECKS)[number])) {
    return "Erratic";
  }
  return cap as keyof typeof Motely.MotelyDeck;
}

function normalizeStake(stake: string): keyof typeof Motely.MotelyStake {
  const raw = stake.trim();
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return (cap in Motely.MotelyStake
    ? cap
    : "White") as keyof typeof Motely.MotelyStake;
}

/** Raw analysis payload for `normalizeAnalysis` (same shape as client `analyzeSeedWasm`). */
export async function analyzeSeedServer(
  seed: string,
  deck: string,
  stake: string
): Promise<Record<string, unknown>> {
  await ensureMotelyServerBoot();
  const deckKey = normalizeDeck(deck);
  const stakeKey = normalizeStake(stake);
  const deckEnum = Motely.MotelyDeck[deckKey] ?? Motely.MotelyDeck.Erratic;
  const stakeEnum = Motely.MotelyStake[stakeKey] ?? Motely.MotelyStake.White;
  const ctx = MotelySingleSearchContext.open(
    seed.toUpperCase(),
    deckEnum,
    stakeEnum
  );
  try {
    return JSON.parse(JSON.stringify(ctx)) as Record<string, unknown>;
  } catch {
    return { seed, deck: deckKey, stake: stakeKey, analysis: ctx } as Record<
      string,
      unknown
    >;
  }
}
