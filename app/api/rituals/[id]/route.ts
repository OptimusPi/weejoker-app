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
        // R2 Only Approach - safely wrapped for local dev
        let allSeeds: string[] = [];
        let r2Jaml: string | null = null;

        try {
            const { getRequestContext } = await import('@cloudflare/next-on-pages');
            const { env } = getRequestContext();

            if (env && env.SEED_ASSETS) {
                // Try to fetch '[ritualId].csv'
                const csvKey = `${id}.csv`;
                const object = await env.SEED_ASSETS.get(csvKey);

                if (object) {
                    const text = await object.text();
                    // Parse CSV (First column is seed)
                    allSeeds = text
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .map(line => line.split(',')[0].trim()); // Take first column
                } else {
                    console.warn(`R2 '${csvKey}' not found. Is it uploaded?`);
                }

                // Try to fetch '[ritualId].jaml'
                const jamlKey = `${id}.jaml`;
                const jamlObj = await env.SEED_ASSETS.get(jamlKey);

                if (jamlObj) {
                    r2Jaml = await jamlObj.text();
                } else {
                    console.warn(`R2 '${jamlKey}' not found.`);
                }

            } else {
                console.warn("No SEED_ASSETS binding found in environment.");
            }
        } catch (ctxError) {
            // This is expected in local 'npm run dev' without wrangler
            console.warn("Could not get R2 Context (Local Dev?):", ctxError);
        }

        // Fallback: Fetch from public folder if in dev AND we didn't find seeds in R2
        if (process.env.NODE_ENV === 'development' && allSeeds.length === 0) {
            try {
                const origin = new URL(request.url).origin;

                // Try to load seeds
                const seedRes = await fetch(`${origin}/${id}.csv`);
                if (seedRes.ok) {
                    const text = await seedRes.text();
                    // CRITICAL FIX: Next.js dev server might return index.html for missing files (200 OK)
                    // If the content looks like HTML, it is NOT our CSV.
                    if (!text.trim().startsWith("<")) {
                        allSeeds = text
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => line.length > 0)
                            .map(line => line.split(',')[0].trim());
                        console.log(`✅ Loaded ${allSeeds.length} seeds from public/${id}.csv (Local Fallback)`);
                    } else {
                        console.warn(`⚠️ Local fallback found HTML instead of CSV at ${id}.csv (File missing?)`);
                    }
                }

                // Try to load JAML (if not found in R2)
                if (!r2Jaml) {
                    const jamlRes = await fetch(`${origin}/${id}.jaml`);
                    if (jamlRes.ok) {
                        r2Jaml = await jamlRes.text();
                        console.log(`✅ Loaded JAML from public/${id}.jaml (Local Fallback)`);
                    }
                }

            } catch (fallbackError) {
                console.error("Local seeds fallback failed:", fallbackError);
            }
        }

        // Apply R2 Data to Config
        if (allSeeds.length > 0) {
            config.seeds = allSeeds.slice(0, todayNumber);
        }

        if (r2Jaml) {
            // Inject the JAML string for the frontend
            config.jamlConfig = r2Jaml;
        }

        // Set current seed
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
