import { describe, expect, it } from "vitest";
import { isValidDocumentId } from "@/lib/utils/validation";

describe("isValidDocumentId", () => {
  it("accepts alphanumeric Sanity-style IDs", () => {
    expect(isValidDocumentId("abc123")).toBe(true);
    expect(isValidDocumentId("post-abc123")).toBe(true);
    expect(isValidDocumentId("abc_123.def-456")).toBe(true);
  });

  it("rejects empty or overlong IDs", () => {
    expect(isValidDocumentId("")).toBe(false);
    expect(isValidDocumentId("a".repeat(129))).toBe(false);
  });

  it("rejects injection-like or malformed IDs", () => {
    expect(isValidDocumentId("../etc/passwd")).toBe(false);
    expect(isValidDocumentId("id with spaces")).toBe(false);
    expect(isValidDocumentId("id/slash")).toBe(false);
    expect(isValidDocumentId("id%20encoded")).toBe(false);
  });
});
