import { NextResponse } from 'next/server';

/**
 * GET /api/rituals/[id]
 * Fetch a specific ritual's configuration
 * 
 * NOTE: This is a STUB implementation. Full D1 integration will be 
 * added when running on Cloudflare Workers with D1 binding.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // TODO: Query D1 for the ritual
    // const db = (process.env as any).DB;
    // const ritual = await db.prepare(`SELECT * FROM daily_rituals WHERE id = ?`).bind(id).first();

    // Stub response
    if (id === 'wee_joker_daily__erratic_white') {
        return NextResponse.json({
            id: 'wee_joker_daily__erratic_white',
            filterId: 'wee_joker_daily',
            name: 'The Daily Wee',
            author: 'pifreak',
            description: 'Daily seed featuring Wee Joker and Hanging Chad synergies',
            deck: 'erratic',
            stake: 'white',
            epoch: '2026-01-06T00:00:00Z',
            icon: '🃏',
            seedCount: 2000,
        });
    }

    return NextResponse.json(
        { error: 'Ritual not found' },
        { status: 404 }
    );
}
