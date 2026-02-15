import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { ritualConfig } from '@/lib/config';

export const runtime = 'edge';
/**
 * GET /api/rituals/[id]
 * 
 * Fetches ritual config, seeds from R2, and JAML from R2.
 * R2 keys are derived from the ritual ID: {id}.csv, {id}.jaml
 * No fallbacks. No fake data.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { env } = await getCloudflareContext();

    // --- Ritual metadata (D1 or hardcoded config for TheDailyWee) ---
    let config: Record<string, any> = { id, seeds: [] as string[] };

    if (env.DB) {
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
    if (env.SEED_ASSETS) {
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
    }

    // --- Current seed ---
    if (config.seeds.length >= targetDay) {
        config.currentSeed = config.seeds[targetDay - 1];
    } else {
        config.currentSeed = 'LOCKED';
    }

    return NextResponse.json(config);
}
