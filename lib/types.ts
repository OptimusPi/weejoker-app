export interface SeedData {
    seed: string;
    score: number;

    // User's Renamed JAML Labels
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

    // Locked State
    isLocked?: boolean;

    // Allow for extras
    [key: string]: string | number | boolean | undefined;
}
