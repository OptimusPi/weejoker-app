/**
 * Seed Analyzer Interface
 * 
 * Normalized format for UI consumption and JAML evaluation.
 * Primary analysis is performed by Motely WASM.
 */

/**
 * Analyzed seed data - the output format for UI consumption
 */
export interface AnalyzedSeed {
    seed: string;
    deck: string;
    stake: string;

    /** Starting deck cards in format "RANK_SUIT" e.g. ["2_C", "A_H", "K_S"] */
    startingDeck: string[];

    /** Optional performance metrics or metadata from Motely */
    metrics?: Record<string, any>;

    /** Jokers available in this seed */
    jokers: Array<{
        id: string; // e.g. "weejoker"
        name: string; // "Wee Joker"
        ante: number;
        source: string; // 'shop', 'buffoon_pack', 'tag', etc.
        edition?: string;
        slot?: number;
    }>;

    /** Consumables (tarots, spectrals, planets) */
    consumables: Array<{
        id: string;
        name: string;
        type: string; // 'tarot', 'spectral', 'planet'
        ante: number;
        source: string;
        slot?: number;
    }>;

    /** Vouchers */
    vouchers: Array<{
        ante: number;
        name: string;
        id: string;
    }>;

    /** Tags found in the seed */
    tags: Array<{
        ante: number;
        tag: string;
    }>;

    /** Bosses per ante */
    bosses: Array<{
        ante: number;
        boss: string;
    }>;

    /** Structured per-ante data for the breakdown view */
    antes: {
        [ante: number]: {
            boss: string;
            voucher: string;
            tags: string[];
            shopQueue: Array<{
                name: string;
                type: string;
                edition?: string;
                stickers?: string[];
            }>;
            packs: Array<{
                name: string;
                cards: Array<{
                    name: string;
                    type: string;
                    edition?: string;
                    stickers?: string[];
                }>;
            }>;
        }
    };
}


/**
 * Normalizes the raw JSON output from Motely WASM to the AnalyzedSeed format.
 * Handles both PascalCase (C#) and camelCase (JS) properties.
 */
export function normalizeAnalysis(wasm: any): AnalyzedSeed {
    if (!wasm) return {} as any;

    // Helper to get property regardless of case
    const get = (obj: any, key: string) => {
        if (!obj) return undefined;
        const pascal = key.charAt(0).toUpperCase() + key.slice(1);
        return obj[key] !== undefined ? obj[key] : obj[pascal];
    };

    // 1. Resolve the core analysis object (sometimes it's nested under 'analysis' or 'Analysis')
    const core = get(wasm, 'analysis') || wasm;

    // 2. Extract Starting Deck with extreme prejudice
    let deckCards: string[] = [];

    // Check direct properties
    const directDeck = get(core, 'startingDeck') || get(core, 'deck') || get(core, 'initialDeck') || get(core, 'fullDeck') || get(core, 'cards') || get(core, 'hand');
    if (Array.isArray(directDeck)) deckCards = directDeck;

    // Check Metrics fallback
    if (deckCards.length === 0) {
        const metrics = get(core, 'metrics');
        if (metrics) {
            const metricsDeck = get(metrics, 'startingDeck') || get(metrics, 'deck') || get(metrics, 'initialDeck');
            if (Array.isArray(metricsDeck)) deckCards = metricsDeck;
        }
    }

    // 3. Extract Deck Name
    const deckNameVal = get(core, 'deck');
    const deckName = typeof deckNameVal === 'string' ? deckNameVal : (get(core, 'deckType') || get(core, 'deck_type') || "Red");

    const output: AnalyzedSeed = {
        seed: get(wasm, 'seed') || get(core, 'seed') || "",
        deck: deckName,
        stake: get(core, 'stake') || "White",
        startingDeck: deckCards,
        metrics: get(core, 'metrics') || {},
        jokers: [],
        consumables: [],
        vouchers: [],
        tags: [],
        bosses: [],
        antes: {}
    };

    const wasmAntes = get(wasm, 'antes');
    if (wasmAntes && Array.isArray(wasmAntes)) {
        wasmAntes.forEach((ante: any) => {
            const anteNum = get(ante, 'ante');
            if (anteNum === undefined) return;

            output.antes[anteNum] = {
                boss: get(ante, 'boss') || "Unknown",
                voucher: get(ante, 'voucher') || "None",
                tags: [get(ante, 'smallBlindTag'), get(ante, 'bigBlindTag')].filter(Boolean),
                shopQueue: [],
                packs: []
            };

            // Process Shop items
            const shopQueue = get(ante, 'shopQueue');
            if (shopQueue && Array.isArray(shopQueue)) {
                shopQueue.forEach((item: any, slotIdx: number) => {
                    const itemName = get(item, 'name');
                    if (!itemName) return;

                    const { cleanName, edition } = extractEdition(itemName);
                    const type = getItemType(cleanName);
                    const slot = slotIdx + 1;

                    output.antes[anteNum].shopQueue.push({
                        name: cleanName,
                        type,
                        edition
                    });

                    if (type === 'Joker') {
                        output.jokers.push({
                            id: normalizeId(cleanName),
                            name: cleanName,
                            ante: anteNum,
                            source: 'shop',
                            edition,
                            slot
                        });
                    } else if (['Tarot', 'Planet', 'Spectral'].includes(type) || type === 'Consumable') {
                        output.consumables.push({
                            id: normalizeId(cleanName),
                            name: cleanName,
                            type: type.toLowerCase(),
                            ante: anteNum,
                            source: 'shop',
                            slot
                        });
                    }
                });
            }

            // Process Packs
            const packs = get(ante, 'packs');
            if (packs && Array.isArray(packs)) {
                packs.forEach((pack: any) => {
                    const packItems = get(pack, 'items') || [];
                    const packType = get(pack, 'type') || "Standard";

                    const packCards = packItems.map((itemName: string, slotIdx: number) => {
                        const { cleanName, edition } = extractEdition(itemName);
                        const type = getItemType(cleanName);
                        const slot = slotIdx + 1;

                        if (type === 'Joker') {
                            output.jokers.push({
                                id: normalizeId(cleanName),
                                name: cleanName,
                                ante: anteNum,
                                source: packType,
                                edition,
                                slot
                            });
                        } else if (['Tarot', 'Planet', 'Spectral'].includes(type)) {
                            output.consumables.push({
                                id: normalizeId(cleanName),
                                name: cleanName,
                                type: type.toLowerCase(),
                                ante: anteNum,
                                source: packType,
                                slot
                            });
                        }

                        return { name: cleanName, type, edition };
                    });

                    output.antes[anteNum].packs.push({
                        name: packType,
                        cards: packCards
                    });
                });
            }
        });
    }

    return output;
}

// Helpers
const PLANETS = ['Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Planet X', 'Ceres', 'Eris', 'Mercury', 'Earth'];
const SPECTRALS = ['Familiar', 'Grim', 'Incantation', 'Talisman', 'Aura', 'Wraith', 'Sigil', 'Ouija', 'Ectoplasm', 'Immolate', 'Ankh', 'Deja Vu', 'Hex', 'Trance', 'Medium', 'Cryptid', 'The Soul', 'Black Hole'];

function getItemType(itemName: string): string {
    if (PLANETS.includes(itemName)) return 'Planet';
    if (SPECTRALS.includes(itemName)) return 'Spectral';
    if (itemName.includes('Joker') || itemName === 'Showman' || itemName === 'Blueprint' || itemName === 'Brainstorm') return 'Joker';
    if (itemName.includes('Tag')) return 'Tag';
    if (itemName.includes('Voucher') || itemName === 'Seed Source') return 'Voucher';
    return 'Tarot';
}

function extractEdition(itemName: string): { cleanName: string; edition?: string } {
    const editionPrefixes = ['Negative', 'Polychrome', 'Foil', 'Holographic'];
    for (const prefix of editionPrefixes) {
        if (itemName.startsWith(prefix + ' ')) {
            return {
                cleanName: itemName.substring(prefix.length + 1),
                edition: prefix
            };
        }
    }
    return { cleanName: itemName };
}

function normalizeId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}
