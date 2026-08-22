import crypto from "crypto";

const encryptionKey = process.env.ENCRYPTION_KEY;

if (!encryptionKey) {
  throw new Error(
    "ENCRYPTION_KEY must be set in the environment variables.",
  );
}

const algorithm = "aes-256-cbc";
const key = Buffer.from(encryptionKey, "base64"); // Ensure you store and reuse this key securely

// AES block size. A fresh IV of this length is generated for every encrypt()
// call and stored alongside the ciphertext.
const IV_LENGTH = 16;

// ENCRYPTION_IV is deprecated and no longer read. Older releases used it as a
// fixed IV for every encryption, which meant two passwords sharing a prefix
// produced ciphertexts sharing a prefix. Values written by those releases still
// decrypt correctly because decrypt() takes the IV from the stored string, not
// from the environment, so no migration is required. Existing deployments can
// leave ENCRYPTION_IV set; it is ignored.

/**
 * Encrypts a text using AES-256-CBC encryption.
 *
 * A cryptographically random IV is generated per call, so encrypting the same
 * plaintext twice produces different ciphertexts.
 *
 * @param text - The text to encrypt.
 * @returns The encrypted text, formatted as `${iv_hex}:${ciphertext_hex}`.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts a text using AES-256-CBC encryption.
 *
 * The IV is read from the stored string rather than from the environment, so
 * this handles both random-IV values and values written by older fixed-IV
 * releases.
 *
 * @param text - The text to decrypt.
 * @returns The decrypted text.
 */
export function decrypt(text: string): string {
  const [ivText, encryptedText] = text.split(":");
  const ivBuffer = Buffer.from(ivText, "hex");
  const encryptedBuffer = Buffer.from(encryptedText, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedBuffer, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
