import "server-only";

import { JWT } from "google-auth-library";

import type { BetaApplicationValues } from "@/lib/schemas";

/**
 * Durable submission storage for beta, careers, and collaboration requests in a
 * PRIVATE Google Sheet.
 *
 * Each intake type is routed to its own tab:
 *  - Beta access   → "Beta"          (columns: timestamp, fullName, email, organization, role, message)
 *  - Careers       → "Careers"       (columns: timestamp, fullName, email, organization, role, message, cvDriveUrl)
 *  - Collaboration → "Collaboration" (columns: timestamp, fullName, email, organization, role, message)
 *
 * Required env vars (server-only):
 *  - GOOGLE_SHEETS_SPREADSHEET_ID
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL  (share the sheet with this address as Editor)
 *  - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  (\n escaping is normalized)
 */

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

/** Which form intake this record came from. */
export type SubmissionSource = "beta" | "careers" | "collaboration";

/**
 * Column definitions per source tab.
 * Careers gets an extra `cvDriveUrl` column (column G) for the uploaded CV link.
 */
const BASE_COLUMNS = [
  "timestamp",
  "fullName",
  "email",
  "organization",
  "role",
  "message",
] as const;

const CAREERS_COLUMNS = [...BASE_COLUMNS, "cvDriveUrl"] as const;

type BaseColumn = (typeof BASE_COLUMNS)[number];
type CareersColumn = (typeof CAREERS_COLUMNS)[number];

/** Per-source Google Sheet tab configuration. */
const SOURCE_TAB: Record<
  SubmissionSource,
  { tab: string; columns: readonly string[] }
> = {
  beta:          { tab: "Beta",          columns: BASE_COLUMNS },
  careers:       { tab: "Careers",       columns: CAREERS_COLUMNS },
  collaboration: { tab: "Collaboration", columns: BASE_COLUMNS },
};

export interface BetaSubmissionRecord {
  source: SubmissionSource;
  fullName: string;
  email: string;
  organization?: string;
  role?: string;
  message?: string;
  /** Google Drive shareable link for the uploaded CV (careers only). */
  cvDriveUrl?: string;
}

interface SheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
}

function readConfig(): SheetsConfig | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const clientEmail   = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey    = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ?.replace(/\\n/g, "\n").trim();

  if (!spreadsheetId) { console.error("[submissions-store] Missing GOOGLE_SHEETS_SPREADSHEET_ID"); return null; }
  if (!clientEmail)   { console.error("[submissions-store] Missing GOOGLE_SERVICE_ACCOUNT_EMAIL"); return null; }
  if (!privateKey)    { console.error("[submissions-store] Missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"); return null; }
  return { spreadsheetId, clientEmail, privateKey };
}

/**
 * Append one row to the tab that matches `record.source`.
 * Returns `true` when the write succeeds; `false` otherwise.
 */
export async function appendBetaSubmission(
  record: BetaSubmissionRecord,
): Promise<boolean> {
  const config = readConfig();
  if (!config) return false;

  const { tab, columns } = SOURCE_TAB[record.source];
  // Dynamic range: "Beta!A:F", "Careers!A:G", etc.
  const range = `${tab}!A:${String.fromCharCode(64 + columns.length)}`;

  // Build a row that covers all columns; careers gets the Drive URL in col G.
  const baseData: Record<BaseColumn, string> = {
    timestamp:    new Date().toISOString(),
    fullName:     record.fullName,
    email:        record.email,
    organization: record.organization ?? "",
    role:         record.role ?? "",
    message:      record.message ?? "",
  };

  let values: string[][];
  if (record.source === "careers") {
    const careersData: Record<CareersColumn, string> = {
      ...baseData,
      cvDriveUrl: record.cvDriveUrl ?? "",
    };
    values = [CAREERS_COLUMNS.map((c) => careersData[c])];
  } else {
    values = [BASE_COLUMNS.map((c) => baseData[c])];
  }

  try {
    const auth = new JWT({
      email: config.clientEmail,
      key:   config.privateKey,
      scopes: [SHEETS_SCOPE],
    });
    const { token } = await auth.getAccessToken();
    if (!token) return false;

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/` +
      `${encodeURIComponent(config.spreadsheetId)}` +
      `/values/${encodeURIComponent(range)}:append` +
      `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[submissions-store] Sheets API error:", res.status, errBody);
    }
    return res.ok;
  } catch (err) {
    console.error("[submissions-store] Unexpected error:", err);
    return false;
  }
}

/** Build a record from validated beta values (honeypot/consent stripped). */
export function toBetaRecord(
  values: Omit<BetaApplicationValues, "company" | "consent" | "cvFileBase64" | "cvFileName" | "cvMimeType">,
  extras?: { cvDriveUrl?: string },
): BetaSubmissionRecord {
  return {
    source:       values.source ?? "beta",
    fullName:     values.fullName,
    email:        values.email,
    organization: values.organization,
    role:         values.role,
    message:      values.message,
    cvDriveUrl:   extras?.cvDriveUrl,
  };
}
