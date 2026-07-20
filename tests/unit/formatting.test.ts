import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatBirthday, formatTimestampFor2012 } from "@/lib/utils/formatting";

describe("formatBirthday", () => {
  it("formats Sanity ISO dates as DD/MM/YYYY", () => {
    expect(formatBirthday("1995-03-15")).toBe("15/03/1995");
  });
});

describe("formatTimestampFor2012", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2012-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "about a minute ago" for very recent timestamps', () => {
    const recent = new Date("2012-06-15T11:59:30.000Z").toISOString();
    expect(formatTimestampFor2012(recent)).toBe("about a minute ago");
  });

  it('returns "yesterday" for timestamps one day old', () => {
    const yesterday = new Date("2012-06-14T12:00:00.000Z").toISOString();
    expect(formatTimestampFor2012(yesterday)).toBe("yesterday");
  });

  it("returns plural days for timestamps a few days old", () => {
    const threeDaysAgo = new Date("2012-06-12T12:00:00.000Z").toISOString();
    expect(formatTimestampFor2012(threeDaysAgo)).toBe("3 days ago");
  });

  it("returns a 2012 calendar date for timestamps older than a year", () => {
    const old = new Date("2010-01-20T12:00:00.000Z").toISOString();
    expect(formatTimestampFor2012(old)).toBe("January 20, 2012");
  });
});
