
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        const { env } = getRequestContext();

        if (!env || !env.SEED_ASSETS) {
            return NextResponse.json({
                error: "SEED_ASSETS binding not found",
                envKeys: env ? Object.keys(env) : 'env is null'
            }, { status: 500 });
        }

        const listing = await env.SEED_ASSETS.list({ limit: 100 });

        return NextResponse.json({
            bucket: "SEED_ASSETS",
            objects: listing.objects.map(o => ({
                key: o.key,
                size: o.size,
                uploaded: o.uploaded
            })),
            truncated: listing.truncated
        });

    } catch (err: any) {
        return NextResponse.json({
            error: "Failed to list bucket",
            details: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
