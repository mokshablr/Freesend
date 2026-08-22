import { describe, it, expect } from "vitest";

import { maskApiKey } from "@/lib/api-key-display";

const CURRENT = "fsk_live_9f2a7c41b8e35d06a1c9f4e72b8d5a30";
const LEGACY_UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("maskApiKey", () => {
  it("keeps the prefix and enough of the body to identify a current key", () => {
    expect(maskApiKey(CURRENT)).toBe("fsk_live_9f2a...5a30");
  });

  it("masks a legacy UUID key without a prefix", () => {
    expect(maskApiKey(LEGACY_UUID)).toBe("550e...0000");
  });

  it("distinguishes two current keys that share a prefix", () => {
    // The regression this replaces: slice(0, 3) rendered every prefixed key as
    // "fsk...", so the table could not tell two keys apart.
    const a = "fsk_live_aaaa1111222233334444555566667777";
    const b = "fsk_live_bbbb1111222233334444555566667777";

    expect(maskApiKey(a)).not.toBe(maskApiKey(b));
  });

  it("never renders the full key", () => {
    for (const token of [CURRENT, LEGACY_UUID]) {
      expect(maskApiKey(token)).not.toContain(token);
      expect(maskApiKey(token).length).toBeLessThan(token.length);
    }
  });

  it("does not leak short or empty values", () => {
    expect(maskApiKey("")).toBe("");
    // Never echoes back more than half of a malformed short value.
    for (const short of ["abc", "shortkey", "fsk_live_ab", "x"]) {
      const masked = maskApiKey(short);
      expect(masked).not.toContain(short);
      expect(masked.replace("...", "").length).toBeLessThanOrEqual(
        Math.floor(short.length / 2),
      );
    }
  });

  it("is stable across calls", () => {
    expect(maskApiKey(CURRENT)).toBe(maskApiKey(CURRENT));
  });
});
