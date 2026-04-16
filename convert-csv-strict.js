const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'public', 'seeds.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Split by line, handle varying line endings
const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);

if (lines.length === 0) {
    console.error("CSV is empty");
    process.exit(1);
}

// Parse headers
// Remove quotes and trim
const originalHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

// Normalize headers to match schema (spaces/hyphens to underscores)
const schemaColumns = originalHeaders.map(h => h.replace(/[\s-]/g, '_'));

// Create SQL
// We'll create multiple files to avoid "statement too long" or transaction limits
const BATCH_SIZE = 50;
let currentBatch = 0;
let inserts = [];

// Prepare output dir
// const outDir = path.join(__dirname, 'seed_sql');
// if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse values - naive split by comma is generally okay for this data since values are simple numbers/codes without internal commas
    // But strictly we should handle quotes. Based on user snippet, values are not quoted except maybe seed?
    // User snippet: 11JS8DL7,20,17...
    // Only header had quotes in user snippet. But let's handle " values just in case.
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

    // Day number is row index (1-based because 0 is header)
    const day = i;

    // Construct value string
    // seed is distinct (text), others are likely integers
    const seed = values[0];
    const otherValues = values.slice(1).map(v => v === '' ? 'NULL' : parseInt(v));

    // All columns: day, seed, ...rest
    // Schema: day, seed, score, ...

    const valueString = `(${day}, '${seed}', ${otherValues.join(', ')})`;
    inserts.push(valueString);

    if (inserts.length >= BATCH_SIZE) {
        writeBatch();
    }
}

// Write remaining
if (inserts.length > 0) {
    writeBatch();
}

function writeBatch() {
    currentBatch++;
    const fileName = `seeds_final_batch_${currentBatch}.sql`;
    const colList = ['day', 'seed', ...schemaColumns.slice(1)].join(', ');

    const sql = `INSERT INTO DailySeeds (${colList}) VALUES \n${inserts.join(',\n')};`;

    fs.writeFileSync(path.join(__dirname, fileName), sql);
    console.log(`Created ${fileName} with ${inserts.length} rows`);
    inserts = [];
}
