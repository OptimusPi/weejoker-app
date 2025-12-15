import { getRequestContext } from '@cloudflare/next-on-pages';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// MOCK DATA for Local Dev / Missing DB
const MOCK_SCORES = [
    { id: 1, player_name: "Dr. Spector", score: 1250000, day_number: 1, submitted_at: new Date().toISOString() },
    { id: 2, player_name: "LocalLegend", score: 980000, day_number: 1, submitted_at: new Date().toISOString() },
    { id: 3, player_name: "Jimbo", score: 850000, day_number: 1, submitted_at: new Date().toISOString() },
    { id: 4, player_name: "BalatroFan", score: 720000, day_number: 1, submitted_at: new Date().toISOString() },
    { id: 5, player_name: "TheRngGod", score: 650000, day_number: 1, submitted_at: new Date().toISOString() },
    { id: 6, player_name: "FlushFive", score: 500000, day_number: 1, submitted_at: new Date().toISOString() },
    { id: 7, player_name: "WeeJoker", score: 8, day_number: 1, submitted_at: new Date().toISOString() },
    { id: 8, player_name: "Egg", score: 0, day_number: 1, submitted_at: new Date().toISOString() },
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const week = searchParams.get('week');

    try {
        const { env } = getRequestContext();
        const db = env.DB;

        // --- LOCAL DEV / MOCK FALLBACK ---
        if (!db) {
            console.warn("⚠️ No DB binding found. Using MOCK DATA.");
            if (week === 'true') {
                return NextResponse.json({ scores: MOCK_SCORES.slice(0, 5) }); // Mock "Use max per day" logic if needed
            }
            if (day) {
                return NextResponse.json({ scores: MOCK_SCORES });
            }
            return NextResponse.json({ scores: MOCK_SCORES });
        }
        // ---------------------------------

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
    } catch (error) {
        console.error('D1 Error:', error);
        return NextResponse.json({ error: 'Database error', details: String(error) }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
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

        // --- LOCAL DEV / MOCK FALLBACK ---
        if (!db) {
            console.warn("⚠️ No DB binding found. Mocking SUCCESSFUL submission.");
            // Simulate network delay
            await new Promise(r => setTimeout(r, 800));
            return NextResponse.json({ success: true, id: 9999, mocked: true });
        }
        // ---------------------------------

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
