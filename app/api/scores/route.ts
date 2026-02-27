import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';


/**
 * GET /api/scores?ritualId=...&seed=... or ?ritualId=...&week=true
 * POST /api/scores { ritualId, seed, playerName, score }
 * 
 * Table created via migration, not inline CREATE TABLE.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ritualId = (searchParams.get('ritualId') || 'the-daily-wee').toLowerCase();
    const seed = searchParams.get('seed');
    const week = searchParams.get('week');

    try {
        const { env } = await getCloudflareContext({ async: true });

        if (!env.DB) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 });
        }

        try {
            if (week === 'true') {
                const result = await env.DB.prepare(`
                    SELECT ritual_id, seed, player_name, score_display, submitted_at
                    FROM (
                        SELECT *, ROW_NUMBER() OVER (PARTITION BY ritual_id, seed ORDER BY score_value DESC) as rn
                        FROM scores
                        WHERE ritual_id = ?
                    )
                    WHERE rn = 1
                    ORDER BY submitted_at DESC
                    LIMIT 7
                `).bind(ritualId).all();
                return NextResponse.json({ scores: result.results });
            }

            if (seed) {
                const result = await env.DB.prepare(`
                    SELECT player_name, score_display as score, submitted_at
                    FROM scores
                    WHERE ritual_id = ? AND seed = ?
                    ORDER BY score_value DESC
                    LIMIT 10
                `).bind(ritualId, seed).all();
                return NextResponse.json({ scores: result.results });
            }

            return NextResponse.json({ error: 'Missing seed or week parameter' }, { status: 400 });
        } catch (error: any) {
            console.error('D1 Error:', error);
            return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
        }
    } catch (cfError) {
        // Dev mode - no Cloudflare context available
        console.log('Running in dev mode, Cloudflare context not available');
        return NextResponse.json({ error: 'Database not available in dev mode', scores: [] }, { status: 200 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { ritualId?: string; seed?: string; playerName?: string; score?: string };
        const { ritualId: rawRitualId = 'the-daily-wee', seed, playerName, score } = body;
        const ritualId = rawRitualId.toLowerCase();

        if (!seed || !playerName || !score) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (playerName.length > 20) {
            return NextResponse.json({ error: 'Name too long (max 20 chars)' }, { status: 400 });
        }

        const numericScore = parseFloat(score);
        if (isNaN(numericScore) || numericScore < 0) {
            return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
        }

        try {
            const { env } = await getCloudflareContext({ async: true });

            if (!env.DB) {
                return NextResponse.json({ error: 'Database not available' }, { status: 500 });
            }

            await env.DB.prepare(`
                INSERT OR REPLACE INTO scores (ritual_id, seed, player_name, score_display, score_value)
                VALUES (?, ?, ?, ?, ?)
            `).bind(ritualId, seed, playerName, score, numericScore).run();

            return NextResponse.json({ success: true });
        } catch (cfError) {
            // Dev mode - no database available
            console.log('Dev mode: Score submission skipped (no database)');
            return NextResponse.json({ success: true, devMode: true });
    } catch (error: any) {
        console.error('D1 Insert Error:', error);
        return NextResponse.json({ error: 'Failed to save score', details: error.message }, { status: 500 });
    }
}
