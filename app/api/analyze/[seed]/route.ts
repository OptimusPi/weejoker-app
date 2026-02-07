import { NextResponse } from 'next/server';
import { analyzeSeedWasm } from '@/lib/api/motelyWasm';
import { normalizeAnalysis } from '@/lib/seedAnalyzer';

// Run on Cloudflare Workers edge runtime
export const runtime = 'edge';

/**
 * GET /api/analyze/[seed]
 * 
 * Analyze a Balatro seed and return all computed game data.
 * 
 * Query Parameters:
 * - deck: Deck type (default: "erratic")
 * - stake: Stake type (default: "white") 
 * - maxAnte: Maximum ante to analyze (default: 8)
 * 
 * @example
 * GET /api/analyze/ABCD1234?deck=erratic&stake=white
 * 
 * Returns:
 * {
 *   seed: "ABCD1234",
 *   deck: "erratic",
 *   stake: "white",
 *   startingDeck: ["2_C", "A_H", ...],
 *   metrics: { ... },
 *   jokers: [{ id: "weejoker", ante: 1, ... }],
 *   ...
 * }
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ seed: string }> }
) {
    const { seed } = await params;
    const url = new URL(request.url);

    // Parse query parameters
    const deck = url.searchParams.get('deck') || 'erratic';
    const stake = url.searchParams.get('stake') || 'white';
    const maxAnte = parseInt(url.searchParams.get('maxAnte') || '8', 10);

    // Validate seed format (8 alphanumeric characters)
    if (!seed || !/^[A-Z0-9]{7,8}$/i.test(seed)) {
        return NextResponse.json(
            { error: 'Invalid seed format. Expected 7-8 alphanumeric characters.' },
            { status: 400 }
        );
    }

    try {
        const rawResult = await analyzeSeedWasm(seed.toUpperCase(), deck, stake);
        const analysis = normalizeAnalysis(rawResult);

        return NextResponse.json(analysis, {
            headers: {
                // Cache for 1 day - seeds are deterministic!
                'Cache-Control': 'public, max-age=86400, s-maxage=86400',
            },
        });
    } catch (error) {
        console.error('[/api/analyze] Error:', error);
        return NextResponse.json(
            { error: 'Analysis failed', details: String(error) },
            { status: 500 }
        );
    }
}
