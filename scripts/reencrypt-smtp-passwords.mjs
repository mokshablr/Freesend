#!/usr/bin/env node
/**
 * Re-encrypt stored SMTP passwords onto random per-row IVs.
 *
 * Older Freesend releases encrypted every SMTP password with a single fixed IV
 * read from ENCRYPTION_IV. Those rows still decrypt correctly on current code,
 * because decrypt() takes the IV from the stored string rather than from the
 * environment, so running this script is optional hygiene rather than a
 * required migration. Its purpose is to retire the fixed-IV ciphertexts so the
 * prefix-leak property goes away for good.
 *
 * Usage:
 *   node --env-file=.env scripts/reencrypt-smtp-passwords.mjs            # dry run
 *   node --env-file=.env scripts/reencrypt-smtp-passwords.mjs --commit   # writes
 *
 * Safe to re-run. Rows already on a random IV are skipped when ENCRYPTION_IV is
 * available to identify them, and every rewrite is verified by decrypting the
 * new value back before it is written.
 *
 * This script never prints a plaintext password or a ciphertext. It reports row
 * ids and counts only.
 */

import crypto from "crypto";
import { pathToFileURL } from "url";

import { PrismaClient } from "@prisma/client";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

const commit = process.argv.includes("--commit");

const encryptionKey = process.env.ENCRYPTION_KEY;
if (!encryptionKey) {
  console.error(
    "ENCRYPTION_KEY is not set. Run with: node --env-file=.env scripts/reencrypt-smtp-passwords.mjs",
  );
  process.exit(1);
}

const key = Buffer.from(encryptionKey, "base64");
if (key.length !== 32) {
  console.error(
    `ENCRYPTION_KEY must decode to 32 bytes for aes-256-cbc, got ${key.length}.`,
  );
  process.exit(1);
}

// Optional. Only used to recognise which rows are still on the old fixed IV so
// that already-migrated rows can be skipped.
const legacyIvHex = process.env.ENCRYPTION_IV
  ? Buffer.from(process.env.ENCRYPTION_IV, "base64").toString("hex")
  : null;

/**
 * Mirrors lib/pwd.ts. Kept inline so this script runs on plain node with no
 * transpiler and no path-alias resolution. If the stored format in lib/pwd.ts
 * ever changes, change it here too.
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text) {
  const [ivText, encryptedText] = text.split(":");
  if (!ivText || !encryptedText) {
    throw new Error("stored value is not in iv_hex:ciphertext_hex form");
  }
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivText, "hex"),
  );
  let decrypted = decipher.update(Buffer.from(encryptedText, "hex"), undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

const prisma = new PrismaClient();

async function main() {
  console.log(
    commit
      ? "Mode: COMMIT. Rows will be rewritten."
      : "Mode: DRY RUN. No rows will be written. Pass --commit to apply.",
  );
  console.log(
    legacyIvHex
      ? "ENCRYPTION_IV is set, so rows already on a random IV will be skipped."
      : "ENCRYPTION_IV is not set, so every row will be re-encrypted (still safe to re-run).",
  );
  console.log("");

  const rows = await prisma.smtpConfig.findMany({
    select: { id: true, pass: true },
  });

  let skipped = 0;
  let rewritten = 0;
  const failedIds = [];

  for (const row of rows) {
    try {
      const storedIvHex = String(row.pass).split(":")[0];

      if (legacyIvHex && storedIvHex !== legacyIvHex) {
        skipped += 1;
        continue;
      }

      const plaintext = decrypt(row.pass);
      const reencrypted = encrypt(plaintext);

      // Never write a value we cannot read back.
      if (decrypt(reencrypted) !== plaintext) {
        throw new Error("verification of the re-encrypted value failed");
      }

      if (commit) {
        await prisma.smtpConfig.update({
          where: { id: row.id },
          data: { pass: reencrypted },
        });
      }

      rewritten += 1;
      console.log(`${commit ? "rewrote" : "would rewrite"}  ${row.id}`);
    } catch (error) {
      failedIds.push(row.id);
      // error.message is ours or node's crypto; it never contains the password.
      console.error(`failed       ${row.id}: ${error.message}`);
    }
  }

  console.log("");
  console.log(`Total rows:   ${rows.length}`);
  console.log(`${commit ? "Rewritten" : "To rewrite"}:   ${rewritten}`);
  console.log(`Skipped:      ${skipped} (already on a random IV)`);
  console.log(`Failed:       ${failedIds.length}`);

  if (failedIds.length > 0) {
    console.log(`Failed ids:   ${failedIds.join(", ")}`);
    console.log("");
    console.log(
      "Failed rows were left untouched. They usually mean the row was encrypted",
    );
    console.log(
      "under a different ENCRYPTION_KEY, and re-running will not fix that.",
    );
  }

  if (!commit && rewritten > 0) {
    console.log("");
    console.log("Re-run with --commit to apply these changes.");
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error(`Aborted: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
