const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/*
    scripts/bake_ritual.js
    
    Generates public/daily_ritual.json
    
    Logic:
    1. Reads Master Seeds (public/seeds.csv).
    2. Reads Theme CSVs (data/themes/*.csv) with full header support.
    3. Generates 5 years of daily seeds starting from Dec 16, 2025.
    4. Injects theme metadata and mappings for UI.
*/

const ALL_SEEDS_PATH = path.join(__dirname, '../public/seeds.csv');
const OUTPUT_PATH = path.join(__dirname, '../public/daily_ritual.json');

const START_DATE = new Date('2025-12-20T00:00:00Z'); // Day 1 = Dec 20
const DAYS_TO_GENERATE = 7;

const THEME_INFO = {
    1: { name: 'Madness Monday', joker: 'Madness' },
    2: { name: 'Twosday', joker: 'Joker' },
    3: { name: 'Wee Wednesday', joker: 'Wee Joker' },
    4: { name: 'Threshold Thursday', joker: 'Joker' },
    5: { name: 'Foil Friday', joker: 'Joker' },
    6: { name: 'Weekend Ritual', joker: 'Joker' },
    0: { name: 'Weekend Ritual', joker: 'Joker' }
};

function main() {
    try {
        console.log('🥣 Baking Daily Ritual from Single Source...');

        // 1. Load Master Seeds and Categorize by Theme
        const masterMap = new Map();
        let allSeeds = [];

        if (fs.existsSync(ALL_SEEDS_PATH)) {
            const raw = fs.readFileSync(ALL_SEEDS_PATH, 'utf-8');
            allSeeds = parse(raw, { columns: true, skip_empty_lines: true });

            allSeeds.forEach(s => {
                masterMap.set(s.seed, s);
            });
            console.log(`📚 Loaded ${allSeeds.length} seeds.`);
        } else {
            throw new Error(`Master seeds not found at ${ALL_SEEDS_PATH}`);
        }

        // 2. Generate Schedule
        const schedule = [];

        for (let dayOffset = 0; dayOffset < DAYS_TO_GENERATE; dayOffset++) {
            const currentDate = new Date(START_DATE.getTime() + (dayOffset * 86400000));
            const dayOfWeek = currentDate.getUTCDay();
            const info = THEME_INFO[dayOfWeek];

            // Pick a seed. For now, just cycle through all available seeds.
            // Once the user provides themed seeds, this will pivot to themeBuckets picks.
            const seedIndex = dayOffset % allSeeds.length;
            const stats = allSeeds[seedIndex];

            if (!stats) {
                schedule.push(null);
                continue;
            }

            schedule.push({
                id: stats.seed,
                t: info.name,    // Theme Name from config
                j: info.joker,   // Theme Joker from config
                s: parseInt(stats.score) || 0,
                w: parseInt(stats.twos) || 0,
                wj1: parseInt(stats.WeeJoker_Ante1) || undefined,
                wj2: parseInt(stats.WeeJoker_Ante2) || undefined,
                hc1: parseInt(stats.HanginChad_Ante1) || undefined,
                hc2: parseInt(stats.HanginChad_Ante2) || undefined,
                hk1: parseInt(stats.Hack_Ante1) || undefined,
                hk2: parseInt(stats.Hack_Ante2) || undefined,
                bp: parseInt(stats.blueprint_early) || undefined,
                bs: parseInt(stats.brainstorm_early) || undefined,
                sh: parseInt(stats.Showman_Ante1) || undefined,
                rs: parseInt(stats.red_Seal_Two) || undefined,
                t1: parseInt(stats.Theme_Card_Ante1) || undefined,
                t2: parseInt(stats.Theme_Card_Ante2) || undefined
            });
        }

        // 3. Write
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(schedule));
        console.log(`🍞 Baked ${schedule.length} days into daily_ritual.json`);
    } catch (error) {
        console.error('❌ Baking Failed:', error);
        process.exit(1);
    }
}

main();
