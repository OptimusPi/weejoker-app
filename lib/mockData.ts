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
        // Random count for Rank 2 (Twos)
        const rank2 = Math.floor(Math.random() * 20); // 0 to 20 twos

        // Scores (Rating)
        const score = Math.floor(Math.random() * 200);

        return {
            seed: generateRandomSeed(),
            score: score,
            twos: rank2,

            // Randomly assign joker availability
            wee_a1_cheap: Math.random() > 0.8 ? 1 : 0,
            hack_a1: Math.random() > 0.8 ? 1 : 0,
            chad_a1: Math.random() > 0.9 ? 1 : 0,
            copy_jokers_a1: Math.random() > 0.9 ? 1 : 0,
            drinks_a1: Math.random() > 0.7 ? 1 : 0
        };
    });
}

export const MOCK_SEEDS = generateMockSeeds(100);
