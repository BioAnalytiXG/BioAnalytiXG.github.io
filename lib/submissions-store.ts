import "server-only";

import { JWT } from "google-auth-library";

import type { BetaApplicationValues } from "@/lib/schemas";

/**
 * Durable submission storage for beta, careers, and collaboration requests in a
 * PRIVATE Google Sheet.
 *
 * Each intake type is routed to its own tab:
 *  - Beta access   → "Beta"          (columns: timestamp, fullName, email, organization, role, message)
 *  - Careers       → "Careers"       (columns: timestamp, fullName, email, organization, role, message)
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

/** Per-source Google Sheet tab configuration. */
const SOURCE_TAB: Record<SubmissionSource, { tab: string }> = {
  beta:          { tab: "Beta" },
  careers:       { tab: "Careers" },
  collaboration: { tab: "Collaboration" },
};

/** Columns written to every tab (in order). Header row must match. */
const ROW_COLUMNS = [
  "timestamp",
  "fullName",
  "email",
  "organization",
  "role",
  "message",
] as const;

export interface BetaSubmissionRecord {
  source: SubmissionSource;
  fullName: string;
  email: string;
  organization?: string;
  role?: string;
  message?: string;
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

  if (!spreadsheetId || !clientEmail || !privateKey) return null;
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

  const { tab } = SOURCE_TAB[record.source];
  // Dynamic range: "Beta!A:F", "Careers!A:F", etc.
  const range = `${tab}!A:${String.fromCharCode(64 + ROW_COLUMNS.length)}`;

  const rowData: Record<(typeof ROW_COLUMNS)[number], string> = {
    timestamp:    new Date().toISOString(),
    fullName:     record.fullName,
    email:        record.email,
    organization: record.organization ?? "",
    role:         record.role ?? "",
    message:      record.message ?? "",
  };
  const values = [ROW_COLUMNS.map((c) => rowData[c])];

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

    return res.ok;
  } catch {
    return false;
  }
}

/** Build a record from validated beta values (honeypot/consent stripped). */
export function toBetaRecord(
  values: Omit<BetaApplicationValues, "company" | "consent">,
): BetaSubmissionRecord {
  return {
    source:       values.source ?? "beta",
    fullName:     values.fullName,
    email:        values.email,
    organization: values.organization,
    role:         values.role,
    message:      values.message,
  };
}
