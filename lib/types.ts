export interface SeedData {
    seed: string;
    run_score?: number; // This will now represent "Target Wee Chips"

    // Core Jokers
    joker_wee?: number | boolean;
    joker_hack?: number | boolean;
    joker_wee_edition?: 'base' | 'foil' | 'holo' | 'poly' | 'negative';
    joker_hack_edition?: 'base' | 'foil' | 'holo' | 'poly' | 'negative';

    // Strategy
    strategy_note?: string;

    // Deck Composition (Rank 2s are critical for Wee)
    rank_2_count?: number;

    // Suits
    suit_hearts?: number;
    suit_diamonds?: number;
    suit_clubs?: number;
    suit_spades?: number;
    // Dynamic fields for other potential stats
    [key: string]: string | number | boolean | undefined;
}
