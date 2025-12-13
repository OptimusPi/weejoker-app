import { SeedData } from "./types";

function generateRandomSeed(): string {
    const chars = "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function generateMockSeeds(count: number = 50): SeedData[] {
    return Array.from({ length: count }).map(() => {
        // Erratic deck varies, but let's assume standard deck size roughly 52 cards total usually
        // Distribution varies wildy.

        // Random counts for suits
        const hearts = Math.floor(Math.random() * 20);
        const diamonds = Math.floor(Math.random() * 20);
        const clubs = Math.floor(Math.random() * 20);
        const spades = Math.floor(Math.random() * 20);

        // Random count for Rank 2 (for Wee Joker)
        const rank2 = Math.floor(Math.random() * 10);

        // Scores
        const weeScore = rank2 * 10 + Math.floor(Math.random() * 50);
        const hackScore = Math.floor(Math.random() * 100);
        const runScore = Math.floor(Math.random() * 1000);

        return {
            seed: generateRandomSeed(),
            run_score: runScore,
            joker_wee: weeScore,
            joker_hack: hackScore,
            rank_2_count: rank2,
            suit_hearts: hearts,
            suit_diamonds: diamonds,
            suit_clubs: clubs,
            suit_spades: spades,
        };
    });
}

export const MOCK_SEEDS = generateMockSeeds(100);
