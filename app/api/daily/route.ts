// app/api/daily/route.ts
import { NextResponse } from 'next/server';

/**
 * GET /api/daily?day=NUM
 * Returns the seed data for the requested day.
 * The CSV in /public/seeds.csv is assumed to be ordered by day (day 1 = first data row).
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const dayParam = searchParams.get('day');
    const day = dayParam ? parseInt(dayParam, 10) : NaN;

    if (isNaN(day) || day < 1) {
        return NextResponse.json({ error: 'Invalid day parameter' }, { status: 400 });
    }

    // Build an absolute URL to the CSV in the public folder.
    // Using the request URL ensures we hit the same origin (Edge runtime).
    const csvUrl = new URL('/seeds.csv', request.url).toString();
    const csvResp = await fetch(csvUrl);
    if (!csvResp.ok) {
        return NextResponse.json({ error: 'Failed to load seed data' }, { status: 500 });
    }

    const csvText = await csvResp.text();
    const lines = csvText.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) {
        return NextResponse.json({ error: 'Seed file is empty' }, { status: 500 });
    }

    const header = lines[0].split(',');
    const rowIndex = day; // because lines[0] is header, day 1 => lines[1]
    const row = lines[rowIndex];
    if (!row) {
        return NextResponse.json({ error: 'Day out of range' }, { status: 404 });
    }

    const values = row.split(',');
    const seed: Record<string, any> = {};
    header.forEach((col, i) => {
        const raw = values[i] ?? '';
        const num = Number(raw);
        seed[col] = isNaN(num) ? raw : num;
    });
    // expose the day number explicitly for the client
    seed.day_number = day;

    return NextResponse.json(seed);
}
