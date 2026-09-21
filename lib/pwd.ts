import crypto from "crypto";

const algorithm = "aes-256-cbc";

// Read lazily so the module can be imported (e.g. during `next build`) without the secrets set.
function keys() {
  const { ENCRYPTION_KEY, ENCRYPTION_IV } = process.env;
  if (!ENCRYPTION_KEY || !ENCRYPTION_IV) {
    throw new Error(
      "ENCRYPTION_KEY and ENCRYPTION_IV must be set in the environment variables.",
    );
  }
  return { key: Buffer.from(ENCRYPTION_KEY, "base64"), iv: Buffer.from(ENCRYPTION_IV, "base64") };
}

/**
 * Encrypts a text using AES-256-CBC encryption.
 * @param text - The text to encrypt.
 * @returns The encrypted text.
 */
export function encrypt(text: string): string {
  const { key, iv } = keys();
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
  const [ivText, encryptedText] = text.split(":");
  const ivBuffer = Buffer.from(ivText, "hex");
  const encryptedBuffer = Buffer.from(encryptedText, "hex");
  const decipher = crypto.createDecipheriv(algorithm, keys().key, ivBuffer);
  let decrypted = decipher.update(encryptedBuffer, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
