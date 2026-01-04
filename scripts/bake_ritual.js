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

const START_DATE = new Date('2025-12-19T00:00:00Z'); // Day 1 = Dec 19
const DAYS_TO_GENERATE = 365;

const THEME_INFO = {
    1: { name: 'Madness Monday', bucket: 'Monday', joker: 'Madness' },
    2: { name: 'Twosday', bucket: 'Tuesday', joker: 'Joker' },
    3: { name: 'Wee Wednesday', bucket: 'Wednesday', joker: 'Wee Joker' },
    4: { name: 'Threshold Thursday', bucket: 'Thursday', joker: 'Joker' },
    5: { name: 'Foil Friday', bucket: 'Friday', joker: 'Joker' },
    6: { name: 'Weekend Ritual', bucket: 'Weekend', joker: 'Joker' },
    0: { name: 'Weekend Ritual', bucket: 'Weekend', joker: 'Joker' }
};

function main() {
    try {
        console.log('🥣 Baking Daily Ritual from Curated Pool...');

        // 1. Load Seeds and bucket them by Day
        const raw = fs.readFileSync(ALL_SEEDS_PATH, 'utf-8');
        const allSeeds = parse(raw, { columns: true, skip_empty_lines: true });

        const buckets = {
            'Monday': [],
            'Tuesday': [],
            'Wednesday': [],
            'Thursday': [],
            'Friday': [],
            'Weekend': []
        };

        allSeeds.forEach(s => {
            const dayType = s.Day || 'Weekend'; // Default to Weekend if missing
            if (buckets[dayType]) {
                buckets[dayType].push(s);
            } else {
                // Fallback for case sensitivity or typos
                const found = Object.keys(buckets).find(b => b.toLowerCase() === dayType.toLowerCase());
                if (found) buckets[found].push(s);
                else buckets['Weekend'].push(s);
            }
        });

        console.log(`📚 Pool Stats:`);
        Object.entries(buckets).forEach(([name, list]) => {
            console.log(`   - ${name}: ${list.length} seeds`);
        });

        // 2. Generate Schedule
        const schedule = [];

        for (let dayOffset = 0; dayOffset < DAYS_TO_GENERATE; dayOffset++) {
            const currentDate = new Date(START_DATE.getTime() + (dayOffset * 86400000));
            const dayOfWeek = currentDate.getUTCDay();
            const config = THEME_INFO[dayOfWeek];

            const pool = buckets[config.bucket];
            if (!pool || pool.length === 0) {
                console.warn(`⚠️ No seeds found for ${config.bucket} on Day ${dayOffset + 1}`);
                schedule.push(null);
                continue;
            }

            // Deterministic pick based on dayOffset so the schedule is stable
            const stats = pool[dayOffset % pool.length];

            schedule.push({
                id: stats.seed || stats.id,
                t: stats.themeName || config.name,
                j: stats.themeJoker || config.joker,
                s: parseInt(stats.score || stats.s) || 0,
                w: parseInt(stats.twos || stats.w) || 0,
                wj1: parseInt(stats.WeeJoker_Ante1 || stats.wj1) || undefined,
                wj2: parseInt(stats.WeeJoker_Ante2 || stats.wj2) || undefined,
                hc1: parseInt(stats.HanginChad_Ante1 || stats.hc1) || undefined,
                hc2: parseInt(stats.HanginChad_Ante2 || stats.hc2) || undefined,
                hk1: parseInt(stats.Hack_Ante1 || stats.hk1) || undefined,
                hk2: parseInt(stats.Hack_Ante2 || stats.hk2) || undefined,
                bp: parseInt(stats.blueprint_early || stats.bp) || undefined,
                bs: parseInt(stats.brainstorm_early || stats.bs) || undefined,
                sh: parseInt(stats.Showman_Ante1 || stats.sh) || undefined,
                rs: parseInt(stats.red_Seal_Two || stats.rs) || undefined,
                t1: parseInt(stats.Theme_Card_Ante1 || stats.t1) || undefined,
                t2: parseInt(stats.Theme_Card_Ante2 || stats.t2) || undefined
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
