// Quick script to convert seeds.csv to SQL for D1 import (PROPER COLUMNS)
const fs = require('fs');

const csv = fs.readFileSync('public/seeds.csv', 'utf-8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',').map(h => h.replace(/"/g, '').replace(/ /g, '_').replace(/-/g, '_'));

// Key columns we care about (matching schema.sql)
const COLUMNS = ['day', 'seed', 'score', 'twos', 'WeeJoker_Ante1', 'WeeJoker_Ante2',
    'HanginChad_Ante1', 'HanginChad_Ante2', 'Hack_Ante1', 'Hack_Ante2',
    'blueprint_early', 'brainstorm_early', 'Showman_Ante1', 'red_Seal_Two',
    'polychrome_Two', 'InvisibleJoker', 'Temperance', 'Ankh_Ante1'];

const BATCH_SIZE = 100;
let sql = '';
let batchNum = 1;

for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const seed = values[0].replace(/"/g, '');
    const day = i;

    // Build values array matching column order
    const vals = [
        day,
        `'${seed}'`,
        values[1] || 0, // score
        values[2] || 0, // twos
        values[3] || 0, // WeeJoker_Ante1
        values[4] || 0, // WeeJoker_Ante2
        values[7] || 0, // HanginChad_Ante1
        values[8] || 0, // HanginChad_Ante2
        values[9] || 0, // Hack_Ante1
        values[10] || 0, // Hack_Ante2
        values[23] || 0, // blueprint_early
        values[24] || 0, // brainstorm_early
        values[27] || 0, // Showman_Ante1
        values[29] || 0, // red_Seal_Two
        values[30] || 0, // polychrome_Two
        values[31] || 0, // InvisibleJoker
        values[32] || 0, // Temperance
        values[33] || 0, // Ankh_Ante1
    ];

    sql += `INSERT INTO DailySeeds (${COLUMNS.join(',')}) VALUES (${vals.join(',')});\n`;

    if (i % BATCH_SIZE === 0) {
        fs.writeFileSync(`seeds_v2_batch_${batchNum}.sql`, sql);
        console.log(`Created seeds_v2_batch_${batchNum}.sql (rows ${i - BATCH_SIZE + 1}-${i})`);
        sql = '';
        batchNum++;
    }
}

// Write remaining
if (sql) {
    fs.writeFileSync(`seeds_v2_batch_${batchNum}.sql`, sql);
    console.log(`Created seeds_v2_batch_${batchNum}.sql`);
}

console.log('\nDone! Now run:');
console.log('1. wrangler d1 execute weejoker-scores --remote --file=schema.sql');
console.log('2. wrangler d1 execute weejoker-scores --remote --file=seeds_v2_batch_1.sql');
