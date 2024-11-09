import crypto from "crypto";

import { env } from "@/env.mjs";

const encryptionKey = process.env.ENCRYPTION_KEY;
const encryptionIv = process.env.ENCRYPTION_IV;

if (!encryptionKey || !encryptionIv) {
  throw new Error(
    "ENCRYPTION_KEY and ENCRYPTION_IV must be set in the environment variables.",
  );
}

const algorithm = "aes-256-cbc";
const key = Buffer.from(encryptionKey, "base64"); // Ensure you store and reuse this key securely
const iv = Buffer.from(encryptionIv, "base64");

/**
 * Encrypts a text using AES-256-CBC encryption.
 * @param text - The text to encrypt.
 * @returns The encrypted text.
 */
export function encrypt(text: string): string {
  console.log("the keey", key);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a text using AES-256-CBC encryption.
 * @param text - The text to decrypt.
 * @returns The decrypted text.
 */
export function decrypt(text: string): string {
  console.log("the keey", key);
  const [ivText, encryptedText] = text.split(":");
  const ivBuffer = Buffer.from(ivText, "hex");
  const encryptedBuffer = Buffer.from(encryptedText, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedBuffer, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
