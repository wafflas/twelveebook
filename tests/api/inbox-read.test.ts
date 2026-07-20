import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => new Map<string, string>());
const inboxRateLimit = vi.hoisted(() => ({
  limit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock("@/lib/redis", async () => {
  const { createInMemoryRedis } =
    await import("@/tests/helpers/in-memory-redis");
  return {
    redis: createInMemoryRedis(),
    inboxRateLimit,
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
import { redis } from "@/lib/redis";
import { GET, POST } from "@/app/api/inbox/[chatId]/read/route";

const CHAT_ID = "chat-abc123";

function routeParams(chatId: string) {
  return { params: Promise.resolve({ chatId }) };
}

describe("POST /api/inbox/[chatId]/read", () => {
  beforeEach(() => {
    cookieStore.clear();
    (redis as ReturnType<typeof createInMemoryRedis>).clear();
  });

  it("returns 400 for an invalid chat ID", async () => {
    const res = await POST(
      new Request("http://localhost"),
      routeParams("bad id"),
    );
    expect(res.status).toBe(400);
  });

  it("marks chat as read and sets visitor cookie on first visit", async () => {
    const res = await POST(
      new Request("http://localhost"),
      routeParams(CHAT_ID),
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.hasRead).toBe(true);
    expect(data.chatId).toBe(CHAT_ID);
    expect(data.lastReadTime).toBeTruthy();

    expect(res.headers.get("set-cookie")).toMatch(/visitorId=/);
  });

  it("stores read timestamp for the visitor in Redis", async () => {
    cookieStore.set("visitorId", "visitor-1");

    await POST(new Request("http://localhost"), routeParams(CHAT_ID));

    const lastRead = await redis.hget(`chat:lastread:${CHAT_ID}`, "visitor-1");
    expect(lastRead).toBeTruthy();
  });
});

describe("GET /api/inbox/[chatId]/read", () => {
  beforeEach(() => {
    cookieStore.clear();
    (redis as ReturnType<typeof createInMemoryRedis>).clear();
  });

  it("returns hasRead false when visitor has no cookie", async () => {
    const url = "http://localhost?latestMessageTime=2012-06-01T10:00:00.000Z";
    const res = await GET(new Request(url), routeParams(CHAT_ID));
    const data = await res.json();

    expect(data).toEqual({ hasRead: false });
  });

  it("returns hasRead true when last read is after latest message", async () => {
    cookieStore.set("visitorId", "visitor-1");
    await redis.hset(`chat:lastread:${CHAT_ID}`, {
      "visitor-1": "2012-06-01T12:00:00.000Z",
    });

    const url = "http://localhost?latestMessageTime=2012-06-01T10:00:00.000Z";
    const res = await GET(new Request(url), routeParams(CHAT_ID));
    const data = await res.json();

    expect(data.hasRead).toBe(true);
    expect(data.lastReadTime).toBe("2012-06-01T12:00:00.000Z");
  });

  it("returns hasRead false when last read is before latest message", async () => {
    cookieStore.set("visitorId", "visitor-1");
    await redis.hset(`chat:lastread:${CHAT_ID}`, {
      "visitor-1": "2012-06-01T09:00:00.000Z",
    });

    const url = "http://localhost?latestMessageTime=2012-06-01T10:00:00.000Z";
    const res = await GET(new Request(url), routeParams(CHAT_ID));
    const data = await res.json();

    expect(data.hasRead).toBe(false);
  });
});
