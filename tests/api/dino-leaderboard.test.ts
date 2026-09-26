import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  get: vi.fn(),
  eval: vi.fn(),
}));
vi.mock("@/lib/redis", () => ({
  redis: { get: state.get, eval: state.eval },
  getClientIpFromRequest: () => "203.0.113.10",
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (state.cookie ? { value: state.cookie } : undefined),
  }),
}));

import { GET as board } from "@/app/api/dino/leaderboard/route";
import {
  POST as session,
  GET as getSession,
  DELETE as leave,
} from "@/app/api/dino/session/route";
import { POST as start } from "@/app/api/dino/run/route";
import { POST as submit } from "@/app/api/dino/score/route";
import { decodePlayer, encodePlayer } from "@/lib/dino/leaderboard/server";
import { qualifies } from "@/lib/dino/leaderboard/shared";

const id = "9a6d3fca-3458-49b2-9536-d835ce34ca41";
const token = "385a6857-00a8-4c11-a8ae-26d577bd91a0";
function request(body: unknown, origin = "https://example.com") {
  return new Request("https://example.com/api/dino/score", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
function signed(remember = false) {
  return encodePlayer({
    id,
    expires: Math.floor(Date.now() / 1000) + 86400,
    remember,
  });
}

beforeEach(() => {
  vi.stubEnv("DINO_LEADERBOARD_ENABLED", "true");
  vi.stubEnv(
    "DINO_LEADERBOARD_SECRET",
    "test-secret-that-is-at-least-32-characters",
  );
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://unused.example.com");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "not-a-live-token");
  state.cookie = undefined;
  state.get.mockReset().mockResolvedValue(null);
  state.eval.mockReset().mockResolvedValue(["ok"]);
});

describe("leaderboard identity and privacy", () => {
  it("does not create an identity for public readers", async () => {
    const response = await board();
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(response.headers.get("cache-control")).toContain("s-maxage=30");
    expect(state.eval).not.toHaveBeenCalled();
  });

  it("strips private fields from public rankings", async () => {
    state.get.mockImplementation(async (key: string) =>
      key.endsWith(":board")
        ? [{ player: id, nickname: "Runner", score: 100, achieved: 42 }]
        : null,
    );
    expect(await (await board()).json()).toEqual({
      enabled: true,
      entries: [{ nickname: "Runner", score: 100 }],
    });
  });

  it("uses a session cookie by default and persists only after explicit choice", async () => {
    const temporary = await session(request({ remember: false }));
    const temporaryCookie = temporary.headers.get("set-cookie")!;
    expect(temporaryCookie).toContain("HttpOnly");
    expect(temporaryCookie).toContain("SameSite=strict");
    expect(temporaryCookie).toContain("Path=/api/dino");
    expect(temporaryCookie).not.toContain("Max-Age");
    const persistent = await session(request({ remember: true }));
    expect(persistent.headers.get("set-cookie")).toContain("Max-Age=7776000");
    expect((await session(request({}))).status).toBe(400);
  });

  it("persists identity for 90 days automatically when submitting score", async () => {
    state.cookie = signed(false);
    const response = await submit(
      request({ token, score: 100, nickname: "Runner" }),
    );
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie")!;
    expect(cookie).toContain("Max-Age=7776000");
    expect(cookie).toContain("Path=/api/dino");
    expect(cookie).toContain("HttpOnly");
  });

  it("uses a secure cookie in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = await session(request({ remember: false }));
    expect(response.headers.get("set-cookie")).toContain("Secure");
    vi.unstubAllEnvs();
  });

  it("rejects tampered and expired identities", () => {
    expect(decodePlayer(signed())?.id).toBe(id);
    expect(decodePlayer(signed() + "x")).toBeNull();
    expect(decodePlayer(signed().replace(id, token))).toBeNull();
    expect(
      decodePlayer(encodePlayer({ id, expires: 1000000000, remember: false })),
    ).toBeNull();
  });

  it("restores the private nickname without caching it", async () => {
    state.cookie = signed(true);
    state.get.mockResolvedValue([
      { player: id, nickname: "Runner", score: 100 },
    ]);
    const response = await getSession();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      joined: true,
      nickname: "Runner",
      remember: true,
    });
  });

  it("clears the same cookie path when leaving", async () => {
    const response = await leave(request({}));
    expect(response.headers.get("set-cookie")).toContain("Path=/api/dino");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(state.eval).not.toHaveBeenCalled();
  });
});

describe("leaderboard request protection", () => {
  it("requires opt-in before run registration", async () => {
    expect((await start(request({}))).status).toBe(401);
    expect(state.eval).not.toHaveBeenCalled();
  });

  it("rejects cross-origin writes before Redis", async () => {
    expect(
      (await session(request({ remember: false }, "https://attacker.example")))
        .status,
    ).toBe(403);
    expect(state.eval).not.toHaveBeenCalled();
  });

  it("bounds bodies even without a content-length header", async () => {
    expect(
      (await session(request({ remember: false, junk: "a".repeat(2000) })))
        .status,
    ).toBe(413);
    expect(state.eval).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5, "100", 9999999, null])(
    "rejects invalid score %s",
    async (score) => {
      state.cookie = signed();
      expect(
        (await submit(request({ token, score, nickname: "Runner" }))).status,
      ).toBe(400);
      expect(state.eval).not.toHaveBeenCalled();
    },
  );

  it.each(["<script>", "https://x.co", "a", "a".repeat(17), "s_h_i_t"])(
    "rejects invalid nickname %s",
    async (nickname) => {
      state.cookie = signed();
      expect(
        (await submit(request({ token, score: 100, nickname }))).status,
      ).toBe(400);
      expect(state.eval).not.toHaveBeenCalled();
    },
  );

  it("uses signed identity instead of a submitted player ID and hashes the IP", async () => {
    state.cookie = signed();
    expect(
      (
        await submit(
          request({ token, score: 100, nickname: "Runner", player: "victim" }),
        )
      ).status,
    ).toBe(200);
    const [, keys, args] = state.eval.mock.calls[0];
    expect(args[4]).toBe(id);
    expect(keys.join(" ")).not.toContain("203.0.113.10");
    expect(keys).toContain(`dino:v1:run:${id}`);
  });

  it.each([
    ["limited", 429],
    ["expired", 409],
    ["invalid_score", 400],
    ["blocked", 403],
    ["disabled", 503],
  ])("handles %s from atomic validation", async (code, status) => {
    state.cookie = signed();
    state.eval.mockResolvedValue([code]);
    const response = await submit(
      request({ token, score: 100, nickname: "Runner" }),
    );
    expect(response.status).toBe(status);
    expect(response.headers.get("cache-control")).toBe("no-store");
    if (status === 429) expect(response.headers.get("retry-after")).toBe("60");
  });

  it("fails closed on missing configuration and Redis outages", async () => {
    vi.stubEnv("DINO_LEADERBOARD_SECRET", "");
    expect((await session(request({ remember: false }))).status).toBe(503);
    expect(state.eval).not.toHaveBeenCalled();
    vi.stubEnv(
      "DINO_LEADERBOARD_SECRET",
      "test-secret-that-is-at-least-32-characters",
    );
    state.eval.mockRejectedValue(new Error("private upstream detail"));
    const response = await session(request({ remember: false }));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain(
      "private upstream detail",
    );
  });

  it("qualifies scores against the top 12 rankings", () => {
    const elevenEntries = Array.from({ length: 11 }, (_, i) => ({
      nickname: `Player ${i}`,
      score: (12 - i) * 100,
    }));
    // Any positive score qualifies when fewer than 12 entries exist
    expect(qualifies(10, elevenEntries)).toBe(true);
    expect(qualifies(0, elevenEntries)).toBe(false);

    const twelveEntries = [
      ...elevenEntries,
      { nickname: "Player 11", score: 100 },
    ];
    // Must beat the 12th entry (score 100)
    expect(qualifies(100, twelveEntries)).toBe(false);
    expect(qualifies(101, twelveEntries)).toBe(true);
    expect(qualifies(50, twelveEntries)).toBe(false);
  });
});
