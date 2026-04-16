import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { CreateRitualRequest } from '@/lib/api/types';

/**
 * POST /api/rituals/create
 * Creates a new ritual: metadata in D1, JAML + seeds in R2.
 * R2 keys: {id}.jaml, {id}.csv
 * No mocks. No dev fallbacks.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json() as CreateRitualRequest;
        const { id, title, tagline, epoch, jaml, seeds } = body;

        if (!id || !title || !jaml || !seeds || !Array.isArray(seeds) || seeds.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { env } = await getCloudflareContext();

        if (!env.DB || !env.SEED_ASSETS) {
            return NextResponse.json({ error: 'Missing Cloudflare bindings (DB or SEED_ASSETS)' }, { status: 500 });
        }

        // Check if ID exists
        const existing = await env.DB.prepare('SELECT id FROM rituals WHERE id = ?').bind(id).first();
        if (existing) {
            return NextResponse.json({ error: 'Ritual ID already exists' }, { status: 409 });
        }

        // Save to R2 (keys derived from ritual ID)
        await env.SEED_ASSETS.put(`${id}.jaml`, jaml);
        await env.SEED_ASSETS.put(`${id}.csv`, seeds.join('\n'));

        // Save metadata to D1
        await env.DB.prepare(
            'INSERT INTO rituals (id, title, tagline, epoch) VALUES (?, ?, ?, ?)'
        ).bind(id, title, tagline || '', epoch).run();

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('Create Ritual Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
