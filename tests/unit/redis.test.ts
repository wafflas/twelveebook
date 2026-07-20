import { describe, expect, it } from "vitest";
import { getClientIpFromRequest } from "@/lib/redis";

describe("getClientIpFromRequest", () => {
  it("reads the first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(getClientIpFromRequest(req)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "198.51.100.42" },
    });
    expect(getClientIpFromRequest(req)).toBe("198.51.100.42");
  });

  it("defaults to 127.0.0.1 when no proxy headers are present", () => {
    const req = new Request("http://localhost");
    expect(getClientIpFromRequest(req)).toBe("127.0.0.1");
  });
});
