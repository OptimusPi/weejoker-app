const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { execSync } = require('child_process');

/*
    scripts/deploy_seeds.js
    Usage: node scripts/deploy_seeds.js [--prod]
    
    1. Fetches MAX(day) from D1 (Local or Remote).
    2. Reads curated_seeds.csv.
    3. Filters for Days > MAX(day).
    4. Generates incremental SQL.
    5. Executes SQL.
*/

const IS_PROD = process.argv.includes('--prod');
const ENV_FLAG = IS_PROD ? '--remote' : '--local';
const CURATION_PATH = path.join(__dirname, '../curated_seeds.csv');
const ALL_SEEDS_PATH = path.join(__dirname, '../public/seeds.csv');
const SQL_OUTPUT_PATH = path.join(__dirname, '../incremental_deploy.sql');

function executeD1(sql) {
    // Helper to run small queries and get JSON result
    // Note: Wrangler output for SELECT is JSON
    try {
        // Only works for simple queries without special chars issue in shell
        const cmd = `npx wrangler d1 execute DailyWee ${ENV_FLAG} --command "${sql}" --json`;
        const output = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }); // Pipe stdout, ignore stderr to keep it clean
        return JSON.parse(output)[0].results; // D1 returns array of result sets
    } catch (e) {
        console.error("D1 Query Error", e.message);
        return null;
    }
}

function main() {
    console.log(`🚀 Starting Smart Sync (${IS_PROD ? 'PRODUCTION' : 'LOCAL'})...`);

    // 1. Get Current State
    console.log('🔍 Checking database state...');
    const result = executeD1("SELECT MAX(day) as max_day FROM DailySeeds");

    // Safety check
    if (!result) {
        console.error("❌ Could not read database. Does the table exist?");
        console.log("   Try running: npx wrangler d1 execute DailyWee --local --file=schema.sql");
        return;
    }

    const currentMaxDay = result[0].max_day || 0;
    console.log(`📊 Current Max Day in DB: ${currentMaxDay}`);

    // 2. Read Local Curation
    if (!fs.existsSync(CURATION_PATH)) {
        console.error("❌ curated_seeds.csv not found.");
        return;
    }
    const curationContent = fs.readFileSync(CURATION_PATH, 'utf-8');
    const curation = parse(curationContent, { columns: true, skip_empty_lines: true });

    // 3. Filter for New Data
    const newRows = curation.filter(row => parseInt(row.Day, 10) > currentMaxDay);

    if (newRows.length === 0) {
        console.log("✅ Database is up to date. No new days to push.");
        return;
    }

    console.log(`📦 Found ${newRows.length} new days to deploy (Days ${newRows[0].Day} to ${newRows[newRows.length - 1].Day}).`);

    // 4. Build SQL
    console.log('📖 Reading master seed list...');
    // Only read master list if we actually have work to do
    const allSeedsContent = fs.readFileSync(ALL_SEEDS_PATH, 'utf-8');
    const allSeeds = parse(allSeedsContent, { columns: true, skip_empty_lines: true });
    const seedMap = new Map();
    allSeeds.forEach(s => seedMap.set(s.seed, s));

    let sql = "";
    let validCount = 0;

    newRows.forEach(row => {
        const day = parseInt(row.Day, 10);
        const seedId = row.Seed;
        if (!seedId) return;

        const s = seedMap.get(seedId);
        if (!s) {
            console.warn(`⚠️ Warning: Seed ${seedId} (Day ${day}) not found in master list. Skipping.`);
            return;
        }

        const val = (k) => s[k] ? parseInt(s[k], 10) : 0;

        // Single line insert to minimize file size issues
        sql += `INSERT INTO DailySeeds (day, seed, score, twos, WeeJoker_Ante1, WeeJoker_Ante2, HanginChad_Ante1, HanginChad_Ante2, Hack_Ante1, Hack_Ante2, blueprint_early, brainstorm_early, Showman_Ante1, red_Seal_Two) VALUES (${day}, '${s.seed}', ${val('score')}, ${val('twos')}, ${val('WeeJoker_Ante1')}, ${val('WeeJoker_Ante2')}, ${val('HanginChad_Ante1')}, ${val('HanginChad_Ante2')}, ${val('Hack_Ante1')}, ${val('Hack_Ante2')}, ${val('blueprint_early')}, ${val('brainstorm_early')}, ${val('Showman_Ante1')}, ${val('red_Seal_Two')});\n`;
        validCount++;
    });

    if (validCount === 0) {
        console.log("⚠️ No valid seeds found to push.");
        return;
    }

    fs.writeFileSync(SQL_OUTPUT_PATH, sql);

    // 5. Execute
    console.log(`🚀 Uploading ${validCount} new days...`);
    try {
        execSync(`npx wrangler d1 execute DailyWee ${ENV_FLAG} --file=${SQL_OUTPUT_PATH}`, { stdio: 'inherit' });
        console.log('🎉 Deploy Complete!');
    } catch (e) {
        console.error('❌ Failed to execute deployment.');
    }
}

main();
