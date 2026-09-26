import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redis, getClientIpFromRequest } from "@/lib/redis";
import { MUTATE } from "./scripts.mjs";
import { validNickname, type LeaderboardEntry } from "./shared";

const COOKIE = "dino-player";
const PREFIX = "dino:v1";
export const BOARD_KEY = `${PREFIX}:board`;
export const DISABLED_KEY = `${PREFIX}:disabled`;
const DAY = 86400;
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

interface Player {
  id: string;
  expires: number;
  remember: boolean;
}
interface StoredEntry extends LeaderboardEntry {
  player: string;
  achieved: number;
}

export class LeaderboardError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function configured() {
  return (
    process.env.DINO_LEADERBOARD_ENABLED === "true" &&
    (process.env.DINO_LEADERBOARD_SECRET?.length ?? 0) >= 32 &&
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN)
  );
}

function signature(value: string) {
  const secret = process.env.DINO_LEADERBOARD_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("Missing leaderboard secret");
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function encodePlayer(player: Player) {
  const value = `${player.id}.${player.expires}.${player.remember ? 1 : 0}`;
  return `${value}.${signature(value)}`;
}

export function decodePlayer(value?: string): Player | null {
  if (!value || value.length > 200) return null;
  const [id, expires, remember, sig, extra] = value.split(".");
  if (
    !UUID.test(id) ||
    !/^\d{10}$/.test(expires ?? "") ||
    !/^[01]$/.test(remember ?? "") ||
    !sig ||
    extra !== undefined
  )
    return null;
  const expected = Buffer.from(signature(`${id}.${expires}.${remember}`));
  const received = Buffer.from(sig);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  )
    return null;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return null;
  return { id, expires: Number(expires), remember: remember === "1" };
}

export async function currentPlayer() {
  return decodePlayer((await cookies()).get(COOKIE)?.value);
}

export function requireEnabled() {
  if (!configured())
    throw new LeaderboardError(
      503,
      "The leaderboard is currently unavailable. Your local HI still works.",
    );
}

export function assertSameOrigin(request: Request) {
  if (
    request.headers.get("origin") !== new URL(request.url).origin ||
    request.headers.get("sec-fetch-site") === "cross-site"
  ) {
    throw new LeaderboardError(403, "Please submit from this website.");
  }
}

export async function readBody(
  request: Request,
): Promise<Record<string, unknown>> {
  if (
    request.headers.get("content-type")?.split(";")[0] !== "application/json"
  ) {
    throw new LeaderboardError(415, "JSON is required.");
  }
  // Check the stream too: Content-Length may be absent or dishonest.
  const reader = request.body?.getReader();
  if (!reader) throw new LeaderboardError(400, "Missing request body.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 1024) {
      await reader.cancel();
      throw new LeaderboardError(413, "Request is too large.");
    }
    chunks.push(value);
  }
  try {
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new LeaderboardError(400, "Invalid request.");
  }
}

export function json(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function handle(action: () => Promise<NextResponse>) {
  try {
    return await action();
  } catch (error) {
    const status = error instanceof LeaderboardError ? error.status : 503;
    const response = json(
      {
        error:
          error instanceof LeaderboardError
            ? error.message
            : "The leaderboard is temporarily unavailable. Your local HI still works.",
      },
      status,
    );
    if (status === 429) response.headers.set("Retry-After", "60");
    return response;
  }
}

export async function getBoard(): Promise<StoredEntry[]> {
  const value = await redis.get<StoredEntry[]>(BOARD_KEY);
  return Array.isArray(value) ? value : [];
}

export function publicEntries(entries: StoredEntry[]): LeaderboardEntry[] {
  return entries.map(({ nickname, score }) => ({ nickname, score }));
}

async function mutate(
  request: Request,
  player: Player,
  action: string,
  token = "",
  score = 0,
  nickname = "",
) {
  // Store an HMAC of the proxy-provided IP, never the raw address. Trust only
  // deployments whose ingress overwrites x-forwarded-for (see setup guide).
  const ip = signature(`ip:${getClientIpFromRequest(request)}`);
  const result = await redis.eval<string[], string[]>(
    MUTATE,
    [
      DISABLED_KEY,
      `${PREFIX}:blocked:${player.id}`,
      `${PREFIX}:rate:${action}:ip:${ip}`,
      `${PREFIX}:rate:${action}:player:${player.id}`,
      `${PREFIX}:run:${player.id}`,
      BOARD_KEY,
    ],
    [action, token, String(score), nickname, player.id],
  );
  const code = result[0];
  const errors: Record<string, [number, string]> = {
    limited: [429, "Too many attempts. Please wait a minute and try again."],
    disabled: [503, "Score submissions are paused. Your local HI still works."],
    blocked: [403, "Score submissions are unavailable for this player."],
    expired: [
      409,
      "This run expired or was already submitted. Please play another run.",
    ],
    invalid_score: [
      400,
      "This score could not be verified. Please play another run.",
    ],
  };
  if (errors[code]) throw new LeaderboardError(...errors[code]);
  if (!["ok", "not_improved", "not_qualified"].includes(code))
    throw new Error("Unexpected leaderboard result");
  return code;
}

export async function createSession(request: Request, remember: boolean) {
  const existing = await currentPlayer();
  const player: Player = {
    id: existing?.id ?? randomUUID(),
    expires: Math.floor(Date.now() / 1000) + (remember ? 90 * DAY : DAY),
    remember,
  };
  await mutate(request, player, "session");
  const response = json({ joined: true });
  response.cookies.set(COOKIE, encodePlayer(player), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/dino",
    ...(remember ? { maxAge: 90 * DAY } : {}),
  });
  return response;
}

export function clearSession() {
  const response = json({ joined: false });
  response.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/dino",
    maxAge: 0,
  });
  return response;
}

export async function startRun(request: Request) {
  const player = await currentPlayer();
  if (!player)
    throw new LeaderboardError(
      401,
      "Your session expired. Refresh the page before your next run.",
    );
  const token = randomUUID();
  await mutate(request, player, "start", token);
  return json({ token });
}

export async function submitScore(
  request: Request,
  body: Record<string, unknown>,
) {
  const player = await currentPlayer();
  if (!player)
    throw new LeaderboardError(
      401,
      "Your session expired. Refresh the page before your next run.",
    );
  const { token, score, nickname } = body;
  if (
    typeof token !== "string" ||
    !UUID.test(token) ||
    !Number.isSafeInteger(score) ||
    typeof score !== "number" ||
    score <= 0 ||
    score > 71000 ||
    !validNickname(nickname)
  ) {
    throw new LeaderboardError(
      400,
      "Use a valid score and a nickname of 2–16 letters, numbers, spaces, underscores or hyphens.",
    );
  }
  const outcome = await mutate(
    request,
    player,
    "submit",
    token,
    score,
    nickname,
  );
  const response = json({ outcome, entries: publicEntries(await getBoard()) });
  const updatedPlayer: Player = {
    id: player.id,
    expires: Math.floor(Date.now() / 1000) + 90 * DAY,
    remember: true,
  };
  response.cookies.set(COOKIE, encodePlayer(updatedPlayer), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/dino",
    maxAge: 90 * DAY,
  });
  return response;
}
