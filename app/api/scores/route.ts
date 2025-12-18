import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';



export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const week = searchParams.get('week');

    try {
        const { env } = getRequestContext();
        const db = env.DB;

        // --- STRICT DB CHECK ---
        if (!db) {
            console.error("CRITICAL: No DB binding found.");
            // Return 500 so UI knows it failed, rather than fake data
            return NextResponse.json({ error: 'Database not available' }, { status: 500 });
        }


        if (week === 'true') {
            const result = await db.prepare(`
                SELECT day_number, player_name, score, seed, submitted_at
                FROM scores
                WHERE day_number > 0
                GROUP BY day_number
                HAVING score = MAX(score)
                ORDER BY day_number DESC
                LIMIT 7
            `).all();
            return NextResponse.json({ scores: result.results });
        }

        if (day) {
            const result = await db.prepare(`
                SELECT id, player_name, score, submitted_at
                FROM scores
                WHERE day_number = ?
                ORDER BY score DESC
                LIMIT 10
            `).bind(parseInt(day)).all();
            return NextResponse.json({ scores: result.results });
        }

        return NextResponse.json({ error: 'Missing day or week parameter' }, { status: 400 });
    } catch (error: any) {
        console.error('D1 Error:', error);
        return NextResponse.json({
            error: 'Database error',
            details: error.message,
            stack: error.stack,
            envDB: !!getRequestContext().env.DB
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as { seed?: string; dayNumber?: number; playerName?: string; score?: number };
        const { seed, dayNumber, playerName, score } = body;

        if (!seed || !dayNumber || !playerName || score === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (playerName.length > 20) {
            return NextResponse.json({ error: 'Name too long (max 20 chars)' }, { status: 400 });
        }
        if (score < 0 || score > 999999999) {
            return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
        }

        const { env } = getRequestContext();
        const db = env.DB;

        // --- STRICT DB CHECK ---
        if (!db) {
            console.error("CRITICAL: No DB binding found for INSERT.");
            return NextResponse.json({ error: 'Database not available' }, { status: 500 });
        }

        // Safety: ensure score table exists in prod
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seed TEXT NOT NULL,
                day_number INTEGER NOT NULL,
                player_name TEXT NOT NULL,
                score INTEGER NOT NULL,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();


        const result = await db.prepare(`
            INSERT INTO scores (seed, day_number, player_name, score)
            VALUES (?, ?, ?, ?)
        `).bind(seed, dayNumber, playerName, score).run();

        return NextResponse.json({ success: true, id: result.meta.last_row_id });
    } catch (error) {
        console.error('D1 Insert Error:', error);
        return NextResponse.json({ error: 'Failed to save score', details: String(error) }, { status: 500 });
    }
}
