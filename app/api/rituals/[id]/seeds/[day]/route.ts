import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/rituals/[id]/seeds/[day]
 * Fetch a specific seed by ritual ID and day number
 * 
 * NOTE: This is a STUB implementation. Full D1 integration will be 
 * added when running on Cloudflare Workers with D1 binding.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; day: string }> }
) {
    const { id, day } = await params;
    const dayNumber = parseInt(day, 10);

    if (isNaN(dayNumber) || dayNumber < 1) {
        return NextResponse.json(
            { error: 'Invalid day number' },
            { status: 400 }
        );
    }

    // Convert day number to 0-indexed
    const dayIndex = dayNumber - 1;

    // TODO: Query D1 for the seed
    // const db = (process.env as any).DB;
    // const seedRow = await db.prepare(`
    //     SELECT * FROM daily_ritual_seeds 
    //     WHERE ritual_id = ? AND day_index = ?
    // `).bind(id, dayIndex).first();
    // 
    // if (!seedRow) {
    //     return NextResponse.json({ error: 'Seed not found' }, { status: 404 });
    // }
    // 
    // const seedData = JSON.parse(seedRow.data_json);
    // return NextResponse.json({
    //     dayNumber,
    //     seed: seedRow.seed,
    //     score: seedRow.score,
    //     ...seedData
    // });

    // Stub response - redirect to static data
    return NextResponse.json({
        message: 'STUB: Use static data from /data/daily-seeds.json for now',
        ritualId: id,
        dayNumber,
        dayIndex,
    });
}
