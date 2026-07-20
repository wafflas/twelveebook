import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = vi.hoisted(() => new Map<string, string>());
const inboxRateLimit = vi.hoisted(() => ({
  limit: vi.fn().mockResolvedValue({ success: true }),
}));
const getChats = vi.hoisted(() => vi.fn());

vi.mock("@/lib/redis", async () => {
  const { createInMemoryRedis } = await import(
    "@/tests/helpers/in-memory-redis"
  );
  return {
    redis: createInMemoryRedis(),
    inboxRateLimit,
    getClientIpFromRequest: () => "127.0.0.1",
  };
});

vi.mock("@/lib/cms", () => ({
  getChats,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieStore.get(name);
      return value !== undefined ? { value } : undefined;
    },
  })),
}));

import { createInMemoryRedis } from "@/tests/helpers/in-memory-redis";
import { redis, inboxRateLimit as inboxRateLimitMock } from "@/lib/redis";
import { GET } from "@/app/api/inbox/unread-count/route";

describe("GET /api/inbox/unread-count", () => {
  beforeEach(() => {
    cookieStore.clear();
    (redis as ReturnType<typeof createInMemoryRedis>).clear();
    getChats.mockReset();
    vi.mocked(inboxRateLimitMock.limit).mockResolvedValue({ success: true });
  });

  it("counts all CMS-unread chats when visitor has no cookie", async () => {
    getChats.mockResolvedValue([
      { id: "chat-1", unread: true, unreadSince: "2012-06-01T10:00:00.000Z" },
      { id: "chat-2", unread: true, unreadSince: "2012-06-01T11:00:00.000Z" },
      { id: "chat-3", unread: false },
    ]);

    const res = await GET(new Request("http://localhost"));
    const data = await res.json();

    expect(data.unreadCount).toBe(2);
  });

  it("excludes chats the visitor read after unreadSince", async () => {
    getChats.mockResolvedValue([
      { id: "chat-1", unread: true, unreadSince: "2012-06-01T10:00:00.000Z" },
      { id: "chat-2", unread: true, unreadSince: "2012-06-01T11:00:00.000Z" },
    ]);

    cookieStore.set("visitorId", "visitor-1");
    await redis.hset("chat:lastread:chat-1", {
      "visitor-1": "2012-06-01T12:00:00.000Z",
    });
    await redis.hset("chat:lastread:chat-2", {
      "visitor-1": "2012-06-01T10:30:00.000Z",
    });

    const res = await GET(new Request("http://localhost"));
    const data = await res.json();

    expect(data.unreadCount).toBe(1);
  });

  it("counts chats with no read record for the visitor", async () => {
    getChats.mockResolvedValue([
      { id: "chat-1", unread: true, unreadSince: "2012-06-01T10:00:00.000Z" },
    ]);
    cookieStore.set("visitorId", "visitor-1");

    const res = await GET(new Request("http://localhost"));
    const data = await res.json();

    expect(data.unreadCount).toBe(1);
  });

  it("ignores chats not marked unread in CMS", async () => {
    getChats.mockResolvedValue([
      { id: "chat-1", unread: false, unreadSince: "2012-06-01T10:00:00.000Z" },
    ]);

    const res = await GET(new Request("http://localhost"));
    const data = await res.json();

    expect(data.unreadCount).toBe(0);
  });

  it("returns 429 when rate limited", async () => {
    getChats.mockResolvedValue([]);
    vi.mocked(inboxRateLimitMock.limit).mockResolvedValue({ success: false });

    const res = await GET(new Request("http://localhost"));
    expect(res.status).toBe(429);
  });
});
