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
    },
    'cloud9': {
        title: "Cloud 9 Daily",
        tagline: "Float like a butterfly, sting like a Rank 9",
        epoch: "2026-02-03T00:00:00Z",
        jamlPath: "/rituals/cloud9.jaml",
        seedsPath: "/rituals/cloud9.csv"
    }
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Config hardcoded for launch (per user request)
    const config = {
        ...(ritualPresets[id] || ritualPresets[ritualConfig.id]),
        seeds: [] as string[]
    };

    // 1. Calculate Limits
    const { searchParams } = new URL(request.url);
    const epoch = new Date(config.epoch).getTime();
    const now = Date.now();
    const todayNumber = Math.floor((now - epoch) / (24 * 60 * 60 * 1000)) + 1;

    // 2. Determine Requested Day
    const requestedDay = parseInt(searchParams.get('day') || '0', 10);
    const targetDay = requestedDay > 0 ? requestedDay : todayNumber;

    // 3. Security Check: Is it the future? (Allow in Dev)
    if (targetDay > todayNumber && process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: "Future detected.", today: todayNumber }, { status: 403 });
    }

    // 4. Boundary Check: Is it before the epoch?
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

        // Data only from Cloudflare: R2 binding SEED_ASSETS (e.g. {id}.csv, {id}.jaml). No local fallbacks.
        if (env?.SEED_ASSETS) {
            const csvKey = `${id}.csv`;
            const jamlKey = `${id}.jaml`;
            const [csvObject, jamlObj] = await Promise.all([
                env.SEED_ASSETS.get(csvKey),
                env.SEED_ASSETS.get(jamlKey),
            ]);
            if (csvObject) {
                const text = await csvObject.text();
                allSeeds = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).map(l => l.split(',')[0].trim());
            }
            if (jamlObj) r2Jaml = await jamlObj.text();
        }

        // Apply Data to Config
        if (allSeeds.length > 0) {
            config.seeds = allSeeds.slice(0, todayNumber);
        }

        if (r2Jaml) {
            config.jamlConfig = r2Jaml;
        }

        // Set current seed strictly
        if (config.seeds.length >= targetDay) {
            config.currentSeed = config.seeds[targetDay - 1];
        } else {
            config.currentSeed = "LOCKED";
        }

    } catch (err) {
        console.error("Ritual API Error:", err);
    }

    return NextResponse.json(config);
}
