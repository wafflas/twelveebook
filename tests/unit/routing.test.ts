import { describe, expect, it } from "vitest";
import { nameToSlug, slugToName } from "@/lib/utils/routing";

describe("nameToSlug", () => {
  it("lowercases and trims profile names", () => {
    expect(nameToSlug("Twelvee")).toBe("twelvee");
    expect(nameToSlug("  Stolou  ")).toBe("stolou");
  });
});

describe("slugToName", () => {
  it("title-cases hyphenated slugs", () => {
    expect(slugToName("twelvee")).toBe("Twelvee");
    expect(slugToName("john-doe")).toBe("John Doe");
  });
});

describe("slug round-trip", () => {
  it("keeps single-word names consistent for routing", () => {
    const name = "Twelvee";
    expect(nameToSlug(name)).toBe("twelvee");
    expect(slugToName(nameToSlug(name))).toBe("Twelvee");
  });
});
