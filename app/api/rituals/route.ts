import { NextResponse } from 'next/server';
import { ritualConfig } from '@/lib/config';


/**
 * GET /api/rituals
 * Redirects to /api/rituals/[id] with the default ritual ID.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || ritualConfig.id;
    const day = searchParams.get('day');

    const url = new URL(`/api/rituals/${id}`, request.url);
    if (day) url.searchParams.set('day', day);

    // Internal redirect to the canonical route
    const res = await fetch(url.toString(), { headers: request.headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}