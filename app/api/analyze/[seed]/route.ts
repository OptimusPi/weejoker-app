import { NextResponse } from "next/server";
import { analyzeSeedServer } from "@/lib/server/motelyAnalyze";
import { normalizeAnalysis } from "@/lib/seedAnalyzer";

/** `motely-wasm` (embedded) needs the Node.js runtime, not the Edge Worker. */
export const runtime = "nodejs";

/**
 * GET /api/analyze/[seed]
 *
 * Server: same `motely-wasm` npm package (embedded LLVM WASM). Client uses
 * `analyzeSeedWasm` in `@/lib/api/motelyWasm`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ seed: string }> }
) {
  const { seed } = await params;
  const url = new URL(request.url);

  const deck = url.searchParams.get("deck") || "erratic";
  const stake = url.searchParams.get("stake") || "white";

  if (!seed || !/^[A-Z0-9]{7,8}$/i.test(seed)) {
    return NextResponse.json(
      { error: "Invalid seed format. Expected 7-8 alphanumeric characters." },
      { status: 400 }
    );
  }

  try {
    const rawResult = await analyzeSeedServer(seed.toUpperCase(), deck, stake);
    const analysis = normalizeAnalysis(rawResult);

    return NextResponse.json(analysis, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[GET /api/analyze/[seed]]", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
