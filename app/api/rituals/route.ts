import { NextResponse } from 'next/server';
import { ritualConfig } from '@/lib/config';

export const runtime = 'edge';

const ritualPresets: Record<string, any> = {
    [ritualConfig.id]: {
        title: ritualConfig.title,
        tagline: ritualConfig.tagline,
        epoch: ritualConfig.epochDate,
        jamlPath: "/daily_ritual.jaml",
        seedsPath: "/seeds.txt"
    }
};

/**
 * GET /api/rituals
 * Fetches the daily ritual configuration.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || ritualConfig.id;

    // Config hardcoded for launch (per user request)
    const config = {
        ...(ritualPresets[id] || ritualPresets[ritualConfig.id]),
        seeds: [] as string[]
    };

    const epoch = new Date(config.epoch).getTime();
    const now = Date.now();
    const todayNumber = Math.floor((now - epoch) / (24 * 60 * 60 * 1000)) + 1;

    const requestedDay = parseInt(searchParams.get('day') || '0', 10);
    const targetDay = requestedDay > 0 ? requestedDay : todayNumber;

    if (targetDay > todayNumber && process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: "Future detected.", today: todayNumber }, { status: 403 });
    }

    if (targetDay < 1) {
        return NextResponse.json({ error: "Pre-epoch.", epoch: config.epoch }, { status: 400 });
    }

    config.dayNumber = targetDay;
    config.today = todayNumber;

    try {
        let allSeeds: string[] = [];
        let r2Jaml: string | null = null;

        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        const context = getRequestContext();
        const env = context?.env;

        if (env && env.SEED_ASSETS) {
            const csvKey = `${id}.csv`;
            const object = await env.SEED_ASSETS.get(csvKey);

            if (object) {
                const text = await object.text();
                allSeeds = text
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => line.split(',')[0].trim());
            }

            const jamlKey = `${id}.jaml`;
            const jamlObj = await env.SEED_ASSETS.get(jamlKey);
            if (jamlObj) {
                r2Jaml = await jamlObj.text();
            }
        }

        if (allSeeds.length > 0) {
            config.seeds = allSeeds.slice(0, todayNumber);
        }

        if (r2Jaml) {
            config.jamlConfig = r2Jaml;
        }

        if (config.seeds.length >= targetDay) {
            config.currentSeed = config.seeds[targetDay - 1];
        } else if (config.seeds.length > 0) {
            config.currentSeed = config.seeds[config.seeds.length - 1];
        } else {
            config.currentSeed = "LOCKED";
        }

    } catch (err) {
        console.error("Ritual API Error:", err);
    }

    return NextResponse.json(config);
}