// Balatro deck types
export type DeckType =
    | 'red' | 'blue' | 'yellow' | 'green' | 'black'
    | 'magic' | 'nebula' | 'ghost' | 'abandoned' | 'checkered'
    | 'zodiac' | 'painted' | 'anaglyph' | 'plasma' | 'erratic';

// Balatro stake types
export type StakeType =
    | 'white' | 'red' | 'green' | 'black'
    | 'blue' | 'purple' | 'orange' | 'gold';

/**
 * Configuration for a Daily Ritual challenge
 * Matches the dailyritual.schema.json structure
 */
export interface RitualConfig {
    filterId: string;       // e.g. "wee_joker_daily"
    searchId: string;       // e.g. "wee_joker_daily__erratic_white"
    deck: DeckType;
    stake: StakeType;
    seeds: string;          // Path to seeds file
    name: string;           // Display name
    author: string;         // Curator username
    description?: string;   // Brief description
    tutorial?: string;      // How to use this seed
    epoch?: string;         // ISO date-time for Day 1
    icon?: string;          // Emoji for the ritual
    color?: string;         // Theme color (CSS value)
}

/**
 * Seed data record from the seeds file
 * Core fields (seed, score) are always present
 * All other fields are dynamic based on the JAML filter columns
 */
export interface SeedData {
    seed: string;
    score: number;

    // Common JAML labels for The Daily Wee
    // These can vary based on the ritual's JAML filter
    twos?: number;

    // Wee Joker
    WeeJoker_Ante1?: number;
    WeeJoker_Ante2?: number;

    // Hanging Chad
    HanginChad_Ante1?: number;
    HanginChad_Ante2?: number;

    // Hack
    Hack_Ante1?: number;
    Hack_Ante2?: number;

    // Copy Jokers
    blueprint_early?: number;
    brainstorm_early?: number;

    // Showman
    Showman_Ante1?: number;

    // Specific Cards
    red_Seal_Two?: number;
    polychrome_Twop?: number;

    // Consumables/Other
    InvisibleJoker?: number;
    Temperance?: number;
    Ankh_Ante1?: number;

    // Dynamic fields from JAML filter
    // Column names are derived from the filter's "label" fields
    [key: string]: string | number | boolean | undefined;
}
