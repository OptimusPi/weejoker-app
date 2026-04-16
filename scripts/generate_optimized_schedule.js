const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const SEEDS_CSV_PATH = path.join(__dirname, '../public/seeds.csv');
const OUTPUT_JSON_PATH = path.join(__dirname, '../data/daily-seeds.json');

function generateOptimizedSchedule() {
    console.log('Reading seeds.csv...');
    const csvContent = fs.readFileSync(SEEDS_CSV_PATH, 'utf-8');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    });

    console.log(`Found ${records.length} records. Shuffling and optimizing...`);

    // Shuffle
    for (let i = records.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [records[i], records[j]] = [records[j], records[i]];
    }

    // Optimize
    const optimizedRecords = records.map(r => {
        const o = {
            seed: r.seed,
            score: parseInt(r.score, 10) || 0,
            twos: parseInt(r.twos, 10) || 0
        };

        // Sparse fields - only add if > 0
        // Helper to check and add
        const addIfGt0 = (key) => {
            const val = parseInt(r[key], 10);
            if (val > 0) o[key] = val;
        };

        addIfGt0('WeeJoker_Ante1');
        addIfGt0('WeeJoker_Ante2');
        addIfGt0('HanginChad_Ante1');
        addIfGt0('HanginChad_Ante2');
        addIfGt0('Hack_Ante1');
        addIfGt0('Hack_Ante2');

        // Note: CSV column names might differ slightly from types.ts interface
        // CSV: blueprint_early, brainstorm_early
        addIfGt0('blueprint_early');
        addIfGt0('brainstorm_early');

        return o;
    });

    const jsonContent = JSON.stringify(optimizedRecords);
    const sizeBytes = Buffer.byteLength(jsonContent, 'utf8');
    const sizeMB = sizeBytes / (1024 * 1024);

    console.log(`Optimized JSON size: ${sizeMB.toFixed(2)} MB`);
    console.log(`Writing to ${OUTPUT_JSON_PATH}...`);
    fs.writeFileSync(OUTPUT_JSON_PATH, jsonContent);
    console.log('Done!');
}

generateOptimizedSchedule();
