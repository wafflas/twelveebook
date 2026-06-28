import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

function createInMemoryRedis(): Redis {
  const kv = new Map<string, number | string>();
  const sets = new Map<string, Set<string>>();
  return {
    async get<T = number | string>(key: string): Promise<T | null> {
      return (kv.has(key) ? (kv.get(key) as T) : null) as T | null;
    },
    async set(key: string, value: number | string) {
      kv.set(key, value);
      return "OK" as const;
    },
    async incr(key: string) {
      const v = Number(kv.get(key) ?? 0) + 1;
      kv.set(key, v);
      return v;
    },
    async decr(key: string) {
      const v = Number(kv.get(key) ?? 0) - 1;
      kv.set(key, v);
      return v;
    },
    async sadd(key: string, member: string) {
      const s = sets.get(key) ?? new Set<string>();
      const before = s.size;
      s.add(member);
      sets.set(key, s);
      return s.size > before ? 1 : 0;
    },
    async srem(key: string, member: string) {
      const s = sets.get(key);
      if (!s) return 0;
      const had = s.delete(member);
      return had ? 1 : 0;
    },
    async sismember(key: string, member: string) {
      const s = sets.get(key);
      return s?.has(member) ? 1 : 0;
    },
    async hget(key: string, field: string) {
      const hashKey = `${key}:${field}`;
      return kv.has(hashKey) ? (kv.get(hashKey) as string) : null;
    },
    async hset(key: string, data: Record<string, string>) {
      for (const [field, value] of Object.entries(data)) {
        kv.set(`${key}:${field}`, value);
      }
      return 1;
    },
  } as unknown as Redis;
}

function createRedis(): Redis {
  const hasUpstash =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (hasUpstash) {
    return Redis.fromEnv();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN in production",
    );
  }

  console.warn(
    "[redis] Upstash env vars not set — using in-memory store (dev only)",
  );
  return createInMemoryRedis();
}

export const redis = createRedis();

export const likeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"),
  analytics: true,
  prefix: "rate:like",
});

export const inboxRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "rate:inbox",
});

export function getClientIpFromRequest(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri;
  return "127.0.0.1";
}
