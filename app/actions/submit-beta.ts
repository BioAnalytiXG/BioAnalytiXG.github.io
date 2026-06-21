"use server";

/**
 * Beta / careers application Server Action (primary submission path).
 *
 * This `"use server"` function performs the AUTHORITATIVE server-side processing
 * of a beta/careers application: it re-validates every field with the shared Zod
 * schema, applies the hidden honeypot spam guard, enforces a per-client rolling
 * rate limit, and only then delivers the submission through the server-side
 * provider transport. Provider endpoint/keys are read exclusively from
 * server-only environment variables and are never returned to or embedded in the
 * client.
 *
 * Behavioral contract (see requirements.md and design.md "Form Submission"):
 * - Re-validate ALL fields with `betaApplicationSchema`; on failure return a
 *   non-success result WITHOUT attempting delivery. (Req 4.7, 4.8.)
 * - Honeypot: if the trimmed `company` field is non-empty, silently discard the
 *   submission (no delivery, no persistence/forwarding) and return a response
 *   that is identical to a successful submission, revealing no rejection reason.
 *   (Req 6.2.)
 * - Rate limit per client key derived from request headers; when throttled,
 *   return a generic "retry later" error WITHOUT revealing the limit value or
 *   remaining quota. (Req 6.4.)
 * - Read the provider endpoint and any secret keys ONLY from server-only env
 *   vars; never leak secrets in any response. (Req 6.5, 15.4.)
 * - Deliver via the `providerStrategy` transport; if the provider returns a
 *   non-success result, return a non-success result so the form can preserve the
 *   entered values and offer a retry. (Req 15.5.)
 */

import { headers } from "next/headers";

import {
  SUBMISSION_ERROR_MESSAGE,
  type SubmitResult,
  VALIDATION_ERROR_MESSAGE,
} from "@/lib/forms";
import { appendBetaSubmission, toBetaRecord } from "@/lib/submissions-store";
import { sendBetaConfirmationEmail, sendBetaNotificationEmail } from "@/lib/email";
import { uploadCvToDrive } from "@/lib/drive-upload";
import { formRateLimiter } from "@/lib/rate-limit";
import {
  betaApplicationSchema,
  type BetaApplicationValues,
} from "@/lib/schemas";

/**
 * Generic, non-secret message returned when the client is throttled. It invites
 * a later retry WITHOUT disclosing the configured limit or remaining quota
 * (Req 6.4).
 */
const RATE_LIMIT_MESSAGE =
  "Too many submissions right now. Please try again shortly.";

/**
 * Derive a stable per-client rate-limit key from the incoming request headers.
 *
 * Prefers the first hop in `x-forwarded-for`, then `x-real-ip`. When neither is
 * present (e.g. local/edge scenarios that strip these headers), a constant
 * fallback is used so the limiter still degrades gracefully rather than throwing
 * or treating every request as a unique client.
 */
async function resolveClientKey(): Promise<string> {
  const headerList = await headers();

  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    const [first] = forwardedFor.split(",");
    const trimmed = first?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  return "beta:unknown-client";
}

/**
 * Process a beta/careers application submission server-side.
 *
 * @param values - The raw application values posted from the client. These are
 *   treated as untrusted and re-validated here regardless of any client-side
 *   validation.
 * @returns A {@link SubmitResult}: `success` on persistence (or on a silently
 *   discarded honeypot hit), or an `error` with a non-secret message on
 *   validation failure, throttling, or storage failure.
 */
export async function submitBeta(
  values: BetaApplicationValues
): Promise<SubmitResult> {
  // 1. Authoritative re-validation of ALL fields. On failure, return a
  //    non-success result and perform NO delivery (Req 4.7, 4.8).
  const parsed = betaApplicationSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "error", message: VALIDATION_ERROR_MESSAGE };
  }

  const data = parsed.data;

  // 2. Honeypot guard: a non-empty trimmed `company` indicates a bot. Silently
  //    discard (no delivery, no forwarding) and return a response identical to a
  //    successful submission so no rejection reason is revealed (Req 6.2).
  if (data.company !== undefined && data.company.trim() !== "") {
    return { status: "success" };
  }

  // 3. Per-client rate limiting. When throttled, return a generic retry-later
  //    message that leaks neither the limit value nor the remaining quota
  //    (Req 6.4).
  const clientKey = await resolveClientKey();
  const { allowed } = formRateLimiter.check(`beta:${clientKey}`);
  if (!allowed) {
    return { status: "error", message: RATE_LIMIT_MESSAGE };
  }

  // 4. Persist the application as a CSV row in durable storage (Vercel Blob).
  //    Storage credentials come from server-only env vars (Req 6.5, 15.4).
  //    Strip the honeypot and consent flag from the stored record — the
  //    honeypot carries no value and consent is a gate, not data to retain.
  const { company: _company, consent: _consent, cvFileBase64, cvFileName, cvMimeType, ...rest } = data;
  void _company;
  void _consent;

  // 4a. If this is a careers submission with a CV, upload to Google Drive.
  let cvDriveUrl: string | undefined;
  if (rest.source === "careers" && cvFileBase64 && cvFileName && cvMimeType) {
    console.log("[submitBeta] Uploading CV:", cvFileName, cvMimeType, `${Math.round(cvFileBase64.length * 0.75 / 1024)}KB`);
    const url = await uploadCvToDrive(cvFileBase64, cvFileName, cvMimeType);
    console.log("[submitBeta] Drive URL:", url ?? "FAILED");
    if (url) cvDriveUrl = url;
  } else if (rest.source === "careers") {
    console.log("[submitBeta] Careers but no CV data — cvFileBase64:", !!cvFileBase64, "cvFileName:", !!cvFileName, "cvMimeType:", !!cvMimeType);
  }

  const betaRecord = toBetaRecord(rest, { cvDriveUrl });
  const persisted = await appendBetaSubmission(betaRecord);

  // 5. On storage failure (or unconfigured storage), return a non-success
  //    result so the form can preserve the entered values and offer a retry
  //    (Req 15.5). The message carries no secrets.
  if (!persisted) {
    return { status: "error", message: SUBMISSION_ERROR_MESSAGE };
  }

  // 6. Send emails: confirmation to applicant + notification to inbox.
  //    Run in parallel but awaited so Vercel doesn't cut the function
  //    before the Resend requests complete.
  await Promise.allSettled([
    sendBetaConfirmationEmail(betaRecord),
    sendBetaNotificationEmail(betaRecord),
  ]);

  return { status: "success" };
}
