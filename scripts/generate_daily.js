const fs = require('fs');
const path = require('path');

// Logic:
// Script is in /web/scripts/
// CSV is in /web/public/seeds.csv
// Output is /web/public/daily/*.json

const CSV_PATH = path.join(__dirname, '../public/seeds.csv');
const OUTPUT_DIR = path.join(__dirname, '../public/daily');

console.log(`Starting Daily Seed Generation...`);
console.log(`CSV Path: ${CSV_PATH}`);
console.log(`Output Dir: ${OUTPUT_DIR}`);

if (!fs.existsSync(CSV_PATH)) {
    console.error(`ERROR: seeds.csv not found at ${CSV_PATH}`);
    process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Creating directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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

    console.log(`Found ${dataRows.length} seed rows. Generating JSON files...`);

    let successCount = 0;

    dataRows.forEach((line, index) => {
        const dayNumber = index + 1;
        const values = line.split(',');

        const seedObj = {};

        // Map headers to values
        headers.forEach((header, i) => {
            // Check bounds
            if (i < values.length) {
                const rawVal = values[i].trim().replace(/^"|"$/g, '');
                const numVal = Number(rawVal);
                // Store number if valid number, string otherwise (except specifically empty strings which remain strings)
                seedObj[header] = (rawVal === '' || isNaN(numVal)) ? rawVal : numVal;
            } else {
                seedObj[header] = null;
            }
        });

        // Explicit metadata
        seedObj.day_number = dayNumber;

        const outputPath = path.join(OUTPUT_DIR, `${dayNumber}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(seedObj));
        successCount++;
    });

    console.log(`✅ Successfully generated ${successCount} daily JSON files in ${OUTPUT_DIR}`);

} catch (err) {
    console.error("Fatal error during generation:", err);
    process.exit(1);
}
