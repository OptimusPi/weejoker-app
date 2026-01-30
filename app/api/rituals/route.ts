import { NextResponse } from 'next/server';
import type { JamzFile, JamzHeader, JamzSeedData } from '@/lib/types';
import { gunzipSync } from 'zlib';

/**
 * POST /api/rituals
 * Upload a JAMZ file to create/update a Daily Ritual
 * 
 * Body: { jamzContent: string } (base64 encoded gzipped JSON)
 * 
 * NOTE: This is a STUB implementation. Full D1 integration will be 
 * added when running on Cloudflare Workers with D1 binding.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { jamzContent } = body;

        if (!jamzContent || typeof jamzContent !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid jamzContent field' },
                { status: 400 }
            );
        }

        // Parse JAMZ content (format: "JAMZ1|<hash>|<count>|<base64-gzipped-json>")
        const parts = jamzContent.split('|');

        if (parts.length < 4 || parts[0] !== 'JAMZ1') {
            return NextResponse.json(
                { error: 'Invalid JAMZ format. Expected: JAMZ1|<hash>|<count>|<data>' },
                { status: 400 }
            );
        }

        const [version, jamlHash, seedCountStr, encodedData] = parts;
        const expectedSeedCount = parseInt(seedCountStr, 10);

        // Decode and decompress the data
        let jamzData: JamzFile;
        try {
            const compressed = Buffer.from(encodedData, 'base64');
            const decompressed = gunzipSync(compressed);
            jamzData = JSON.parse(decompressed.toString('utf-8'));
        } catch (parseError) {
            return NextResponse.json(
                { error: 'Failed to decompress or parse JAMZ data', details: String(parseError) },
                { status: 400 }
            );
        }

        // Validate structure
        if (!jamzData.header || !jamzData.seeds || !Array.isArray(jamzData.seeds)) {
            return NextResponse.json(
                { error: 'Invalid JAMZ structure: missing header or seeds array' },
                { status: 400 }
            );
        }

        const header = jamzData.header;
        const seeds = jamzData.seeds;

        // Validate seed count
        if (seeds.length !== expectedSeedCount) {
            return NextResponse.json(
                { error: `Seed count mismatch: header says ${expectedSeedCount}, found ${seeds.length}` },
                { status: 400 }
            );
        }

        // Validate required header fields
        if (!header.ritual?.id || !header.ritual?.name || !header.ritual?.deck || !header.ritual?.stake) {
            return NextResponse.json(
                { error: 'Invalid JAMZ header: missing required ritual fields' },
                { status: 400 }
            );
        }

        // ========================================
        // TODO: D1 Integration (when on Cloudflare)
        // ========================================
        // 
        // const db = (process.env as any).DB; // D1 binding
        // 
        // // Upsert daily_rituals record
        // await db.prepare(`
        //     INSERT OR REPLACE INTO daily_rituals 
        //     (id, filter_id, name, author, description, tutorial, deck, stake, epoch, icon, color, seed_count, jaml_hash, updated_at)
        //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        // `).bind(
        //     header.ritual.id,
        //     header.ritual.id.split('__')[0], // Extract filter_id from ritual id
        //     header.ritual.name,
        //     header.ritual.author,
        //     header.ritual.description || null,
        //     header.ritual.tutorial || null,
        //     header.ritual.deck,
        //     header.ritual.stake,
        //     header.generatedAt,
        //     header.ritual.icon || null,
        //     header.ritual.color || null,
        //     seeds.length,
        //     jamlHash
        // ).run();
        // 
        // // Delete existing seeds for this ritual
        // await db.prepare(`DELETE FROM daily_ritual_seeds WHERE ritual_id = ?`)
        //     .bind(header.ritual.id)
        //     .run();
        // 
        // // Bulk insert new seeds
        // for (let i = 0; i < seeds.length; i++) {
        //     const seed = seeds[i];
        //     await db.prepare(`
        //         INSERT INTO daily_ritual_seeds (ritual_id, day_index, seed, score, data_json)
        //         VALUES (?, ?, ?, ?, ?)
        //     `).bind(
        //         header.ritual.id,
        //         i,
        //         seed.seed,
        //         seed.score,
        //         JSON.stringify(seed)
        //     ).run();
        // }

        // Return success response (stub mode)
        return NextResponse.json({
            success: true,
            message: 'JAMZ file parsed successfully (STUB MODE - D1 not connected)',
            ritualId: header.ritual.id,
            ritualName: header.ritual.name,
            seedCount: seeds.length,
            deck: header.ritual.deck,
            stake: header.ritual.stake,
            jamlHash,
        });

    } catch (error) {
        console.error('Error processing JAMZ upload:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * GET /api/rituals
 * List all available rituals (stub)
 */
export async function GET() {
    // TODO: Query D1 for all rituals
    return NextResponse.json({
        message: 'STUB: List rituals endpoint',
        rituals: [
            {
                id: 'wee_joker_daily__erratic_white',
                name: 'The Daily Wee',
                deck: 'erratic',
                stake: 'white',
                seedCount: 2000,
            }
        ]
    });
}
