import { MotelyWasm, Motely } from "motely-wasm";
import { decodeMotelyItemName, motelyItemCategory } from "jaml-ui/motely";

const MAX_ANTES = 8;
const MAX_SHOP_ITEMS = 6;
const MAX_PACKS = 2;
const MAX_TAGS = 4;

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

/** "AmberAcorn" → "Amber Acorn" */
function enumKeyToName(key: string | undefined): string {
  if (!key) return "Unknown";
  return key.replace(/([A-Z])/g, " $1").trim();
}

export function normalizeDeck(deck: string): keyof typeof Motely.MotelyDeck {
  const raw = deck.trim();
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  if (!VALID_DECKS.includes(cap as (typeof VALID_DECKS)[number])) {
    return "Erratic";
  }
  return cap as keyof typeof Motely.MotelyDeck;
}

export function normalizeStake(stake: string): keyof typeof Motely.MotelyStake {
  const raw = stake.trim();
  const cap = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return (cap in Motely.MotelyStake
    ? cap
    : "White") as keyof typeof Motely.MotelyStake;
}

/**
 * Full single-seed walk using `MotelyWasm.createSearchContext` stream API.
 * Shape matches what `normalizeAnalysis` in `seedAnalyzer.ts` expects.
 */
export function buildSingleSeedAnalysis(
  seed: string,
  deckStr: string,
  stakeStr: string
): Record<string, unknown> {
  const deckKey = normalizeDeck(deckStr);
  const stakeKey = normalizeStake(stakeStr);
  const deckEnum = Motely.MotelyDeck[deckKey] ?? Motely.MotelyDeck.Erratic;
  const stakeEnum = Motely.MotelyStake[stakeKey] ?? Motely.MotelyStake.White;

  const ctx = MotelyWasm.createSearchContext(
    seed.toUpperCase(),
    deckEnum,
    stakeEnum
  );

  let erraticDeckComposition: string[] = [];
  if (deckEnum === Motely.MotelyDeck.Erratic) {
    try {
      const deckStream = ctx.createErraticDeckPrngStream();
      const deckChunk = ctx.getNextErraticDeckCardChunk(deckStream, 52);
      erraticDeckComposition = Array.from(deckChunk.items, (v) =>
        decodeMotelyItemName(v) ?? `card#${v}`
      );
    } catch {
      /* non-erratic decks won't have this stream */
    }
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
    const tags = Array.from(tagChunk.tags, (t) =>
      enumKeyToName(Motely.MotelyTag[t])
    );

    const packChunk = ctx.getNextBoosterPackChunk(
      ctx.createBoosterPackStream(ante),
      MAX_PACKS
    );
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
    const shopQueue = Array.from(shopChunk.items, (v) => ({
      name: decodeMotelyItemName(v) ?? `item#${v}`,
      category: motelyItemCategory(v),
    }));

    antes.push({
      ante,
      boss,
      voucher,
      smallBlindTag: tags[0] ?? "",
      bigBlindTag: tags[1] ?? "",
      shopQueue,
      packs,
    });
  }

  return {
    seed: seed.toUpperCase(),
    deck: deckStr,
    stake: stakeStr,
    erraticDeckComposition,
    antes,
  };
}
