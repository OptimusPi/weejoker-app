import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const { id, title, tagline, author, defaultObjective, epoch, jaml, seeds } = await req.json();

        // 1. Validate Input
        if (!id || !title || !jaml || !seeds || !Array.isArray(seeds) || seeds.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Get Bindings
        const { getRequestContext } = await import('@cloudflare/next-on-pages');
        const context = getRequestContext();
        const env = context?.env;

        if (!env?.DB || !env?.SEED_ASSETS) {
            // If in Dev without bindings, we can simulate success or fail
            // But for this feature, we really need the bindings.
            if (process.env.NODE_ENV === 'development') {
                console.log("MOCK CREATE:", { id, title });
                return NextResponse.json({ success: true, id, message: "Mock created (dev)" });
            }
            return NextResponse.json({ error: "Server configuration error (missing bindings)" }, { status: 500 });
        }

        // 3. Check if ID exists
        const existing = await env.DB.prepare('SELECT id FROM rituals WHERE id = ?').bind(id).first();
        if (existing) {
            return NextResponse.json({ error: "Ritual ID already exists" }, { status: 409 });
        }

        // 4. Save Assets to R2
        const jamlKey = `${id}.jaml`;
        const seedsKey = `${id}.csv`;
        
        // Convert seeds array to CSV (headerless or with header? 
        // The reader logic splits by newline and takes first column. 
        // So just joining by newline is safest and simplest.
        const seedsContent = seeds.join('\n');

        await env.SEED_ASSETS.put(jamlKey, jaml);
        await env.SEED_ASSETS.put(seedsKey, seedsContent);

        // 5. Save Metadata to D1
        await env.DB.prepare(`
            INSERT INTO rituals (id, title, tagline, epoch, author_name, default_objective, jaml_path, seeds_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id,
            title,
            tagline || "",
            epoch,
            author || "Anonymous",
            defaultObjective || "Wee Joker",
            jamlKey,
            seedsKey
        ).run();

        return NextResponse.json({ success: true, id });

    } catch (error: any) {
        console.error("Create Ritual Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
