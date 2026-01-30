/**
 * Balatro Seed Analyzer Wrapper
 * 
 * Uses the local Blueprint engine (lib/balatrots) to analyze seeds in pure TypeScript.
 * Returns data in a normalized format for UI consumption and JAML evaluation.
 */

import { BalatroAnalyzer } from '@Blueprint/BalatroAnalyzer';
import { Deck, DeckType, deckMap } from '@Blueprint/enum/Deck';
import { Stake, StakeType, stakeMap } from '@Blueprint/enum/Stake';
import { Version } from '@Blueprint/enum/Version';
import { JokerData } from '@Blueprint/struct/JokerData';
import { Card } from '@Blueprint/enum/cards/Card';
import { Run } from '@Blueprint/Run';
import { Game } from '@Blueprint/Game';
import { InstanceParams } from '@Blueprint/struct/InstanceParams';
// import { Result, IResult } from './balatrots/Result'; // Result is not exported from index? checking import

// Define local interfaces if not exported
interface IResult {
    ante: number;
    voucher: string;
    shop: (Card | JokerData)[];
    packs: {
        kind: string; // PackKind enum string
        cards: (Card | JokerData)[];
    }[];
    tags?: string[];
    boss?: { name: string }; // BossBlind
}

/**
 * Analyzed seed data - the output format for UI consumption
 */
export interface AnalyzedSeed {
    seed: string;
    deck: string;
    stake: string;

    /** Starting deck cards in format "RANK_SUIT" e.g. ["2_C", "A_H", "K_S"] */
    startingDeck: string[];

    /** Jokers available in this seed */
    jokers: Array<{
        id: string; // "weejoker"
        name: string; // "Wee Joker"
        ante: number;
        source: string; // 'shop', 'buffoon_pack', 'tag', etc.
        edition?: string;
    }>;

    /** Consumables (tarots, spectrals, planets) */
    consumables: Array<{
        id: string;
        name: string;
        type: string; // 'tarot', 'spectral', 'planet'
        ante: number;
        source: string;
    }>;

    /** Vouchers available */
    vouchers: Array<{
        id: string;
        name: string;
        ante: number;
    }>;

    /** Tags by ante */
    tags: Array<{
        ante: number;
        tag: string;
    }>;

    /** Boss blinds by ante */
    bosses: Array<{
        ante: number;
        boss: string;
    }>;

    // Detailed breakdown for UI (Strategy Modal)
    antes: Record<number, {
        boss: string;
        voucher: string;
        tags: string[];
        shopQueue: Array<{ name: string, price?: number, type: string, edition?: string, stickers?: string[] }>;
        packs: Array<{
            name: string;
            cards: Array<{ name: string, type: string, edition?: string }>;
        }>;
        deckDraws?: Record<string, Array<{ name: string, type: string }>>;
    }>;
}

/**
 * Analyze a Balatro seed using the local TS engine
 */
export function analyzeSeed(
    seed: string,
    deckSlug: string = 'erratic',
    stakeSlug: string = 'white',
    maxAnte: number = 8
): AnalyzedSeed {
    // Normalize Input
    const seedUpper = seed.toUpperCase().replace(/O/g, '0').trim(); // Balatro uses Zero not Oh

    // Map slugs to Enums
    // deckSlug might be "Red" or "red" -> DeckType.RED_DECK
    const deckKey = Object.keys(deckMap).find(k => k.toLowerCase().includes(deckSlug.toLowerCase())) || "Red Deck";
    const deckType = deckMap[deckKey] || DeckType.RED_DECK;

    const stakeKey = Object.keys(stakeMap).find(k => k.toLowerCase().includes(stakeSlug.toLowerCase())) || "White Stake";
    const stakeType = stakeMap[stakeKey] || StakeType.WHITE_STAKE;

    // Configuration
    const version = Version.v_101c;
    const cardsPerAnte = [15, 50, 50, 50, 50, 50, 50, 50]; // Default shop queue size

    // Instantiate Analyzer
    const analyzer = new BalatroAnalyzer(
        maxAnte,
        cardsPerAnte,
        new Deck(deckType),
        new Stake(stakeType),
        version,
        {
            analyzeArcana: true,
            analyzeBoss: true,
            analyzeCelestialPacks: true,
            analyzeJokers: true,
            analyzeShopQueue: true,
            analyzeSpectral: true,
            analyzeStandardPacks: true,
            analyzeTags: true,
        }
    );

    // Run Analysis
    const { run, game } = analyzer.performAnalysis({
        seed: seedUpper,
        ante: maxAnte,
        cardsPerAnte,
        deck: new Deck(deckType),
        stake: new Stake(stakeType),
        version
    });

    // Extract Results
    const rawResult: IResult[] = (analyzer.result as any).getResult; // Access protected/private if needed or public getter
    console.log("Analysis Result:", rawResult);

    // Transform to UI Format
    return transformAnalysis(seedUpper, deckKey, stakeKey, rawResult, game);
}

function transformAnalysis(
    seed: string,
    deckName: string,
    stakeName: string,
    results: IResult[],
    game: Game
): AnalyzedSeed {
    const output: AnalyzedSeed = {
        seed,
        deck: deckName,
        stake: stakeName,
        startingDeck: [],
        jokers: [],
        consumables: [],
        vouchers: [],
        tags: [],
        bosses: [],
        antes: {}
    };

    // 1. Get Starting Deck
    // We can use game.getDeckDraw(ante, round, count) - usually A1/R1 to see initial state
    try {
        const deckDraw = (game as any).getDeckDraw ? (game as any).getDeckDraw(1, 1, 52) : [];
        // Or if Game doesn't expose it easily, maybe we skip or implement basic deck generation
        // Found getDeckDraw in original Game.ts research? Wait, it wasn't in list_dir of balatrots/Game_ts...
        // Assuming we might need to implement getStartingDeck helper if not available
        // For now, let's use a simplified generator based on deck type
        output.startingDeck = generateStartingDeckStub(deckName);
    } catch (e) {
        console.warn("Could not get starting deck:", e);
    }

    // 2. Process Per-Ante Results
    results.forEach((res) => {
        if (!res) return;
        const ante = res.ante;

        // Init Ante Data
        output.antes[ante] = {
            boss: res.boss?.name || "Unknown",
            voucher: res.voucher || "None",
            tags: res.tags || [],
            shopQueue: [],
            packs: []
        };

        // Boss
        if (res.boss) {
            output.bosses.push({ ante, boss: res.boss.name });
        }

        // Voucher
        if (res.voucher) {
            output.vouchers.push({ ante, name: res.voucher, id: res.voucher.toLowerCase().replace(/ /g, '_') });
        }

        // Tags
        res.tags?.forEach(tag => {
            output.tags.push({ ante, tag });
        });

        // Shop Queue
        res.shop.forEach(item => {
            const { name, type, edition, stickers } = parseItem(item);

            output.antes[ante].shopQueue.push({ name, type, edition, stickers: (stickers && stickers.length > 0) ? stickers : undefined });

            // Flatten for top-level arrays
            if (type === 'Joker') {
                output.jokers.push({ id: normalizeId(name), name, ante, source: 'shop', edition });
            } else if (['Tarot', 'Planet', 'Spectral'].includes(type)) {
                output.consumables.push({ id: normalizeId(name), name, type: type.toLowerCase(), ante, source: 'shop' });
            }
        });

        // Packs
        res.packs.forEach(pack => {
            const packName = pack.kind.toString(); // Enum to string?
            // BalatroAnalyzer uses PackKind enum.

            const packCards = pack.cards.map(card => {
                const { name, type, edition } = parseItem(card);

                // Flatten
                if (type === 'Joker') {
                    output.jokers.push({ id: normalizeId(name), name, ante, source: packName, edition });
                } else if (['Tarot', 'Planet', 'Spectral'].includes(type)) {
                    output.consumables.push({ id: normalizeId(name), name, type: type.toLowerCase(), ante, source: packName });
                }

                return { name, type, edition };
            });

            output.antes[ante].packs.push({
                name: packName,
                cards: packCards
            });
        });
    });

    return output;
}

// Helpers

function parseItem(item: Card | JokerData): { name: string, type: string, edition?: string, stickers?: string[] } {
    let name = "Unknown";
    let type = "Card";
    let edition: string | undefined;
    let stickers: string[] = [];

    // Check if JokerData
    if ('joker' in item) {
        const jd = item as JokerData;
        name = jd.name; // getter
        type = "Joker";
        if (jd.edition && jd.edition.toString() !== "No Edition") edition = jd.edition.toString(); // Check enum value

        if (jd.stickers.eternal) stickers.push('Eternal');
        if (jd.stickers.perishable) stickers.push('Perishable');
        if (jd.stickers.rental) stickers.push('Rental');
    } else {
        // Regular Card (could be Poker Hand Card or Consumable)
        const c = item as Card | any;
        name = c.getName ? c.getName() : (c.name || "Unknown");
        // Infer type from name lists?
        // Or check if it has a type property?
        // ItemImpl has getName.
        // Assuming ItemImpl/Card structure
        // Let's guess type based on known lists or just return "Consumable"
        if (name.includes('Planet') || ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(name)) type = 'Planet';
        else if (['Fool', 'Magician', 'Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers', 'Chariot', 'Justice', 'Hermit', 'Wheel', 'Strength', 'Hanged Man', 'Death', 'Temperance', 'Devil', 'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'World'].some(t => name.includes(t))) type = 'Tarot';
        else if (['Familiar', 'Grim', 'Incantation', 'Talisman', 'Aura', 'Wraith', 'Sigil', 'Ouija', 'Ectoplasm', 'Immolate', 'Ankh', 'Deja Vu', 'Hex', 'Trance', 'Medium', 'Cryptid', 'The Soul', 'Black Hole'].includes(name)) type = 'Spectral';
        else type = "Card";
    }

    return { name, type, edition, stickers };
}

function normalizeId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function generateStartingDeckStub(deckName: string): string[] {
    // Simple stub to return a standard 52 card deck
    // If erratic, maybe verify if we can get real deck from Game later?
    // For now, return empty or standard.
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = ['S', 'H', 'D', 'C']; // Spades, Hearts, Diamonds, Clubs
    const deck: string[] = [];
    for (const s of suits) {
        for (const r of ranks) {
            deck.push(`${r}_${s}`);
        }
    }
    // TODO: erratic deck logic
    return deck;
}
