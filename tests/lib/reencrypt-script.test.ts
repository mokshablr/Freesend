import crypto from "crypto";

import { describe, it, expect, vi } from "vitest";

// Both lib/pwd.ts and the migration script read ENCRYPTION_KEY at module load,
// so it has to be set before the static imports below are evaluated.
const { TEST_KEY_B64, LEGACY_IV_B64 } = vi.hoisted(() => {
  const keyB64 = Buffer.alloc(32, 0x2b).toString("base64");
  const ivB64 = Buffer.alloc(16, 0x7f).toString("base64");
  process.env.ENCRYPTION_KEY = keyB64;
  process.env.ENCRYPTION_IV = ivB64;
  return { TEST_KEY_B64: keyB64, LEGACY_IV_B64: ivB64 };
});

// The script constructs a PrismaClient at module scope. It is never used here,
// and a real client would want a reachable DATABASE_URL.
vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    async $disconnect() {}
  },
}));

import { decrypt as appDecrypt, encrypt as appEncrypt } from "@/lib/pwd";
import {
  decrypt as scriptDecrypt,
  encrypt as scriptEncrypt,
} from "@/scripts/reencrypt-smtp-passwords.mjs";

/**
 * The migration script inlines its own copy of the AES helpers, because it runs
 * on plain node with no transpiler and cannot import the TypeScript module
 * behind the "@/" alias. That duplication is only safe while the two
 * implementations agree, so this suite pins them together. If lib/pwd.ts ever
 * changes its stored format, these tests fail and the script has to follow.
 */
describe("re-encrypt script crypto matches lib/pwd", () => {
  const samples = [
    "hunter2-smtp-password",
    "",
    "unicode-påsswörd-✉️",
    "special!@#$%^&*()_+-=[]{}|;':\",./<>?",
    "a".repeat(500),
  ];

  it("decrypts values the app wrote", () => {
    for (const password of samples) {
      expect(scriptDecrypt(appEncrypt(password))).toBe(password);
    }
  });

  it("writes values the app can decrypt", () => {
    for (const password of samples) {
      expect(appDecrypt(scriptEncrypt(password))).toBe(password);
    }
  });

  it("decrypts legacy fixed-IV values the same way the app does", () => {
    const password = "written-by-an-older-release";
    const key = Buffer.from(TEST_KEY_B64, "base64");
    const iv = Buffer.from(LEGACY_IV_B64, "base64");
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(password, "utf8", "hex");
    encrypted += cipher.final("hex");
    const storedByOldRelease = `${iv.toString("hex")}:${encrypted}`;

    expect(scriptDecrypt(storedByOldRelease)).toBe(password);
    expect(appDecrypt(storedByOldRelease)).toBe(password);
  });

  it("emits the same stored format as the app", () => {
    const fromScript = scriptEncrypt("format-check");
    const fromApp = appEncrypt("format-check");

    for (const stored of [fromScript, fromApp]) {
      expect(stored.split(":")).toHaveLength(2);
      expect(stored.split(":")[0]).toMatch(/^[0-9a-f]{32}$/);
      expect(stored.split(":")[1]).toMatch(/^[0-9a-f]+$/);
    }
  });

  it("uses a fresh IV per call, like the app", () => {
    const ivs = new Set(
      Array.from({ length: 20 }, () => scriptEncrypt("same").split(":")[0]),
    );

    expect(ivs.size).toBe(20);
  });

  it("rejects a stored value that is not in iv:ciphertext form", () => {
    expect(() => scriptDecrypt("no-colon-here")).toThrow(
      /iv_hex:ciphertext_hex/,
    );
  });
});
