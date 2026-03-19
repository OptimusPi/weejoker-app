import { NextResponse } from "next/server";

// In-memory fallback when Upstash is not configured
const memoryStore = new Map<string, { id: string; x: number; y: number; z: number; color: string; lastSeen: number }>();

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  // Lazy import to avoid errors when not configured
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require("@upstash/redis");
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

const REDIS_KEY = "experiment:players";
const TTL = 30; // seconds

export async function GET() {
  const redis = getRedis();

  if (redis) {
    try {
      const data = await redis.hgetall(REDIS_KEY);
      if (!data) return NextResponse.json([]);

      const players = Object.values(data).map((v: unknown) =>
        typeof v === "string" ? JSON.parse(v) : v
      );
      return NextResponse.json(players);
    } catch {
      return NextResponse.json([]);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const players = Array.from(memoryStore.values()).filter(
    (p) => now - p.lastSeen < 10_000
  );
  return NextResponse.json(players);
}

export async function POST(request: Request) {
  const body = await request.json() as { id: string; x: number; y: number; z: number; color: string };
  const { id, x, y, z, color } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const playerData = { id, x, y, z, color, lastSeen: Date.now() };
  const redis = getRedis();

  if (redis) {
    try {
      await redis.hset(REDIS_KEY, { [id]: JSON.stringify(playerData) });
      await redis.expire(REDIS_KEY, TTL);
    } catch {
      // Fallback to memory
      memoryStore.set(id, playerData);
    }
  } else {
    memoryStore.set(id, playerData);
  }

  return NextResponse.json({ ok: true });
}
