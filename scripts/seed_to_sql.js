const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../public/seeds.csv');
const OUTPUT_SQL = path.join(__dirname, '../amen_seeds.sql');

console.log(`Starting Seed to SQL Conversion...`);
console.log(`CSV Path: ${CSV_PATH}`);

if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: seeds.csv not found at ${CSV_PATH}`);
    process.exit(1);
}

try {
    const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = fileContent.split('\n').filter(l => l.trim() !== '');

    if (lines.length < 2) {
        console.error("CSV file is empty or has no data rows.");
        process.exit(1);
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const dataRows = lines.slice(1);

    console.log(`Found ${dataRows.length} seed rows. Generating SQL...`);

    let sqlContent = "INSERT INTO DailySeeds (day, seed, data) VALUES \n";
    let batchSize = 1000; // Batch inserts to avoid parser limits
    let currentBatch = [];

    // Clear the file initially
    fs.writeFileSync(OUTPUT_SQL, "-- Generated Seed Data\nDELETE FROM DailySeeds;\n\n");

    dataRows.forEach((line, index) => {
        const dayNumber = index + 1;
        const values = line.split(',');
        const seedObj = {};

        // 1. Parse CSV Line to JSON Object
        headers.forEach((header, i) => {
            if (i < values.length) {
                const rawVal = values[i].trim().replace(/^"|"$/g, '');
                const numVal = Number(rawVal);
                seedObj[header] = (rawVal === '' || isNaN(numVal)) ? rawVal : numVal;
            } else {
                seedObj[header] = null;
            }
        });
        seedObj.day_number = dayNumber;

        // 2. Extract specific columns for SQL columns (optimization)
        const seed = seedObj.seed;
        const dataJson = JSON.stringify(seedObj).replace(/'/g, "''"); // Escape single quotes for SQL

        // 3. Add to batch
        currentBatch.push(`(${dayNumber}, '${seed}', '${dataJson}')`);

        // 4. Flush batch if full or last item
        if (currentBatch.length >= batchSize || index === dataRows.length - 1) {
            const insertStmt = `INSERT INTO DailySeeds (day, seed, data) VALUES \n${currentBatch.join(",\n")};\n\n`;
            fs.appendFileSync(OUTPUT_SQL, insertStmt);
            currentBatch = [];
            console.log(`Processed ${index + 1} / ${dataRows.length}`);
        }
    });

    console.log(`✅ Successfully generated SQL at ${OUTPUT_SQL}`);
    console.log(`Run this to import:`);
    console.log(`npx wrangler d1 execute weejoker-scores --file=./amen_seeds.sql --remote`);

} catch (err) {
    console.error("Fatal error during generation:", err);
    process.exit(1);
}
