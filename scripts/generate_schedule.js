const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const SEEDS_CSV_PATH = path.join(__dirname, '../public/seeds.csv');
const OUTPUT_JSON_PATH = path.join(__dirname, '../data/daily-seeds.json'); // Storing in data/ to keep it organized

// Create data dir if not exists
const dataDir = path.dirname(OUTPUT_JSON_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

function generateSchedule() {
    console.log('Reading seeds.csv...');
    const csvContent = fs.readFileSync(SEEDS_CSV_PATH, 'utf-8');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    });

    console.log(`Found ${records.length} records. Shuffling...`);

    // Deterministic Shuffle? Or true random?
    // User asked for "Randomizing Seed Data". If we run this once and commit the JSON, it is effectively a fixed schedule.
    // Using Math.random() is fine for the *generation* of the static file.

    for (let i = records.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [records[i], records[j]] = [records[j], records[i]];
    }

    // Minimize file size: Map to array of compact objects or just values if schema is fixed?
    // User code expects: seed, score, and the "joker" stats.
    // The CSV has many columns. Let's keep them all for now to be safe, but we could optimize later.

    console.log(`Writing to ${OUTPUT_JSON_PATH}...`);
    fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(records));
    console.log('Done!');
}

generateSchedule();
