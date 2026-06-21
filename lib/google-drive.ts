import "server-only";

import { JWT } from "google-auth-library";

/**
 * Google Drive file upload for CV attachments (careers applications).
 *
 * Uses the same service-account credentials already configured for Google
 * Sheets. The service account must also have Editor access to the target
 * Drive folder, and the Drive API must be enabled in the Google Cloud project.
 *
 * Required env vars (server-only, same service account as Sheets):
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
 *
 * Optional env vars:
 *  - GOOGLE_DRIVE_CV_FOLDER_ID   — Google Drive folder ID where CVs are
 *    stored. If omitted, the file is uploaded to the service account's root
 *    "My Drive". Recommended: create a dedicated "CVs" folder, share it with
 *    the service account as Editor, and paste the folder ID here.
 *
 * Accepted file types: PDF, DOC, DOCX. Max raw size: 5 MB.
 */

const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
];

/** Max raw (decoded) CV size accepted server-side: 5 MB. */
const CV_MAX_BYTES_SERVER = 5 * 1024 * 1024;

/** Allowlisted MIME types for CVs. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** Sanitize a filename: keep only safe chars, fall back to a timestamped name. */
function sanitizeFileName(name: string): string {
  const safe = name
    .replace(/[^a-zA-Z0-9._\- ]/g, "_")
    .replace(/_{2,}/g, "_")
    .trim()
    .slice(0, 200);
  return safe || `cv_${Date.now()}.pdf`;
}

interface DriveConfig {
  clientEmail: string;
  privateKey: string;
  folderId?: string;
}

function readDriveConfig(): DriveConfig | null {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey  = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ?.replace(/\\n/g, "\n").trim();

  if (!clientEmail || !privateKey) return null;

  return {
    clientEmail,
    privateKey,
    folderId: process.env.GOOGLE_DRIVE_CV_FOLDER_ID?.trim() || undefined,
  };
}

/**
 * Upload a base64-encoded CV to Google Drive and return a shareable link.
 *
 * @param base64Content  - The file contents encoded as a plain base64 string
 *                         (no data-URI prefix).
 * @param fileName       - Original file name from the browser (will be sanitized).
 * @param mimeType       - MIME type reported by the browser.
 * @returns The "Anyone with the link can view" Drive URL, or `null` on failure.
 */
export async function uploadCvToDrive(
  base64Content: string,
  fileName: string,
  mimeType: string,
): Promise<string | null> {
  // 1. Guard: validate MIME type allowlist server-side.
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return null;
  }

  // 2. Guard: decode and check raw size.
  let fileBuffer: Buffer;
  try {
    fileBuffer = Buffer.from(base64Content, "base64");
  } catch {
    return null;
  }
  if (fileBuffer.byteLength > CV_MAX_BYTES_SERVER) {
    return null;
  }

  // 3. Read Drive service-account config.
  const config = readDriveConfig();
  if (!config) return null;

  // 4. Obtain an access token.
  let token: string;
  try {
    const auth = new JWT({
      email: config.clientEmail,
      key:   config.privateKey,
      scopes: DRIVE_SCOPES,
    });
    const result = await auth.getAccessToken();
    if (!result.token) return null;
    token = result.token;
  } catch {
    return null;
  }

  const safeName = sanitizeFileName(fileName);

  // 5. Upload via multipart/related to the Drive API.
  //    Using the multipart upload form which accepts metadata + binary in one
  //    request, keeping it to a single round-trip for files under 5 MB.
  const metadata = JSON.stringify({
    name: safeName,
    mimeType,
    ...(config.folderId ? { parents: [config.folderId] } : {}),
  });

  const boundary = "-------bioanalytix_cv_boundary";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metaPart =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    metadata;
  const filePart =
    `\r\n--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    base64Content +
    closeDelimiter;

  const body = metaPart + filePart;

  let fileId: string;
  try {
    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary="${boundary}"`,
        },
        body,
        cache: "no-store",
      },
    );

    if (!uploadRes.ok) return null;

    const json = (await uploadRes.json()) as { id?: string };
    if (!json.id) return null;
    fileId = json.id;
  } catch {
    return null;
  }

  // 6. Make the file readable by anyone with the link.
  try {
    const permRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`,
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
    if (!permRes.ok) {
      // File is uploaded but link-sharing failed. Return a direct Drive URL
      // anyway — internal team can still access it via the service account.
    }
  } catch {
    // Non-fatal: permission grant failure shouldn't block the submission.
  }

  // 7. Return a standard shareable Drive link.
  return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
}
