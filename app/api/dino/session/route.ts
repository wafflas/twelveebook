import {
  assertSameOrigin,
  clearSession,
  configured,
  createSession,
  currentPlayer,
  getBoard,
  handle,
  json,
  LeaderboardError,
  readBody,
  requireEnabled,
} from "@/lib/dino/leaderboard/server";

export const runtime = "nodejs";

export async function GET() {
  return handle(async () => {
    if (!configured()) return json({ joined: false });
    const player = await currentPlayer();
    if (!player) return json({ joined: false });
    const entry = (await getBoard()).find((item) => item.player === player.id);
    return json({
      joined: true,
      remember: player.remember,
      nickname: entry?.nickname ?? "",
      best: entry?.score ?? 0,
    });
  });
}

export async function POST(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    requireEnabled();
    const body = await readBody(request);
    if (typeof body.remember !== "boolean")
      throw new LeaderboardError(
        400,
        "Choose whether to remember this player.",
      );
    return createSession(request, body.remember);
  });
}

export async function DELETE(request: Request) {
  return handle(async () => {
    assertSameOrigin(request);
    return clearSession();
  });
}
