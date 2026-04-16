const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'public', 'seeds.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
console.log(`Found ${lines.length} lines in CSV`);

if (lines.length === 0) {
    console.error("CSV empty");
    process.exit(1);
}

// BATCH SIZE 50 is safe for D1 (limit is 100KB per statement)
const BATCH_SIZE = 50;
let currentBatch = 0;
let inserts = [];

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Naively split by comma (works for this dataset)
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));

    // Day = Row Index
    const day = i;

    // seed is text, others are numbers.
    // We treat seed as string, rest as numbers or NULL if empty
    const seed = values[0];
    const otherValues = values.slice(1).map(v => v === '' ? 'NULL' : v);

    // Generate (1, 'SEED', 10, ...) string
    const valueGroup = `(${day}, '${seed}', ${otherValues.join(', ')})`;
    inserts.push(valueGroup);

    if (inserts.length >= BATCH_SIZE) {
        writeBatch();
    }
}

if (inserts.length > 0) {
    writeBatch();
}

function writeBatch() {
    currentBatch++;
    const fileName = `seeds_final_${currentBatch}.sql`;

    // IMPORTANT: We use INSERT INTO DailySeeds VALUES (...) 
    // This assumes the values are in the EXACT order of the columns in the table definition.
    // Since we created the table FROM the CSV headers, this is correct.
    const sql = `INSERT INTO DailySeeds VALUES \n${inserts.join(',\n')};`;

    fs.writeFileSync(path.join(__dirname, fileName), sql);
    console.log(`Created ${fileName}`);
    inserts = [];
}
