const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// 1. The Source of Truth for *Available* Seeds
const ALL_SEEDS_PATH = path.join(__dirname, '../public/seeds.csv');

// 2. The User's Curation File (Day -> Seed Mapping)
const CURATION_PATH = path.join(__dirname, '../curation_template.csv');

// 3. The Output for the App
const OUTPUT_JSON_PATH = path.join(__dirname, '../data/daily-seeds.json');

function buildCuratedSchedule() {
    if (!fs.existsSync(CURATION_PATH)) {
        console.error("Error: curation_template.csv not found.");
        return;
    }

    console.log('Reading all available seeds...');
    const allSeedsContent = fs.readFileSync(ALL_SEEDS_PATH, 'utf-8');
    const allSeeds = parse(allSeedsContent, { columns: true, skip_empty_lines: true });

    // Index for fast lookup
    const seedMap = new Map();
    allSeeds.forEach(s => seedMap.set(s.seed, s));

    console.log('Reading curation schedule...');
    const curationContent = fs.readFileSync(CURATION_PATH, 'utf-8');
    const curation = parse(curationContent, { columns: true, skip_empty_lines: true });

    const schedule = [];

    curation.forEach(row => {
        const day = parseInt(row.Day, 10);
        const seedId = row.Seed;

        if (!seedId) return; // Skip empty rows

        const seedData = seedMap.get(seedId);
        if (!seedData) {
            console.warn(`WARNING: Seed ${seedId} for Day ${day} not found in master list.`);
            return;
        }

        // Optimize Data
        const o = {
            seed: seedData.seed,
            score: parseInt(seedData.score, 10) || 0,
            twos: parseInt(seedData.twos, 10) || 0
        };

        const addIfGt0 = (key) => {
            const val = parseInt(seedData[key], 10);
            if (val > 0) o[key] = val;
        };

        addIfGt0('WeeJoker_Ante1');
        addIfGt0('WeeJoker_Ante2');
        addIfGt0('HanginChad_Ante1');
        addIfGt0('HanginChad_Ante2');
        addIfGt0('Hack_Ante1');
        addIfGt0('Hack_Ante2');
        addIfGt0('blueprint_early');
        addIfGt0('brainstorm_early');
        addIfGt0('Showman_Ante1');
        addIfGt0('red_Seal_Two');

        // We place it at the correct index (Day 1 -> Index 0)
        schedule[day - 1] = o;
    });

    // Fill gaps with null or error if needed?
    // For now, let's just write the array. undefined info will be null in JSON.
    for (let i = 0; i < schedule.length; i++) {
        if (!schedule[i]) {
            console.warn(`Warning: Day ${i + 1} has no seed.`);
            schedule[i] = null;
        }
    }

    console.log(`Writing ${schedule.length} days to ${OUTPUT_JSON_PATH}...`);
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(schedule));
    console.log('Done!');
}

buildCuratedSchedule();
