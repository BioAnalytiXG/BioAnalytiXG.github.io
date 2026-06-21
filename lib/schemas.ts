import { z } from "zod";

/**
 * Shared Zod schemas for form validation.
 *
 * These schemas are the single source of truth for both client-side (fast UX
 * feedback) and server-side (authoritative) validation. See design.md
 * "Data Models" and Requirements 3, 4, and 6.
 */

/**
 * RFC 5322 addr-spec compatible email pattern (the de facto "official standard"
 * regex). Anchored and case-insensitive. Combined with a trim and a 254-char
 * maximum in the field schemas below to satisfy the email validation rules in
 * Requirements 3.2 and 4.1.
 */
export const RFC_5322_EMAIL =
  // eslint-disable-next-line no-control-regex
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

/** Maximum length of an email address per RFC 5321 (254 characters). */
export const EMAIL_MAX_LENGTH = 254;

/**
 * Email field: trimmed, non-empty, at most 254 chars, and matching the
 * RFC 5322 addr-spec pattern. Shared by both forms.
 */
const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(EMAIL_MAX_LENGTH, `Email must be at most ${EMAIL_MAX_LENGTH} characters`)
  .regex(RFC_5322_EMAIL, "Enter a valid email address");

/**
 * Hidden honeypot field. Bots tend to fill every field; legitimate users never
 * see it. The field is always an optional string here — the server treats a
 * non-empty trimmed value as spam (Requirement 6.2). Kept optional/loose so it
 * never blocks a genuine submission with client-side validation errors.
 */
const honeypotField = z.string().trim().optional();

/**
 * Contact form values (Requirement 3).
 * - name: trimmed, 1–100 chars
 * - email: RFC 5322 addr-spec, ≤254 chars
 * - message: trimmed, 1–5000 chars
 * - company: honeypot (must be empty; non-empty => server-side spam rejection)
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: emailField,
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be at most 5000 characters"),
  company: honeypotField,
});

export type ContactValues = z.infer<typeof contactSchema>;

/**
 * CV file upload constraints. Applied client-side before base64 encoding.
 * The server re-validates the decoded payload size and MIME type.
 */
export const CV_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const CV_ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const CV_ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx";

/**
 * Beta / careers application form values (Requirement 4).
 * - fullName: trimmed, non-empty, ≤100 chars
 * - email: RFC 5322 addr-spec, ≤254 chars
 * - organization: optional, ≤100 chars (empty or omitted accepted)
 * - role: optional, ≤100 chars (empty or omitted accepted)
 * - message: optional, ≤5000 chars (empty allowed)
 * - consent: must strictly equal boolean true (GDPR/privacy consent)
 * - company: honeypot (must be empty; non-empty => server-side spam rejection)
 * - cvFileBase64: optional base64-encoded CV file (careers submissions only).
 *   Encoded client-side before dispatch; decoded and uploaded to Google Drive
 *   server-side. The base64 payload must not exceed ~6.9 MB (5 MB * 4/3 + pad).
 * - cvFileName: original filename for the CV, used when uploading to Drive.
 * - cvMimeType: MIME type of the CV file, used when uploading to Drive.
 */
export const betaApplicationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be at most 100 characters"),
  email: emailField,
  organization: z
    .string()
    .trim()
    .max(100, "Organization must be at most 100 characters")
    .optional(),
  role: z
    .string()
    .trim()
    .max(100, "Role must be at most 100 characters")
    .optional(),
  message: z
    .string()
    .trim()
    .max(5000, "Message must be at most 5000 characters")
    .optional(),
  consent: z.literal(true, {
    message: "You must provide consent to continue",
  }),
  company: honeypotField,
  /**
   * Submission origin, set per page (not user-editable): which intake the
   * shared application form is serving. Defaults to "beta". Used server-side to
   * tag the stored row (Beta access / Careers / Collaboration).
   */
  source: z.enum(["beta", "careers", "collaboration"]).optional(),
  /**
   * Optional base64-encoded CV file (careers submissions only). Encoded
   * client-side; the server decodes, validates, and uploads to Google Drive.
   * Max ~6.9 MB encoded (covers the 5 MB raw limit with base64 overhead).
   */
  cvFileBase64: z
    .string()
    .max(7 * 1024 * 1024, "CV file is too large")
    .optional(),
  /** Original filename, e.g. "John_Doe_CV.pdf". Sanitized server-side. */
  cvFileName: z
    .string()
    .trim()
    .max(255, "File name is too long")
    .optional(),
  /** MIME type reported by the browser, e.g. "application/pdf". */
  cvMimeType: z.string().trim().max(100).optional(),
});

export type BetaApplicationValues = z.infer<typeof betaApplicationSchema>;
