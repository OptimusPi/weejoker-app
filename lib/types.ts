export interface SeedData {
    seed: string;
    score: number; // The main rating/score
    twos: number;  // Count of Rank 2 cards

    // Joker Flags (0 or 1)
    wee_a1_cheap?: number;
    chad_a1?: number;
    chad_a2?: number;
    chad_a3?: number;
    hack_a1?: number;
    hack_a2?: number;
    hack_a3?: number;
    copy_jokers_a1?: number;
    copy_jokers_a2?: number;
    copy_jokers_a3?: number;
    copy_jokers_a4?: number;
    copy_jokers_a5?: number;
    drinks_a1?: number;
    drinks_a2?: number;
    drinks_a3?: number;
    drinks_a4?: number;
    drinks_a1thru8?: number;

    // Allow for DuckDB dynamic extras if needed
    [key: string]: string | number | undefined;
}
