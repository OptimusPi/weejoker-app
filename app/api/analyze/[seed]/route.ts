import { NextResponse } from 'next/server';

/**
 * GET /api/analyze/[seed]
 *
 * Server-side seed analysis is no longer available.
 * motely-wasm v7 requires a browser WASM environment (NativeAOT-LLVM).
 * Use client-side openSingleSeedContext() from lib/motelyWasm instead.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ seed: string }> }
) {
  const { seed } = await params;

  if (!seed || !/^[A-Z0-9]{7,8}$/i.test(seed)) {
    return NextResponse.json(
      { error: 'Invalid seed format. Expected 7-8 alphanumeric characters.' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: 'Server-side analysis is not available in motely-wasm v7. Use client-side WASM analysis.',
      seed: seed.toUpperCase(),
    },
    { status: 501 }
  );
}
