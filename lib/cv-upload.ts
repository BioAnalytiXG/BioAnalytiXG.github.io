import "server-only";

import { put } from "@vercel/blob";

/**
 * Upload a CV file to Vercel Blob storage and return a public, shareable URL.
 *
 * This replaces the previous Google Drive uploader: a Google service account
 * has no storage quota of its own and cannot own files in a personal ("My
 * Drive") folder, so Drive uploads fail with `storageQuotaExceeded` unless a
 * Workspace Shared Drive is used. Vercel Blob has no such limitation and the
 * project already runs on Vercel.
 *
 * Required env var (server-only, provided automatically once a Blob store is
 * created in the Vercel dashboard → Storage → Blob):
 *  - BLOB_READ_WRITE_TOKEN
 *
 * The uploaded blob is stored with `access: "public"` so the URL saved in the
 * Google Sheet is directly clickable/downloadable by your team. The pathname is
 * randomized (`addRandomSuffix`) so filenames never collide and aren't
 * guessable.
 *
 * Returns the public blob URL on success, or `null` if Blob is not configured
 * or the upload fails.
 */

/** Sanitize a filename to remove path traversal and control characters. */
function sanitizeFilename(raw: string): string {
  return (
    raw
      .replace(/[/\\?%*:|"<>]/g, "_")
      .replace(/[\x00-\x1f]/g, "")
      .slice(0, 200) || "cv"
  );
}

/** Accepted CV MIME types (mirrors the client-side and schema constraints). */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** 5 MB hard limit on the decoded file. */
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadCvToBlob(
  base64: string,
  filename: string,
  mimeType: string,
): Promise<string | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) {
    console.error("[uploadCvToBlob] Missing BLOB_READ_WRITE_TOKEN");
    return null;
  }

  // Server-side MIME validation.
  const safeMime = ALLOWED_MIME_TYPES.has(mimeType)
    ? mimeType
    : "application/octet-stream";

  // Decode base64 to bytes.
  let fileBytes: Buffer;
  try {
    fileBytes = Buffer.from(base64, "base64");
  } catch {
    console.error("[uploadCvToBlob] Failed to decode base64 payload");
    return null;
  }

  if (fileBytes.byteLength === 0) {
    console.error("[uploadCvToBlob] Empty file payload");
    return null;
  }
  if (fileBytes.byteLength > MAX_BYTES) {
    console.error("[uploadCvToBlob] File exceeds 5 MB limit");
    return null;
  }

  const safeName = sanitizeFilename(filename);

  try {
    const blob = await put(`cvs/${safeName}`, fileBytes, {
      access: "public",
      contentType: safeMime,
      addRandomSuffix: true,
      token,
    });

    console.log("[uploadCvToBlob] Uploaded:", blob.url);
    return blob.url;
  } catch (err) {
    console.error("[uploadCvToBlob] Upload failed:", err);
    return null;
  }
}
