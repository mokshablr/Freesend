/**
 * Presentation helpers for API keys.
 *
 * Deliberately free of imports so it stays safe for client components. In
 * particular it must never import lib/apiKeyUtil.ts, which pulls in node's
 * crypto module and would break the browser bundle.
 */

/**
 * Shortens an API key for display.
 *
 * Handles both current keys ("fsk_live_" followed by 32 hex characters) and the
 * bare UUIDs issued before the prefix existed, without hard-coding either
 * format: anything up to and including the last underscore is treated as a
 * prefix and kept, so enough of the random portion stays visible to tell two
 * keys apart at a glance.
 *
 * Display only. Authentication never inspects the shape of a key, and no code
 * on the auth path may start doing so, because that would invalidate every
 * legacy key in a live database.
 */
export function maskApiKey(token: string): string {
  const VISIBLE_HEAD = 4;
  const VISIBLE_TAIL = 4;

  if (!token) return "";

  const prefixEnd = token.lastIndexOf("_") + 1;
  const headLength = prefixEnd + VISIBLE_HEAD;

  // Never reveal the whole value just because it is unexpectedly short. Real
  // keys are 36 or 41 characters, so this only guards against malformed input.
  if (token.length <= headLength + VISIBLE_TAIL) {
    const safeHead = Math.min(VISIBLE_HEAD, Math.floor(token.length / 2));
    return `${token.slice(0, safeHead)}...`;
  }

  return `${token.slice(0, headLength)}...${token.slice(-VISIBLE_TAIL)}`;
}
