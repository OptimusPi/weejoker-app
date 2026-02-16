const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

/*
    scripts/bake_ritual.js
    
    Generates public/daily_ritual.json
    
    Logic:
    1. Reads Master Seeds (public/seeds.csv).
    2. Reads Theme CSVs (data/themes/*.csv) with full header support.
    3. Generates 5 years of daily seeds starting from Dec 16, 2025.
    4. Injects theme metadata and mappings for UI.
*/

const ALL_SEEDS_PATH = path.join(__dirname, '../../seeds/TheDailyWee.csv');
const OUTPUT_PATH = path.join(__dirname, '../public/daily_ritual.json');

const START_DATE = new Date('2026-01-06T00:00:00Z'); // L A U N C H  D A T E
const DAYS_TO_GENERATE = 365;

const THEME_INFO = {
    1: { name: 'Madness Monday', bucket: 'Monday', joker: 'Madness' },
    2: { name: 'Twosday', bucket: 'Tuesday', joker: 'Joker' },
    3: { name: 'Wee Wednesday', bucket: 'Wednesday', joker: 'Wee Joker' },
    4: { name: 'Threshold Thursday', bucket: 'Thursday', joker: 'Joker' },
    5: { name: 'Foil Friday', bucket: 'Friday', joker: 'Joker' },
    6: { name: 'Weekend Ritual', bucket: 'Weekend', joker: 'Joker' },
    0: { name: 'Weekend Ritual', bucket: 'Weekend', joker: 'Joker' }
};

function main() {
    try {
        console.log('🥣 Baking Daily Ritual from Curated Pool...');

        // 1. Load Seeds and bucket them by Day
        let raw = fs.readFileSync(ALL_SEEDS_PATH, 'utf-8');

        // CLEANUP: Motely CLI sometimes outputs malformed headers with double quotes "" or newlines
        // We find the first newline and clean that line specifically.
        const lines = raw.split(/\r?\n/);
        if (lines.length > 0) {
            lines[0] = lines[0].replace(/""/g, '","'); // Fix missing commas/doubled quotes
            raw = lines.join('\n');
        }

        const allSeeds = parse(raw, {
            columns: true,
            skip_empty_lines: true,
            relax_quotes: true,
            relax_column_count: true
        });

        const buckets = {
            'Monday': [],
            'Tuesday': [],
            'Wednesday': [],
            'Thursday': [],
            'Friday': [],
            'Weekend': [],
            'Ultimate': []
        };

        // Classify each seed into a bucket based on its properties
        function classifySeed(s) {
            // Helper to safely get int value
            const getInt = (keys) => {
                for (const k of keys) {
                    if (s[k] !== undefined && s[k] !== '' && s[k] !== null) {
                        return parseInt(s[k]) || 0;
                    }
                }
                return 0;
            };

            const twos = getInt(['Two', 'twos', 'w']);
            const perkeo = getInt(['Perkeo', 'Perkeo A1-4']);
            const negWee = getInt(['Negative WeeJoker A1-2', 'Negative_WeeJoker']);
            const negChad = getInt(['Negative HangingChad A1-2']);
            const negHack = getInt(['Negative Hack A1-2']);
            const polyWee = getInt(['Polychrome WeeJoker A1-2']);
            const holoWee = getInt(['Holographic WeeJoker A1-2']);
            const foilWee = getInt(['Foil WeeJoker A1-2']);

            const showman = getInt(['Showman A1', 'Showman_Ante1', 'Showman A1-2', 'sh']);
            const hackA1 = getInt(['Hack A1', 'hk1']);
            const hackA2 = getInt(['Hack A2', 'hk2']);
            const totalHacks = (hackA1 >= 1 ? 1 : 0) + (hackA2 >= 1 ? 1 : 0) + (s['Hack A1'] > 1 ? (s['Hack A1'] - 1) : 0);
            // Better check for "2 Hacks":
            const rawHacks = getInt(['Hack A1', 'hk1']) + getInt(['Hack A2', 'hk2']);

            const blueprint = getInt(['Blueprint A1', 'blueprint_early']);
            const brainstorm = getInt(['Brainstorm A1', 'brainstorm_early']);

            // Priority classification (first match wins)

            // Ultimate: Perkeo (A1-4) AND Showman (A1-2) AND 2x Hack (A1-2)
            if (perkeo > 0 && showman > 0 && rawHacks >= 2) {
                return 'Ultimate';
            }

            // Friday: Has edition jokers (Poly/Holo/Foil)
            if (polyWee > 0 || holoWee > 0 || foilWee > 0) {
                return 'Friday';
            }

            // Monday: Has Negative copies (Chad/Hack) - powerful
            if (negChad > 0 || negHack > 0 || negWee > 0) {
                return 'Monday';
            }

            // Tuesday: High twos count (16+)
            if (twos >= 16) {
                return 'Tuesday';
            }

            // Thursday: Has Showman for mult stacking
            if (showman > 0) {
                return 'Thursday';
            }

            // Wednesday: Has Blueprint/Brainstorm for copies
            if (blueprint > 0 || brainstorm > 0) {
                return 'Wednesday';
            }

            // Default: Weekend
            return 'Weekend';
        }

        allSeeds.forEach(s => {
            // Use existing Day column if present, otherwise classify
            let dayType = s.Day;
            if (!dayType || dayType === '') {
                dayType = classifySeed(s);
            }

            if (buckets[dayType]) {
                buckets[dayType].push(s);
            } else {
                // Fallback for case sensitivity or typos
                const found = Object.keys(buckets).find(b => b.toLowerCase() === dayType.toLowerCase());
                if (found) buckets[found].push(s);
                else buckets['Weekend'].push(s);
            }
        });

        // 1b. Deterministic Shuffle of Buckets to prevent sequential seeds
        // Simple seeded random
        let seed = 42069;
        const random = () => {
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };

        Object.keys(buckets).forEach(key => {
            const list = buckets[key];
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
        });

        console.log(`📚 Pool Stats (Shuffled):`);
        Object.entries(buckets).forEach(([name, list]) => {
            console.log(`   - ${name}: ${list.length} seeds`);
        });

        // 2. Generate Schedule
        const schedule = [];

        for (let dayOffset = 0; dayOffset < DAYS_TO_GENERATE; dayOffset++) {
            const currentDate = new Date(START_DATE.getTime() + (dayOffset * 86400000));
            const dayOfWeek = currentDate.getUTCDay();
            const dayOfMonth = currentDate.getUTCDate();

            let config = THEME_INFO[dayOfWeek];
            let bucket = config.bucket;

            // OVERRIDE: 2nd of the Month = THE ULTIMATE WEE
            if (dayOfMonth === 2 && buckets['Ultimate'].length > 0) {
                bucket = 'Ultimate';
                config = { name: 'THE ULTIMATE WEE', bucket: 'Ultimate', joker: 'Perkeo' };
            }

            const pool = buckets[bucket];
            if (!pool || pool.length === 0) {
                console.warn(`⚠️ No seeds found for ${bucket} on Day ${dayOffset + 1}`);
                schedule.push(null);
                continue;
            }

            // Deterministic pick based on dayOffset so the schedule is stable
            const stats = pool[dayOffset % pool.length];

            const rawId = stats.seed || stats.id || 'ERROR';
            const cleanId = rawId.replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();

            schedule.push({
                id: cleanId,
                t: stats.themeName || config.name,
                j: stats.themeJoker || config.joker,
                s: parseInt(stats.score || stats.s) || 0,
                w: parseInt(stats.Two || stats.twos || stats.w) || 0,
                wj1: parseInt(stats['WeeJoker A1'] || stats.WeeJoker_Ante1 || stats.wj1) || undefined,
                wj2: parseInt(stats['WeeJoker A2'] || stats.WeeJoker_Ante2 || stats.wj2) || undefined,
                hc1: parseInt(stats['HangingChad A1'] || stats.HanginChad_Ante1 || stats.hc1) || undefined,
                hc2: parseInt(stats['HangingChad A2'] || stats.HanginChad_Ante2 || stats.hc2) || undefined,
                hk1: parseInt(stats['Hack A1'] || stats.Hack_Ante1 || stats.hk1) || undefined,
                hk2: parseInt(stats['Hack A2'] || stats.Hack_Ante2 || stats.hk2) || undefined,
                bp: parseInt(stats['Blueprint A1'] || stats.blueprint_early || stats.bp) || undefined,
                bs: parseInt(stats['Brainstorm A1'] || stats.brainstorm_early || stats.bs) || undefined,
                sh: parseInt(stats['Showman A1'] || stats.Showman_Ante1 || stats.sh) || undefined,
                rs: parseInt(stats.red_Seal_Two || stats.rs) || undefined,
                t1: parseInt(stats.Theme_Card_Ante1 || stats.t1) || undefined,
                t2: parseInt(stats.Theme_Card_Ante2 || stats.t2) || undefined
            });
        }

        // 3. Write
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(schedule));
        console.log(`🍞 Baked ${schedule.length} days into daily_ritual.json`);
    } catch (error) {
        console.error('❌ Baking Failed:', error);
        process.exit(1);
    }
}

main();
