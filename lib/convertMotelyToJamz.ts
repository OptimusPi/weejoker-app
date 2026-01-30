/**
 * Converts Motely JSON output to JAMZ format
 * 
 * Motely already provides perfect JSON output with all the data we need.
 * This is much simpler than trying to integrate Blueprint's TypeScript classes.
 */

export interface RelevantEvent {
    ante: number;
    source: 'shop' | 'arcana_pack' | 'spectral_pack' | 'celestial_pack' | 'buffoon_pack' | 'standard_pack' | 'tag' | 'boss_blind' | 'voucher';
    type: 'joker' | 'tarot' | 'spectral' | 'planet' | 'voucher';
    id: string;
    edition?: 'negative' | 'polychrome' | 'foil' | 'holographic';
    count?: number;
    displayName?: string;
}

export interface JamzSeedData {
    seed: string;
    deck: string;
    stake: string;
    score: number;
    twos: number;
    startingDeck: string[];
    relevantEvents: RelevantEvent[];
}

interface MotelyAnte {
    ante: number;
    boss: string;
    voucher: string;
    smallBlindTag: string;
    bigBlindTag: string;
    drawOrder: string | null;
    shopQueue: Array<{ id: string; name: string }>;
    packs: Array<{
        type: string;
        items: string[];
    }>;
}

interface MotelyOutput {
    seed: string;
    deck: string;
    stake: string;
    startingDeck: string[];
    twos: number;
    error: string | null;
    antes: MotelyAnte[];
}

// Important jokers to highlight
const IMPORTANT_JOKERS = [
    'Wee Joker', 'Hanging Chad', 'Hack', 'Blueprint', 'Brainstorm',
    'Showman', 'Perkeo', 'Madness', 'Baron', 'Invisible Joker'
];

// Planet names
const PLANETS = ['Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Planet X', 'Ceres', 'Eris', 'Mercury', 'Earth'];

// Spectral names
const SPECTRALS = ['Familiar', 'Grim', 'Incantation', 'Talisman', 'Aura', 'Wraith', 'Sigil', 'Ouija', 'Ectoplasm', 'Immolate', 'Ankh', 'Deja Vu', 'Hex', 'Trance', 'Medium', 'Cryptid', 'The Soul', 'Black Hole'];

function getItemType(itemName: string): 'joker' | 'tarot' | 'spectral' | 'planet' | 'voucher' {
    if (PLANETS.includes(itemName)) return 'planet';
    if (SPECTRALS.includes(itemName)) return 'spectral';
    if (itemName.includes('Joker')) return 'joker';
    return 'tarot';
}

function extractEdition(itemName: string): { cleanName: string; edition?: RelevantEvent['edition'] } {
    const editionPrefixes = ['Negative', 'Polychrome', 'Foil', 'Holographic'];

    for (const prefix of editionPrefixes) {
        if (itemName.startsWith(prefix + ' ')) {
            return {
                cleanName: itemName.substring(prefix.length + 1),
                edition: prefix.toLowerCase() as RelevantEvent['edition']
            };
        }
    }

    return { cleanName: itemName };
}

export function convertMotelyToJamz(
    motely: MotelyOutput,
    filterImportantOnly: boolean = true
): JamzSeedData {
    const events: RelevantEvent[] = [];

    // Extract events from each ante
    motely.antes.forEach((ante) => {
        // Shop items
        ante.shopQueue.forEach((item) => {
            const { cleanName, edition } = extractEdition(item.name);
            const itemType = getItemType(cleanName);

            // Filter: only include important jokers if filtering is on
            if (filterImportantOnly) {
                if (itemType === 'joker' && !IMPORTANT_JOKERS.some(name => cleanName.includes(name))) {
                    return;
                }
            }

            events.push({
                ante: ante.ante,
                source: 'shop',
                type: itemType,
                id: item.id.toLowerCase(),
                displayName: cleanName,
                edition
            });
        });

        // Pack items
        ante.packs.forEach((pack) => {
            const packTypeMap: Record<string, RelevantEvent['source']> = {
                'Arcana Pack': 'arcana_pack',
                'Jumbo Arcana Pack': 'arcana_pack',
                'Celestial Pack': 'celestial_pack',
                'Jumbo Celestial Pack': 'celestial_pack',
                'Mega Celestial Pack': 'celestial_pack',
                'Spectral Pack': 'spectral_pack',
                'Jumbo Spectral Pack': 'spectral_pack',
                'Buffoon Pack': 'buffoon_pack',
                'Jumbo Buffoon Pack': 'buffoon_pack',
                'Standard Pack': 'standard_pack',
                'Jumbo Standard Pack': 'standard_pack',
                'Mega Standard Pack': 'standard_pack'
            };

            const source = packTypeMap[pack.type] || 'standard_pack';

            pack.items.forEach((itemName) => {
                const { cleanName, edition } = extractEdition(itemName);
                const itemType = getItemType(cleanName);

                // Filter important jokers
                if (filterImportantOnly) {
                    if (itemType === 'joker' && !IMPORTANT_JOKERS.some(name => cleanName.includes(name))) {
                        return;
                    }
                }

                events.push({
                    ante: ante.ante,
                    source,
                    type: itemType,
                    id: cleanName.toLowerCase().replace(/\s+/g, ''),
                    displayName: cleanName,
                    edition
                });
            });
        });
    });

    // Calculate score based on relevant events
    const score = events.reduce((sum, e) => {
        if (e.type === 'joker') return sum + 100;
        if (e.edition) return sum + 50;
        return sum + 10;
    }, 0);

    return {
        seed: motely.seed,
        deck: motely.deck,
        stake: motely.stake,
        score,
        twos: motely.twos,
        startingDeck: motely.startingDeck,
        relevantEvents: events
    };
}
