import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import fs from 'fs';
import path from 'path';

/**
 * GET /api/rituals/[id]
 * 
 * Fetches ritual config, seeds from R2, and JAML from R2.
 * R2 keys are derived from the ritual ID: {id}.csv, {id}.jaml
 * In dev mode, falls back to public/ directory files.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    // Try to get Cloudflare context, but handle dev mode gracefully
    let env: any = null;
    try {
        const context = await getCloudflareContext({ async: true });
        env = context.env;
    } catch (error) {
        // Dev mode - no Cloudflare env available
        console.log('Running in dev mode without Cloudflare context');
    }

    // --- Ritual metadata (from D1) ---
    let config: Record<string, any> = { id, seeds: [] as string[] };

    if (env && env.DB) {
        try {
            const ritual = await env.DB.prepare('SELECT * FROM rituals WHERE id = ?').bind(id).first() as any;
            if (ritual) {
                config.title = ritual.title;
                config.tagline = ritual.tagline;
                config.epoch = ritual.epoch;
            }
        } catch (e) {
            console.error('D1 query failed:', e);
        }
    }

    if (!config.title || !config.epoch) {
        // unknown ritual
        return NextResponse.json({ error: `Unknown ritual: ${id}` }, { status: 404 });
    }

    // --- Day calculation ---
    const { searchParams } = new URL(request.url);
    const epoch = new Date(config.epoch).getTime();
    const now = Date.now();
    const todayNumber = Math.floor((now - epoch) / (24 * 60 * 60 * 1000)) + 1;

    const requestedDay = parseInt(searchParams.get('day') || '0', 10);
    const targetDay = requestedDay > 0 ? requestedDay : todayNumber;

    if (targetDay > todayNumber + 1 && process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Future detected.', today: todayNumber }, { status: 403 });
    }
    if (targetDay < 1) {
        return NextResponse.json({ error: 'Pre-epoch.', epoch: config.epoch }, { status: 400 });
    }

    config.dayNumber = targetDay;
    config.today = todayNumber;

    // --- Seeds & JAML from R2 (keys derived from ritual ID) ---
    let seedsLoaded = false;
    if (env && env.SEED_ASSETS) {
        try {
            const csvObj = await env.SEED_ASSETS.get(`${id}.csv`);
            if (csvObj) {
                const text = await csvObj.text();
                const allSeeds = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0).map((l: string) => l.split(',')[0].trim());
                config.seeds = allSeeds.slice(0, todayNumber);
                seedsLoaded = true;
            }

            const jamlObj = await env.SEED_ASSETS.get(`${id}.jaml`);
            if (jamlObj) {
                config.jamlConfig = await jamlObj.text();
            }
        } catch (err) {
            console.error('R2 fetch error:', err);
        }
    }
    
    // Dev mode fallback if R2 didn't have the data
    if (!seedsLoaded) {
        // Dev mode fallback - read from public directory or use daily_ritual_clean.json
        try {
            const publicPath = path.join(process.cwd(), 'public');

            // Try reading {id}.csv first, then seeds.csv as legacy fallback
            const idCsvPath = path.join(publicPath, `${id}.csv`);
            const legacyCsvPath = path.join(publicPath, 'seeds.csv');
            const csvPath = fs.existsSync(idCsvPath) ? idCsvPath : (fs.existsSync(legacyCsvPath) ? legacyCsvPath : null);

            if (csvPath) {
                const text = fs.readFileSync(csvPath, 'utf-8');
                // Parse CSV - first column is the seed ID, skip header row
                const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                const allSeeds = lines.slice(1).map(line => {
                    // Extract first column (seed ID) - handle quoted values
                    const match = line.match(/^"?([^",]+)"?/);
                    return match ? match[1] : line.split(',')[0];
                }).filter(seed => seed && seed !== 'seed');
                config.seeds = allSeeds.slice(0, todayNumber);
                console.log(`[Dev Mode] Loaded ${allSeeds.length} total seeds from ${path.basename(csvPath)}, returning ${config.seeds.length} for day ${todayNumber}`);
            } else {
                // Fallback to daily_ritual_clean.json
                const ritualJsonPath = path.join(publicPath, 'daily_ritual_clean.json');
                if (fs.existsSync(ritualJsonPath)) {
                    const ritualData = JSON.parse(fs.readFileSync(ritualJsonPath, 'utf-8'));
                    config.seeds = ritualData.slice(0, todayNumber).map((r: any) => r.id).filter((sid: string) => sid && !sid.includes('\u0000'));
                    console.log(`[Dev Mode] Loaded ${config.seeds.length} seeds from daily_ritual_clean.json`);
                } else {
                    console.error('[Dev Mode] No seed data files found in public/');
                }
            }
        } catch (err) {
            console.error('Dev mode file read error:', err);
        }
    }

    // --- Current seed ---
    if (config.seeds.length >= targetDay) {
        config.currentSeed = config.seeds[targetDay - 1];
    } else {
        config.currentSeed = 'LOCKED';
    }

    // Ensure all required fields are present
    if (!config.jamlConfig) {
        console.warn('[Dev Mode] No JAML config found, using default');
        config.jamlConfig = `stake white, deck red, seed ${config.currentSeed}
ante 1, blind 1, score 300
ante 2, blind 1, score 450
ante 2, blind 2, score 900
ante 2, blind 3, score 1200`;
    }

    console.log(`[API Response] Returning config for ${id} day ${targetDay}:`, {
        title: config.title,
        hasJaml: !!config.jamlConfig,
        seedCount: config.seeds.length,
        currentSeed: config.currentSeed
    });

    return NextResponse.json(config);
}
