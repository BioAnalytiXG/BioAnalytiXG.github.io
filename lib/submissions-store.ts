import "server-only";

import { JWT } from "google-auth-library";

import type { BetaApplicationValues } from "@/lib/schemas";

/**
 * Durable submission storage for beta, careers, and collaboration requests in a
 * PRIVATE Google Sheet.
 *
 * Vercel's serverless filesystem is read-only, so applications are appended as
 * rows to a Google Sheet via the Sheets API using a Google Cloud service
 * account. The sheet stays private: only the sheet owner and the service
 * account (which it is explicitly shared with) can read it.
 *
 * Configuration (server-only env vars, never shipped to the client):
 *  - `GOOGLE_SHEETS_SPREADSHEET_ID` (required) — the target spreadsheet id (the
 *    long token in its URL).
 *  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` (required) — service-account email; the
 *    sheet must be shared with this address as an Editor.
 *  - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (required) — the service-account
 *    private key. Newlines may be stored escaped as `\n` and are normalized.
 *  - `GOOGLE_SHEETS_RANGE` (optional) — append range / tab. Default `Submissions!A:G`.
 *
 * When any required variable is missing, persistence is treated as unconfigured
 * and {@link appendBetaSubmission} returns `false`, so the action surfaces a
 * generic retryable failure (Req 15.5) without leaking configuration.
 */

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DEFAULT_RANGE = "Submissions!A:G";

/** Column order written to the sheet (mirror this in the sheet header row). */
const COLUMNS = [
  "timestamp",
  "type",
  "fullName",
  "email",
  "organization",
  "role",
  "message",
] as const;

/** Request origin, so one sheet can hold all three intake types. */
export type SubmissionSource = "beta" | "careers" | "collaboration";

export interface BetaSubmissionRecord {
  source: SubmissionSource;
  fullName: string;
  email: string;
  organization?: string;
  role?: string;
  message?: string;
}

/** Human-readable label per source for the sheet's `type` column. */
const SOURCE_LABEL: Record<SubmissionSource, string> = {
  beta: "Beta access",
  careers: "Careers",
  collaboration: "Collaboration",
};

interface SheetsConfig {
  spreadsheetId: string;
  clientEmail: string;
  privateKey: string;
  range: string;
}

/** Read and validate the Sheets configuration from server-only env vars. */
function readConfig(): SheetsConfig | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  // Private keys are commonly stored with literal "\n"; normalize to real newlines.
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  ).trim();
  const range = process.env.GOOGLE_SHEETS_RANGE?.trim() || DEFAULT_RANGE;

  if (!spreadsheetId || !clientEmail || !privateKey) {
    return null;
  }
  return { spreadsheetId, clientEmail, privateKey, range };
}

/**
 * Append one beta/careers/collaboration request as a row in the private Google
 * Sheet.
 *
 * @returns `true` when the row is persisted; `false` when storage is
 *   unconfigured or the write fails (the caller surfaces a generic retryable
 *   error and retains the user's input).
 */
export async function appendBetaSubmission(
  record: BetaSubmissionRecord,
): Promise<boolean> {
  const config = readConfig();
  if (!config) {
    return false;
  }

  const row: Record<(typeof COLUMNS)[number], string> = {
    timestamp: new Date().toISOString(),
    type: SOURCE_LABEL[record.source],
    fullName: record.fullName,
    email: record.email,
    organization: record.organization ?? "",
    role: record.role ?? "",
    message: record.message ?? "",
  };
  const values = [COLUMNS.map((c) => row[c])];

  try {
    const auth = new JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: [SHEETS_SCOPE],
    });
    const { token } = await auth.getAccessToken();
    if (!token) {
      return false;
    }

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}` +
      `/values/${encodeURIComponent(config.range)}:append` +
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
    source: values.source ?? "beta",
    fullName: values.fullName,
    email: values.email,
    organization: values.organization,
    role: values.role,
    message: values.message,
  };
}
