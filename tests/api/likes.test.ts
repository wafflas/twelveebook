import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => new Map<string, string>());
const likeRateLimit = vi.hoisted(() => ({
  limit: vi.fn().mockResolvedValue({ success: true, remaining: 49, reset: 0 }),
}));

vi.mock("@/lib/redis", async () => {
  const { createInMemoryRedis } =
    await import("@/tests/helpers/in-memory-redis");
  return {
    redis: createInMemoryRedis(),
    likeRateLimit: likeRateLimit,
    getClientIpFromRequest: () => "127.0.0.1",
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value !== undefined ? { value } : undefined;
    },
  })),
}));

import { createInMemoryRedis } from "@/tests/helpers/in-memory-redis";
import { redis, likeRateLimit as likeRateLimitMock } from "@/lib/redis";
import { GET, POST } from "@/app/api/likes/[postId]/route";

const POST_ID = "post-abc123";

function routeParams(postId: string) {
  return { params: Promise.resolve({ postId }) };
}

describe("POST /api/likes/[postId]", () => {
  beforeEach(() => {
    cookieStore.clear();
    (redis as ReturnType<typeof createInMemoryRedis>).clear();
    vi.mocked(likeRateLimitMock.limit).mockResolvedValue({
      success: true,
      remaining: 49,
      reset: 0,
    });
  });

  it("returns 400 for an invalid post ID", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ action: "like" }),
      }),
      routeParams("../bad"),
    );

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid action", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "heart" }),
      }),
      routeParams(POST_ID),
    );

    expect(res.status).toBe(400);
  });

  it("likes a post, sets visitor cookie, and increments count", async () => {
    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      }),
      routeParams(POST_ID),
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ likes: 1, likedByVisitor: true });

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toMatch(/visitorId=/);
  });

  it("does not double-count repeated likes from the same visitor", async () => {
    cookieStore.set("visitorId", "visitor-1");

    await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      }),
      routeParams(POST_ID),
    );

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      }),
      routeParams(POST_ID),
    );

    const data = await res.json();
    expect(data).toEqual({ likes: 1, likedByVisitor: true });
  });

  it("unlikes a post and never drops below zero", async () => {
    cookieStore.set("visitorId", "visitor-1");

    await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      }),
      routeParams(POST_ID),
    );

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlike" }),
      }),
      routeParams(POST_ID),
    );

    const data = await res.json();
    expect(data).toEqual({ likes: 0, likedByVisitor: false });
  });

  it("returns 429 when rate limited", async () => {
    vi.mocked(likeRateLimitMock.limit).mockResolvedValue({
      success: false,
      remaining: 0,
      reset: 12345,
    });

    const res = await POST(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      }),
      routeParams(POST_ID),
    );

    expect(res.status).toBe(429);
  });
});

describe("GET /api/likes/[postId]", () => {
  beforeEach(() => {
    cookieStore.clear();
    (redis as ReturnType<typeof createInMemoryRedis>).clear();
  });

  it("returns 400 for an invalid post ID", async () => {
    const res = await GET(
      new Request("http://localhost"),
      routeParams("bad id"),
    );
    expect(res.status).toBe(400);
  });

  it("returns zero likes for a new visitor", async () => {
    const res = await GET(
      new Request("http://localhost"),
      routeParams(POST_ID),
    );
    const data = await res.json();

    expect(data).toEqual({ likes: 0, likedByVisitor: false });
  });

  it("reflects liked state for a returning visitor", async () => {
    cookieStore.set("visitorId", "visitor-1");
    await redis.sadd(`likes:visitors:${POST_ID}`, "visitor-1");
    await redis.set(`likes:count:${POST_ID}`, 3);

    const res = await GET(
      new Request("http://localhost"),
      routeParams(POST_ID),
    );
    const data = await res.json();

    expect(data).toEqual({ likes: 3, likedByVisitor: true });
  });
});
