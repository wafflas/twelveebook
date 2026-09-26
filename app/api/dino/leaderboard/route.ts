import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import {
  configured,
  DISABLED_KEY,
  getBoard,
  handle,
  json,
  publicEntries,
} from "@/lib/dino/leaderboard/server";

export const runtime = "nodejs";

export async function GET() {
  return handle(async () => {
    if (!configured()) return json({ enabled: false, entries: [] });
    const [entries, disabled] = await Promise.all([
      getBoard(),
      redis.get(DISABLED_KEY),
    ]);
    return NextResponse.json(
      { enabled: String(disabled) !== "1", entries: publicEntries(entries) },
      {
        headers: {
          "Cache-Control":
            "public, max-age=15, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  });
}
