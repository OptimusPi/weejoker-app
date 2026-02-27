import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { ritualConfig } from '@/lib/config';
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

    // --- Ritual metadata (D1 or hardcoded config for TheDailyWee) ---
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

    // If D1 didn't have it and it's the default ritual, use hardcoded config
    if (!config.title && id === ritualConfig.id) {
        config.title = ritualConfig.title;
        config.tagline = ritualConfig.tagline;
        config.epoch = ritualConfig.epochDate;
    }

    if (!config.epoch) {
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
    if (env && env.SEED_ASSETS) {
        try {
            const csvObj = await env.SEED_ASSETS.get(`${id}.csv`);
            if (csvObj) {
                const text = await csvObj.text();
                const allSeeds = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).map(l => l.split(',')[0].trim());
                config.seeds = allSeeds.slice(0, todayNumber);
            }

            const jamlObj = await env.SEED_ASSETS.get(`${id}.jaml`);
            if (jamlObj) {
                config.jamlConfig = await jamlObj.text();
            }
        } catch (err) {
            console.error('R2 fetch error:', err);
        }
    } else if (process.env.NODE_ENV === 'development') {
        // Dev mode fallback - read from public directory or use daily_ritual_clean.json
        try {
            // For TheDailyWee, read seeds.csv from public/
            if (id === 'TheDailyWee') {
                const publicPath = path.join(process.cwd(), 'public');
                
                // Try reading seeds.csv
                const seedsCsvPath = path.join(publicPath, 'seeds.csv');
                if (fs.existsSync(seedsCsvPath)) {
                    const text = fs.readFileSync(seedsCsvPath, 'utf-8');
                    // Parse CSV - first column is the seed ID, skip header row
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    const allSeeds = lines.slice(1).map(line => {
                        // Extract first column (seed ID) - handle quoted values
                        const match = line.match(/^"?([^",]+)"?/);
                        return match ? match[1] : line.split(',')[0];
                    }).filter(seed => seed && seed !== 'seed');
                    config.seeds = allSeeds.slice(0, todayNumber);
                    console.log(`[Dev Mode] Loaded ${allSeeds.length} total seeds from seeds.csv, returning ${config.seeds.length} for day ${todayNumber}`);
                    
                    // Set a default JAML config for dev mode
                    config.jamlConfig = `stake white, deck red, seed ${config.seeds[targetDay - 1] || 'UNKNOWN'}
ante 1, blind 1, score 300
ante 2, blind 1, score 450
ante 2, blind 2, score 900
ante 2, blind 3, score 1200`;
                } else {
                    // Fallback to daily_ritual_clean.json
                    const ritualJsonPath = path.join(publicPath, 'daily_ritual_clean.json');
                    if (fs.existsSync(ritualJsonPath)) {
                        const ritualData = JSON.parse(fs.readFileSync(ritualJsonPath, 'utf-8'));
                        config.seeds = ritualData.slice(0, todayNumber).map((r: any) => r.id).filter((id: string) => id && !id.includes('\u0000'));
                        console.log(`[Dev Mode] Loaded ${config.seeds.length} seeds from daily_ritual_clean.json`);
                        
                        // Set a default JAML config
                        config.jamlConfig = `stake white, deck red, seed ${config.seeds[targetDay - 1] || 'UNKNOWN'}
ante 1, blind 1, score 300
ante 2, blind 1, score 450
ante 2, blind 2, score 900
ante 2, blind 3, score 1200`;
                    } else {
                        console.error('[Dev Mode] No seed data files found in public/');
                    }
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
