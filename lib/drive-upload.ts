import "server-only";

import { JWT } from "google-auth-library";

/**
 * Upload a CV file to a private Google Drive folder and return a shareable
 * viewer link. The same service-account credentials used for Google Sheets are
 * reused here — no extra keys required.
 *
 * Required env vars (server-only):
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 *  - GOOGLE_DRIVE_CV_FOLDER_ID  — the ID of the Drive folder to upload into.
 *    The service account must have Editor access to this folder.
 *
 * The uploaded file is set to "anyone with the link can view" so the link
 * stored in the sheet is clickable by anyone in your team who has the sheet.
 * (You can tighten this in Drive if needed.)
 *
 * Returns the shareable `https://drive.google.com/file/d/{id}/view` URL on
 * success, or `null` if Drive is not configured or the upload fails.
 */

const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
];

/** Sanitize a filename to remove path traversal and control characters. */
function sanitizeFilename(raw: string): string {
  return raw
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/[\x00-\x1f]/g, "")
    .slice(0, 200) || "cv.pdf";
}

/** Validate MIME type against the accepted list. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function uploadCvToDrive(
  base64: string,
  filename: string,
  mimeType: string,
): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey  = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ?.replace(/\\n/g, "\n").trim();
  const folderId    = process.env.GOOGLE_DRIVE_CV_FOLDER_ID?.trim();

  if (!clientEmail || !privateKey || !folderId) return null;

  // Server-side MIME validation.
  const safeMime = ALLOWED_MIME_TYPES.has(mimeType)
    ? mimeType
    : "application/octet-stream";

  // Decode base64 to bytes.
  let fileBytes: Buffer;
  try {
    fileBytes = Buffer.from(base64, "base64");
  } catch {
    return null;
  }

  // 5 MB hard limit.
  if (fileBytes.byteLength > 5 * 1024 * 1024) return null;

  const safeName = sanitizeFilename(filename);

  try {
    const auth = new JWT({
      email: clientEmail,
      key:   privateKey,
      scopes: DRIVE_SCOPES,
    });
    const { token } = await auth.getAccessToken();
    if (!token) {
      console.error("[uploadCvToDrive] Failed to get access token");
      return null;
    }

    // -- 1. Upload the file via multipart upload --
    const boundary = "bioanalytix_cv_boundary";
    const metadata = JSON.stringify({
      name: safeName,
      mimeType: safeMime,
      parents: [folderId],
    });

    const body = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${safeMime}\r\n\r\n`,
        "utf8",
      ),
      fileBytes,
      Buffer.from(`\r\n--${boundary}--`, "utf8"),
    ]);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": String(body.byteLength),
        },
        body,
        cache: "no-store",
      },
    );

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text().catch(() => "");
      console.error("[uploadCvToDrive] Upload failed:", uploadRes.status, errBody);
      return null;
    }
    const { id: fileId } = (await uploadRes.json()) as { id?: string };
    if (!fileId) {
      console.error("[uploadCvToDrive] No file ID returned");
      return null;
    }
    console.log("[uploadCvToDrive] Uploaded, fileId:", fileId);

    // -- 2. Make file viewable by anyone with the link --
    await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
        cache: "no-store",
      },
    );

    return `https://drive.google.com/file/d/${fileId}/view`;
  } catch {
    return null;
  }
}
