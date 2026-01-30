import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';



export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ritualId = searchParams.get('ritualId') || 'the-daily-wee';
    const seed = searchParams.get('seed');
    const week = searchParams.get('week');

    try {
        const { env } = getRequestContext();
        const db = env.DB;

        if (!db) {
            console.error("CRITICAL: No DB binding found.");
            return NextResponse.json({ error: 'Database not available' }, { status: 500 });
        }

        // --- SANE SCHEMA: PK = RITUAL + SEED + PLAYER ---
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS scores (
                ritual_id TEXT NOT NULL,
                seed TEXT NOT NULL,
                player_name TEXT NOT NULL,
                score_display TEXT NOT NULL,
                score_value REAL NOT NULL,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (ritual_id, seed, player_name)
            )
        `).run();


        if (week === 'true') {
            const result = await db.prepare(`
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
            const result = await db.prepare(`
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
        return NextResponse.json({
            error: 'Database error',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { ritualId?: string; seed?: string; playerName?: string; score?: string };
        const { ritualId = 'the-daily-wee', seed, playerName, score } = body;

        if (!seed || !playerName || !score) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (playerName.length > 20) {
            return NextResponse.json({ error: 'Name too long (max 20 chars)' }, { status: 400 });
        }

        // Parse numerical value for sorting (handles scientific notation like 1.5e100)
        const numericScore = parseFloat(score);
        if (isNaN(numericScore) || numericScore < 0) {
            return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
        }

        const { env } = getRequestContext();
        const db = env.DB;

        if (!db) {
            return NextResponse.json({ error: 'Database not available' }, { status: 500 });
        }

        // Insert or Replace (Update score if same player submits for same seed/ritual)
        await db.prepare(`
            INSERT OR REPLACE INTO scores (ritual_id, seed, player_name, score_display, score_value)
            VALUES (?, ?, ?, ?, ?)
        `).bind(ritualId, seed, playerName, score, numericScore).run();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('D1 Insert Error:', error);
        return NextResponse.json({ error: 'Failed to save score', details: error.message }, { status: 500 });
    }
}
