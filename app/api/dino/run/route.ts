import {
  assertSameOrigin,
  handle,
  readBody,
  requireEnabled,
  startRun,
} from "@/lib/dino/leaderboard/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    requireEnabled();
    await readBody(request);
    return startRun(request);
  });
}
