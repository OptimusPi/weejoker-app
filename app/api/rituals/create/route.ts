import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { CreateRitualRequest } from '@/lib/api/types';

const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

function normalizeRitualId(value: string) {
    return value
        .replace(/\s+/g, '_')
        .replace(/[^A-Za-z0-9_]/g, '')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64);
}

function normalizeSeed(seed: string) {
    const normalized = seed
        .trim()
        .replace(/^['"\s]+|['"\s]+$/g, '')
        .replace(/[^A-Za-z0-9]/g, '')
        .toUpperCase();

    if (!normalized || normalized.length > 8) {
        return null;
    }

    return normalized;
}

/**
 * POST /api/rituals/create
 * Creates a new ritual: metadata in D1, JAML + seeds in R2.
 * R2 keys: {id}.jaml, {id}.csv
 * Returns error in dev mode (no Cloudflare bindings).
 */
export async function POST(req: Request) {
    try {
        const rawBody = await req.text();
        const bodySize = new TextEncoder().encode(rawBody).length;
        if (bodySize > MAX_UPLOAD_BYTES) {
            return NextResponse.json({ error: 'Upload too large. Max size is 24 MB.' }, { status: 413 });
        }

        const body = JSON.parse(rawBody) as CreateRitualRequest;
        const normalizedId = normalizeRitualId(body.id || '');
        const title = body.title?.trim();
        const tagline = body.tagline?.trim() || '';
        const author = body.author?.trim() || '';
        const defaultObjective = body.defaultObjective?.trim() || '';
        const epoch = body.epoch?.trim() || new Date().toISOString();
        const jaml = body.jaml?.trim();
        const seeds = Array.from(new Set((body.seeds || []).map(normalizeSeed).filter((seed): seed is string => !!seed)));

        if (!normalizedId || !title || !jaml || seeds.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        try {
            const { env } = await getCloudflareContext();

            if (!env.DB || !env.SEED_ASSETS) {
                return NextResponse.json({ error: 'Missing Cloudflare bindings (DB or SEED_ASSETS)' }, { status: 500 });
            }

            // Check if ID exists
            const existing = await env.DB.prepare('SELECT id FROM rituals WHERE id = ?').bind(normalizedId).first();
            if (existing) {
                return NextResponse.json({
                    error: 'This ritual already exists. Click here to play it.',
                    playUrl: `/${normalizedId}`,
                    suggestedId: `${normalizedId}_2`
                }, { status: 409 });
            }

            // Save to R2 (keys derived from ritual ID)
            await env.SEED_ASSETS.put(`${normalizedId}.jaml`, jaml);
            await env.SEED_ASSETS.put(`${normalizedId}.csv`, seeds.join('\n'));
            await env.SEED_ASSETS.put(`${normalizedId}.meta.json`, JSON.stringify({
                author,
                defaultObjective,
            }));

            // Save metadata to D1
            await env.DB.prepare(
                'INSERT INTO rituals (id, title, tagline, epoch) VALUES (?, ?, ?, ?)'
            ).bind(normalizedId, title, tagline, epoch).run();

            return NextResponse.json({ success: true, id: normalizedId });
        } catch (cfError: any) {
            // Dev mode - no Cloudflare bindings available
            console.log('Dev mode: Ritual creation not supported (no Cloudflare bindings)');
            return NextResponse.json({ error: 'Ritual creation only supported in production', devMode: true }, { status: 501 });
        }
    } catch (error: any) {
        console.error('Create Ritual Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
