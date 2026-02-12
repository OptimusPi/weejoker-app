import { NextResponse } from 'next/server';
import { ritualConfig } from '@/lib/config';

export const runtime = 'edge';

const ritualPresets: Record<string, any> = {
    [ritualConfig.id]: {
        title: ritualConfig.title,
        tagline: ritualConfig.tagline,
        epoch: ritualConfig.epochDate,
        jamlPath: `/${ritualConfig.id}.jaml`,
        seedsPath: `/${ritualConfig.id}.csv`,
        defaultObjective: ritualConfig.defaultObjective
    },
    'cloud9': {
        title: "Cloud 9 Daily",
        tagline: "Float like a butterfly, sting like a Rank 9",
        epoch: "2026-02-03T00:00:00Z",
        jamlPath: "/rituals/cloud9.jaml",
        seedsPath: "/rituals/cloud9.csv",
        defaultObjective: "Cloud 9"
    }
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    const env = context?.env;

    let config: any = {
        id,
        seeds: [] as string[]
    };

    // 0. Fetch Ritual Metadata from D1
    if (env && env.DB) {
        try {
            const ritual = await env.DB.prepare('SELECT * FROM rituals WHERE id = ?').bind(id).first() as any;
            if (ritual) {
                config = {
                    ...config,
                    title: ritual.title,
                    tagline: ritual.tagline,
                    epoch: ritual.epoch,
                    defaultObjective: ritual.default_objective,
                    jamlPath: ritual.jaml_path || `/${id}.jaml`,
                    seedsPath: ritual.seeds_path || `/${id}.csv`
                };
            } else {
                 // Fallback to config/presets if not in DB (during migration/dev)
                 const ritualPresets: Record<string, any> = {
                    [ritualConfig.id]: {
                        title: ritualConfig.title,
                        tagline: ritualConfig.tagline,
                        epoch: ritualConfig.epochDate,
                        jamlPath: `/${ritualConfig.id}.jaml`,
                        seedsPath: `/${ritualConfig.id}.csv`,
                        defaultObjective: ritualConfig.defaultObjective
                    },
                    'cloud9': {
                        title: "Cloud 9 Daily",
                        tagline: "Float like a butterfly, sting like a Rank 9",
                        epoch: "2026-02-03T00:00:00Z",
                        jamlPath: "/rituals/cloud9.jaml",
                        seedsPath: "/rituals/cloud9.csv",
                        defaultObjective: "Cloud 9"
                    }
                };
                const preset = ritualPresets[id] || ritualPresets[ritualConfig.id];
                config = { ...config, ...preset };
            }
        } catch (e) {
            console.error("D1 Fetch Error:", e);
            // Fallback logic duplicated for safety
             const ritualPresets: Record<string, any> = {
                [ritualConfig.id]: {
                    title: ritualConfig.title,
                    tagline: ritualConfig.tagline,
                    epoch: ritualConfig.epochDate,
                    jamlPath: `/${ritualConfig.id}.jaml`,
                    seedsPath: `/${ritualConfig.id}.csv`,
                    defaultObjective: ritualConfig.defaultObjective
                }
            };
            const preset = ritualPresets[id] || ritualPresets[ritualConfig.id];
            config = { ...config, ...preset };
        }
    } else {
         // Local/Dev without bindings
         const ritualPresets: Record<string, any> = {
            [ritualConfig.id]: {
                title: ritualConfig.title,
                tagline: ritualConfig.tagline,
                epoch: ritualConfig.epochDate,
                jamlPath: `/${ritualConfig.id}.jaml`,
                seedsPath: `/${ritualConfig.id}.csv`,
                defaultObjective: ritualConfig.defaultObjective
            }
        };
        const preset = ritualPresets[id] || ritualPresets[ritualConfig.id];
        config = { ...config, ...preset };
    }


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

        // No need to re-import context, we have it above
        if (env.SEED_ASSETS) {
            // ... as before ...
            const csvKey = config.seedsPath.startsWith('/') ? config.seedsPath.substring(1) : config.seedsPath;
            const object = await env.SEED_ASSETS.get(csvKey);
            if (object) {
                const text = await object.text();
                allSeeds = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).map(l => l.split(',')[0].trim());
            }

            const jamlKey = config.jamlPath.startsWith('/') ? config.jamlPath.substring(1) : config.jamlPath;
            const jamlObj = await env.SEED_ASSETS.get(jamlKey);
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
