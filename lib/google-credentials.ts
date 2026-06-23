import "server-only";

/**
 * Normalize a service-account private key read from an environment variable.
 *
 * Environment-variable transport mangles PEM keys in a few common ways. This
 * helper makes the value robust to all of them so JWT signing doesn't fail with
 * `ERR_OSSL_UNSUPPORTED` / `DECODER routines::unsupported`:
 *
 *  1. Surrounding single/double quotes accidentally pasted into the dashboard
 *     are stripped (a leading `"` corrupts the PEM header).
 *  2. Escaped `\n` sequences (the form Google's JSON uses) are converted to real
 *     newlines. Values that already contain real newlines are left as-is.
 *  3. Windows `\r\n` is normalized to `\n`.
 *  4. A trailing newline is ensured after the END marker, which some OpenSSL
 *     builds require.
 *
 * It also supports a base64-encoded PEM: if the value isn't a recognizable PEM,
 * it is base64-decoded first. Storing the key base64-encoded is the most robust
 * option on platforms whose env editors mangle newlines (e.g. Vercel).
 *
 * Returns `undefined` when the input is empty/unset.
 */
export function normalizePrivateKey(raw?: string): string | undefined {
  if (!raw) return undefined;

  let key = raw.trim();

  // 1. Strip a single pair of wrapping quotes if present.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // 1b. Base64 fallback: if the value doesn't look like a PEM, assume it's a
  //     base64-encoded PEM (the most robust transport — no newline mangling)
  //     and decode it. This is the recommended way to store the key on Vercel:
  //     `base64 < service-account.json` style, or base64 of just the key.
  if (!key.includes("BEGIN PRIVATE KEY")) {
    try {
      const decoded = Buffer.from(key, "base64").toString("utf8");
      if (decoded.includes("BEGIN PRIVATE KEY")) {
        key = decoded.trim();
      }
    } catch {
      // fall through — leave key as-is and let JWT signing surface the error
    }
  }

  // 2. Convert escaped newlines to real ones; 3. normalize CRLF.
  key = key.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");

  // 4. Ensure a trailing newline after the END marker.
  if (!key.endsWith("\n")) key += "\n";

  return key;
}
