const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/*
    scripts/bake_ritual.js
    
    Generates public/daily_ritual.json
    
    Logic:
    1. Reads Master Seeds (public/seeds.csv).
    2. Reads Theme CSVs (data/themes/*.csv).
    3. Generates 5 years of daily seeds starting from Dec 16, 2025.
       - Mon: monday.csv
       - Tue: tuesday.csv
       - ...
       - Sat/Sun: weekend.csv
    4. Outputs minimal JSON.
*/

const ALL_SEEDS_PATH = path.join(__dirname, '../public/seeds.csv');
const THEMES_DIR = path.join(__dirname, '../data/themes');
const OUTPUT_PATH = path.join(__dirname, '../public/daily_ritual.json');

// Epoch: Dec 16, 2025 (Same as App)
const START_DATE = new Date('2025-12-16T00:00:00Z');
const DAYS_TO_GENERATE = 365 * 5; // 5 Years

const THEME_FILES = {
    1: 'monday.csv',
    2: 'tuesday.csv',
    3: 'wednesday.csv',
    4: 'thursday.csv',
    5: 'friday.csv',
    6: 'weekend.csv', // Sat
    0: 'weekend.csv'  // Sun
};

function main() {
    console.log('🥣 Baking Daily Ritual...');

    // 1. Load Master Seeds
    if (!fs.existsSync(ALL_SEEDS_PATH)) {
        console.error('❌ Master seeds.csv missing.');
        return;
    }
    const allSeedsraw = fs.readFileSync(ALL_SEEDS_PATH, 'utf-8');
    const allSeeds = parse(allSeedsraw, { columns: true, skip_empty_lines: true });
    const masterMap = new Map();
    allSeeds.forEach(s => masterMap.set(s.seed, s));
    console.log(`📚 Loaded ${allSeeds.length} master seeds.`);

    // 2. Load Themes
    const themes = {};
    for (const [dayNum, filename] of Object.entries(THEME_FILES)) {
        const filePath = path.join(THEMES_DIR, filename);
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const rows = parse(raw, { columns: true, skip_empty_lines: true });
            // Extract just the seed IDs
            themes[dayNum] = rows.map(r => r.Seed).filter(s => s && s.length > 0);
        } else {
            console.warn(`⚠️ Missing theme file: ${filename}`);
            themes[dayNum] = [];
        }
    }

    // 3. Generate Schedule
    const schedule = [];

    for (let dayOffset = 0; dayOffset < DAYS_TO_GENERATE; dayOffset++) {
        // Calculate Date & Day of Week
        const currentDate = new Date(START_DATE.getTime() + (dayOffset * 86400000));
        const dayOfWeek = currentDate.getUTCDay(); // 0 = Sun, 1 = Mon...

        const themeList = themes[dayOfWeek];

        if (!themeList || themeList.length === 0) {
            schedule.push(null); // No seed for this day
            continue;
        }

        // Pick seed (Cycle through list)
        // If list has 5 seeds: Day 0 gets index 0, Day 7 gets index 1, ...
        // We need a separate counter for each theme to cycle evenly? 
        // Simple modulo: (dayOffset / 7) % length? No that's erratic.
        // Better: Count how many Mondays have passed.

        // Actually, simplest is just modulo of the dayOffset? No.
        // Let's implement a per-theme counter.
        // But we are in a simple loop.
        // Let's deduce index:
        // How many times has this weekday occurred? = Math.floor(dayOffset / 7)

        const themeIndex = Math.floor(dayOffset / 7) % themeList.length;
        const seedId = themeList[themeIndex];

        const stats = masterMap.get(seedId);

        if (!stats) {
            // Seed ID in theme file but not in master list
            if (themeIndex === 0) console.warn(`⚠️ Theme seed ${seedId} (Day ${dayOffset + 1}) not found in master.`);
            schedule.push(null);
            continue;
        }

        // 4. Optimize Output Object
        // Day 1 is Index 0.
        // We only store essential data to keep file small.
        schedule.push({
            id: seedId,
            score: parseInt(stats.score) || 0,
            twos: parseInt(stats.twos) || 0,
            // Add other joker checks if > 0
            wj1: parseInt(stats.WeeJoker_Ante1) || undefined,
            wj2: parseInt(stats.WeeJoker_Ante2) || undefined,
            hc1: parseInt(stats.HanginChad_Ante1) || undefined,
            hc2: parseInt(stats.HanginChad_Ante2) || undefined,
            hk1: parseInt(stats.Hack_Ante1) || undefined,
            hk2: parseInt(stats.Hack_Ante2) || undefined,
            bp: parseInt(stats.blueprint_early) || undefined,
            bs: parseInt(stats.brainstorm_early) || undefined,
            sh: parseInt(stats.Showman_Ante1) || undefined,
            rs: parseInt(stats.red_Seal_Two) || undefined
        });
    }

    // 5. Write
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(schedule));
    console.log(`🍞 Baked ${schedule.length} days into daily_ritual.json`);
    console.log(`📦 Size: ${(fs.statSync(OUTPUT_PATH).size / 1024).toFixed(2)} KB`);
}

main();
