import crypto from "crypto";

const algorithm = "aes-256-cbc";

// Resolved at call time so `next build`'s page-data collection (which imports
// route modules without executing them) does not fail when secrets are absent.
function getKeyAndIv(): { key: Buffer; iv: Buffer } {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  const encryptionIv = process.env.ENCRYPTION_IV;
  if (!encryptionKey || !encryptionIv) {
    throw new Error(
      "ENCRYPTION_KEY and ENCRYPTION_IV must be set in the environment variables.",
    );
  }
  return {
    key: Buffer.from(encryptionKey, "base64"),
    iv: Buffer.from(encryptionIv, "base64"),
  };
}

export function encrypt(text: string): string {
  const { key, iv } = getKeyAndIv();
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
  const [ivText, encryptedText] = text.split(":");
  const ivBuffer = Buffer.from(ivText, "hex");
  const encryptedBuffer = Buffer.from(encryptedText, "hex");
  const { key } = getKeyAndIv();
  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedBuffer, undefined, "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
