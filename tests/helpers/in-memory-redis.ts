import type { Redis } from "@upstash/redis";

export type InMemoryRedis = Redis & { clear: () => void };

export function createInMemoryRedis(): InMemoryRedis {
  const kv = new Map<string, number | string>();
  const sets = new Map<string, Set<string>>();

  const redis = {
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
    clear() {
      kv.clear();
      sets.clear();
    },
  } as InMemoryRedis;

  return redis;
}
