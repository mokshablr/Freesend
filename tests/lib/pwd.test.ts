import crypto from "crypto";

import { describe, it, expect, vi } from "vitest";

// lib/pwd.ts reads ENCRYPTION_KEY each time encrypt() or decrypt() runs and
// throws if it is missing. Vitest does not load .env, and vitest.config.ts sets
// no setupFiles and no test.env, so the variable is set here. vi.hoisted() runs
// above the imports, before any test calls into the module.
const { TEST_KEY_B64, LEGACY_IV_B64 } = vi.hoisted(() => {
  const keyB64 = Buffer.alloc(32, 0x2b).toString("base64");
  const ivB64 = Buffer.alloc(16, 0x7f).toString("base64");
  process.env.ENCRYPTION_KEY = keyB64;
  // Set the deprecated variable too, to prove it is accepted and ignored
  // rather than rejected.
  process.env.ENCRYPTION_IV = ivB64;
  return { TEST_KEY_B64: keyB64, LEGACY_IV_B64: ivB64 };
});

import { decrypt, encrypt } from "@/lib/pwd";

/**
 * Byte-for-byte reproduction of the encrypt() that shipped before the random-IV
 * change: a single fixed IV read from ENCRYPTION_IV, reused for every call.
 * Values produced here are what a live database written by an older release
 * actually contains.
 */
function legacyFixedIvEncrypt(text: string): string {
  const key = Buffer.from(TEST_KEY_B64, "base64");
  const iv = Buffer.from(LEGACY_IV_B64, "base64");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

const ivPrefixOf = (stored: string) => stored.split(":")[0];
const ciphertextOf = (stored: string) => stored.split(":")[1];

describe("pwd backward compatibility with fixed-IV ciphertexts", () => {
  it("decrypts a value written by the old fixed-IV encrypt()", () => {
    const password = "hunter2-smtp-password";

    const storedByOldRelease = legacyFixedIvEncrypt(password);

    expect(decrypt(storedByOldRelease)).toBe(password);
  });

  it("decrypts every fixed-IV value in a mixed table", () => {
    const passwords = [
      "short",
      "a-much-longer-smtp-password-with-padding-behaviour",
      "unicode-påsswörd-✉️",
      "special!@#$%^&*()_+-=[]{}|;':\",./<>?",
      "", // empty password, one full block of padding
    ];

    for (const password of passwords) {
      expect(decrypt(legacyFixedIvEncrypt(password))).toBe(password);
    }
  });

  it("decrypts old and new values interchangeably", () => {
    const password = "rotation-in-progress";

    // Exactly the state of a database part-way through the re-encrypt script.
    expect(decrypt(legacyFixedIvEncrypt(password))).toBe(password);
    expect(decrypt(encrypt(password))).toBe(password);
  });
});

describe("pwd random IV", () => {
  it("produces a different ciphertext each time for the same plaintext", () => {
    const password = "identical-input";

    const first = encrypt(password);
    const second = encrypt(password);

    expect(first).not.toBe(second);
    expect(ciphertextOf(first)).not.toBe(ciphertextOf(second));
    expect(decrypt(first)).toBe(password);
    expect(decrypt(second)).toBe(password);
  });

  it("emits a fresh 16-byte IV per call", () => {
    const ivs = new Set<string>();

    for (let i = 0; i < 50; i++) {
      const iv = ivPrefixOf(encrypt("same-plaintext-every-time"));
      expect(iv).toMatch(/^[0-9a-f]{32}$/);
      ivs.add(iv);
    }

    expect(ivs.size).toBe(50);
  });

  it("no longer reuses the IV from ENCRYPTION_IV", () => {
    const legacyIvHex = Buffer.from(LEGACY_IV_B64, "base64").toString("hex");

    expect(ivPrefixOf(encrypt("anything"))).not.toBe(legacyIvHex);
  });

  it("stops leaking that two passwords share a prefix", () => {
    // The actual weakness of a reused IV in CBC mode: identical plaintext
    // prefixes produce identical ciphertext prefixes, so an observer of the
    // database learns that two SMTP passwords begin the same way.
    const a = "commonprefix0123AAAAAAAAAAAAAAAA";
    const b = "commonprefix0123BBBBBBBBBBBBBBBB";

    const legacyA = ciphertextOf(legacyFixedIvEncrypt(a));
    const legacyB = ciphertextOf(legacyFixedIvEncrypt(b));
    // One AES block is 16 bytes, which is 32 hex characters.
    expect(legacyA.slice(0, 32)).toBe(legacyB.slice(0, 32));

    const newA = ciphertextOf(encrypt(a));
    const newB = ciphertextOf(encrypt(b));
    expect(newA.slice(0, 32)).not.toBe(newB.slice(0, 32));
  });

  it("round-trips values that are not simple ASCII", () => {
    const passwords = [
      "påsswörd-with-accents",
      "✉️📮 emoji password",
      "line\nbreak\ttab",
      "a".repeat(500),
    ];

    for (const password of passwords) {
      expect(decrypt(encrypt(password))).toBe(password);
    }
  });

  it("keeps the stored format as iv_hex:ciphertext_hex", () => {
    const stored = encrypt("format-check");

    expect(stored.split(":")).toHaveLength(2);
    expect(ivPrefixOf(stored)).toMatch(/^[0-9a-f]{32}$/);
    expect(ciphertextOf(stored)).toMatch(/^[0-9a-f]+$/);
  });
});

describe("pwd key lookup", () => {
  it("loads without ENCRYPTION_KEY and fails only when used", async () => {
    // `next build` imports route modules to collect page data, and the Docker
    // image is built without secrets, so a check at module load would fail
    // that build.
    const savedKey = process.env.ENCRYPTION_KEY;
    delete process.env.ENCRYPTION_KEY;
    try {
      vi.resetModules();
      const fresh = await import("@/lib/pwd");

      expect(() => fresh.encrypt("anything")).toThrow("ENCRYPTION_KEY");
      expect(() => fresh.decrypt(legacyFixedIvEncrypt("anything"))).toThrow("ENCRYPTION_KEY");
    } finally {
      process.env.ENCRYPTION_KEY = savedKey;
    }
  });
});
