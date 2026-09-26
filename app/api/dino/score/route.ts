import {
  assertSameOrigin,
  handle,
  readBody,
  requireEnabled,
  submitScore,
} from "@/lib/dino/leaderboard/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    requireEnabled();
    return submitScore(request, await readBody(request));
  });
}
