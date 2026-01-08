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
            return NextResponse.json({ error: 'Database not available' }, { status: 500 });
        }

        // Safety: ensure score table exists
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


        if (week === 'true') {
            // Pick the top score for each of the last 7 days using window functions
            const result = await db.prepare(`
                SELECT day_number, player_name, score, seed, submitted_at
                FROM (
                    SELECT *, ROW_NUMBER() OVER (PARTITION BY day_number ORDER BY score DESC) as rn
                    FROM scores
                )
                WHERE rn = 1 AND day_number > 0
                ORDER BY day_number DESC
                LIMIT 7
            `).all();
            return NextResponse.json({ scores: result.results });
        }

        if (day) {
            const dayNum = parseInt(day);
            const result = await db.prepare(`
                SELECT id, player_name, score, submitted_at
                FROM scores
                WHERE day_number = ?
                ORDER BY score DESC
                LIMIT 10
            `).bind(dayNum).all();

            return NextResponse.json({ scores: result.results });
        }

        return NextResponse.json({ error: 'Missing day or week parameter' }, { status: 400 });
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
        const body = await request.json() as { seed?: string; dayNumber?: number; playerName?: string; score?: number };
        const { seed, dayNumber, playerName, score } = body;

        if (!seed || !dayNumber || !playerName || score === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (playerName.length > 20) {
            return NextResponse.json({ error: 'Name too long (max 20 chars)' }, { status: 400 });
        }

        // Increase limit to 1 Trillion for deep Balatro runs
        if (score < 0 || score > 1000000000000) {
            return NextResponse.json({ error: 'Invalid score' }, { status: 400 });
        }

        // Detect DB binding (Supports multiple Next-on-Pages versions)
        const context = getRequestContext();
        const db = (context?.env?.DB || (process.env as any).DB) as D1Database;

        if (!db) {
            console.error('D1 Error: DB binding not found in context or process.env');
            return NextResponse.json({ error: 'Database not available' }, { status: 500 });
        }

        const result = await db.prepare(`
            INSERT INTO scores (seed, day_number, player_name, score)
            VALUES (?, ?, ?, ?)
        `).bind(seed, dayNumber, playerName, score).run();

        return NextResponse.json({ success: true, id: result.meta.last_row_id });
    } catch (error: any) {
        console.error('D1 Insert Error:', error);
        return NextResponse.json({ error: 'Failed to save score', details: error.message }, { status: 500 });
    }
}
