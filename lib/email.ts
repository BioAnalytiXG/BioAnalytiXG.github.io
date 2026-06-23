import "server-only";

import { Resend } from "resend";

import type { ContactValues } from "@/lib/schemas";
import type { BetaSubmissionRecord, SubmissionSource } from "@/lib/submissions-store";

/**
 * Contact-form email delivery via Resend.
 *
 * Each website form has its own mailbox (see {@link FORM_MAILBOX}). The contact
 * form's internal notification is delivered to `info@bioanalytix.info` and its
 * auto-confirmation is sent from that same address. All configuration is read
 * from server-only environment variables and is never shipped to the client:
 *
 *  - `RESEND_API_KEY`   (required) — Resend API key. When absent, delivery is
 *                        treated as unconfigured and {@link sendContactEmail}
 *                        returns `false` so the action surfaces a generic
 *                        retryable failure (Req 15.5) without leaking config.
 *
 * Per-form recipient/sender addresses are defined in code via
 * {@link FORM_MAILBOX} on the Resend-verified `bioanalytix.info` domain.
 *
 * The visitor's address is set as `replyTo` so a reply goes straight back to
 * them. Returns `true` only when Resend accepts the message.
 */

/** Display name used for every outbound BioAnalytiX address. */
const FROM_NAME = "BioAnalytiX";

/**
 * Per-form mailbox. Each website form delivers its internal notification to the
 * address below and sends its auto-confirmation *from* that same address. All
 * addresses live on the Resend-verified `bioanalytix.info` domain.
 *
 *   - contact        → info@bioanalytix.info
 *   - careers        → careers@bioanalytix.info
 *   - beta (Gnosis)  → beta@bioanalytix.info
 *   - collaboration  → partnerships@bioanalytix.info
 */
const FORM_MAILBOX: Record<"contact" | SubmissionSource, string> = {
  contact:       "info@bioanalytix.info",
  careers:       "careers@bioanalytix.info",
  beta:          "beta@bioanalytix.info",
  collaboration: "partnerships@bioanalytix.info",
};

/** Recipient inbox for a form's internal notification. */
function mailboxFor(form: "contact" | SubmissionSource): string {
  return FORM_MAILBOX[form];
}

/** Verified sender (`BioAnalytiX <addr>`) a form's confirmation is sent from. */
function senderFor(form: "contact" | SubmissionSource): string {
  return `${FROM_NAME} <${FORM_MAILBOX[form]}>`;
}

/** Strip values that could enable header injection in the subject line. */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactEmail(
  data: Pick<ContactValues, "name" | "email" | "message">,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  const to = mailboxFor("contact");
  const from = senderFor("contact");

  const name = sanitizeHeaderValue(data.name);

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const text = [
    `BioAnalytiX — New Contact Message`,
    `${"─".repeat(40)}`,
    ``,
    `You have received a new message through the contact form on bioanalytix.info.`,
    ``,
    `NAME`,
    `${name}`,
    ``,
    `EMAIL`,
    `${data.email}`,
    ``,
    `DATE`,
    `${new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" })} UTC`,
    ``,
    `MESSAGE`,
    `${data.message}`,
    ``,
    `${"─".repeat(40)}`,
    `To reply, respond directly to this email or write to: ${data.email}`,
    ``,
    `BioAnalytiX · Thessaloniki, Greece · bioanalytix.info`,
    `© ${new Date().getFullYear()} BioAnalytiX. All rights reserved.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">
                BioAnalytiX
              </p>
              <p style="margin:6px 0 0;font-size:12px;font-weight:400;letter-spacing:0.08em;text-transform:uppercase;color:#7ccdb3;">
                Rethink Intelligence
              </p>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background-color:#ffffff;padding:36px 40px;">
              <!-- Eyebrow -->
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7ccdb3;">
                New message
              </p>
              <h1 style="margin:0 0 28px;font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;line-height:1.25;">
                You have a new contact<br/>form submission
              </h1>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 28px;" />

              <!-- Fields -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding:0 0 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Name</p>
                    <p style="margin:0;font-size:15px;font-weight:600;color:#0f172a;">${escapeHtml(name)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Email</p>
                    <p style="margin:0;font-size:15px;color:#0f172a;">
                      <a href="mailto:${escapeHtml(data.email)}" style="color:#1f7a5a;text-decoration:none;font-weight:500;">${escapeHtml(data.email)}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Date</p>
                    <p style="margin:0;font-size:15px;color:#0f172a;">${new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" })} UTC</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Message</p>
                    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
                      <p style="margin:0;font-size:15px;line-height:1.65;color:#0f172a;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />

              <!-- Reply CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background-color:#7ccdb3;">
                    <a href="mailto:${escapeHtml(data.email)}"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#0f3d2e;text-decoration:none;letter-spacing:-0.01em;">
                      Reply to ${escapeHtml(name)} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#5a687c;">
                <strong style="color:#0f172a;">BioAnalytiX</strong> &nbsp;·&nbsp; Thessaloniki, Greece &nbsp;·&nbsp;
                <a href="https://www.bioanalytix.info" style="color:#1f7a5a;text-decoration:none;">bioanalytix.info</a>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">
                © ${new Date().getFullYear()} BioAnalytiX. This email was sent because someone submitted the contact form on your website.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const resend = new Resend(apiKey);

    // Send both emails in parallel: internal notification + sender confirmation.
    const [internal, confirmation] = await Promise.all([
      // 1. Internal notification to the BioAnalytiX inbox.
      resend.emails.send({
        from,
        to,
        replyTo: data.email,
        subject: `New contact message from ${name}`,
        text,
        html,
      }),
      // 2. Confirmation email to the sender — premium branded design.
      resend.emails.send({
        from,
        to: data.email,
        subject: `We received your message — BioAnalytiX`,
        text: [
          `Hi ${name},`,
          ``,
          `Thank you for reaching out to BioAnalytiX. We have received your message and will get back to you as soon as possible — usually within 1–2 business days.`,
          ``,
          `Your message:`,
          `"${data.message}"`,
          ``,
          `In the meantime, feel free to explore our work at https://www.bioanalytix.info`,
          ``,
          `Best regards,`,
          `The BioAnalytiX Team`,
          ``,
          `BioAnalytiX · Thessaloniki, Greece · bioanalytix.info`,
          `© ${new Date().getFullYear()} BioAnalytiX. All rights reserved.`,
        ].join("\n"),
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We received your message</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f8;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;">

          <!-- Logo bar -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <a href="https://www.bioanalytix.info" style="text-decoration:none;">
                <img
                  src="https://www.bioanalytix.info/images/complete-logo.svg"
                  alt="BioAnalytiX"
                  width="180"
                  height="64"
                  style="display:inline-block;width:180px;height:auto;border:0;"
                />
              </a>
            </td>
          </tr>

          <!-- Hero card -->
          <tr>
            <td style="background-color:#daf7ec;border-radius:16px 16px 0 0;padding:48px 48px 40px;text-align:center;">
              <!-- Mint accent bar -->
              <div style="width:48px;height:4px;background-color:#1f7a5a;border-radius:2px;margin:0 auto 28px;"></div>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;line-height:1.2;">
                Message received.
              </h1>
              <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:#1f7a5a;max-width:380px;margin:0 auto;">
                Thanks for reaching out, <strong style="color:#0f172a;">${escapeHtml(name)}</strong>. We'll be in touch shortly.
              </p>
            </td>
          </tr>

          <!-- White body card -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 48px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- What to expect -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td style="vertical-align:top;padding-right:16px;width:40px;">
                    <div style="width:40px;height:40px;border-radius:10px;background-color:#daf7ec;text-align:center;vertical-align:middle;line-height:40px;">
                      <span style="font-size:20px;color:#1f7a5a;">&#10003;</span>
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0f172a;">Your message has been received</p>
                    <p style="margin:0;font-size:13px;color:#5a687c;line-height:1.5;">Our team reviews every message personally and will respond within <strong style="color:#0f172a;">1–2 business days</strong>.</p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 28px;" />

              <!-- Message recap -->
              <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#5a687c;">Your message</p>
              <div style="background-color:#f8fafc;border-left:3px solid #7ccdb3;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:32px;">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#334155;white-space:pre-wrap;font-style:italic;">"${escapeHtml(data.message)}"</p>
              </div>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 28px;" />

              <!-- Products teaser -->
              <p style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#5a687c;">While you wait, explore our work</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td width="50%" style="padding-right:8px;vertical-align:top;">
                    <a href="https://www.bioanalytix.info/product" style="display:block;text-decoration:none;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;transition:border-color 0.2s;">
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Orasis AI</p>
                      <p style="margin:0;font-size:12px;color:#5a687c;line-height:1.4;">AI-powered brain CT analysis for radiologists</p>
                    </a>
                  </td>
                  <td width="50%" style="padding-left:8px;vertical-align:top;">
                    <a href="https://www.bioanalytix.info/gnosis-ai" style="display:block;text-decoration:none;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;">
                      <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a;">Gnosis AI</p>
                      <p style="margin:0;font-size:12px;color:#5a687c;line-height:1.4;">AI study companion for university students</p>
                    </a>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background-color:#7ccdb3;">
                    <a href="https://www.bioanalytix.info"
                       style="display:inline-block;padding:13px 32px;font-size:14px;font-weight:700;color:#0f3d2e;text-decoration:none;letter-spacing:-0.01em;">
                      Visit bioanalytix.info →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#5a687c;">
                <strong style="color:#0f172a;">BioAnalytiX</strong>
                &nbsp;·&nbsp; Thessaloniki, Greece
                &nbsp;·&nbsp;
                <a href="https://www.bioanalytix.info" style="color:#1f7a5a;text-decoration:none;font-weight:500;">bioanalytix.info</a>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;line-height:1.5;">
                © ${new Date().getFullYear()} BioAnalytiX. You received this confirmation because you submitted the contact form on our website.
              </p>
            </td>
          </tr>

          <!-- Bottom spacing -->
          <tr><td style="height:32px;"></td></tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      }),
    ]);

    // The submission succeeds as long as the internal notification is delivered.
    // A failed confirmation is non-blocking — the visitor's message is still received.
    return !internal.error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Beta / Careers / Collaboration confirmation emails
// ---------------------------------------------------------------------------

/** Per-source copy variations. */
const SOURCE_COPY: Record<
  SubmissionSource,
  {
    subject: string;
    heroTitle: string;
    heroSub: string;
    checkTitle: string;
    checkBody: string;
    nextStepTitle: string;
    nextStepBody: string;
    ctaLabel: string;
    ctaHref: string;
  }
> = {
  beta: {
    subject: "We received your beta access request — BioAnalytiX",
    heroTitle: "Beta request received.",
    heroSub: "Thanks for your interest in Gnosis AI. We'll review your request and be in touch soon.",
    checkTitle: "You're on the list",
    checkBody:
      "Our team will review your application and reach out when we're ready to onboard new beta users. We'll keep you posted on our progress.",
    nextStepTitle: "What happens next?",
    nextStepBody:
      "We're reviewing all beta requests personally. Once accepted, you'll receive access instructions and onboarding details by email.",
    ctaLabel: "Learn more about Gnosis AI →",
    ctaHref: "https://www.bioanalytix.info/gnosis-ai",
  },
  careers: {
    subject: "We received your application — BioAnalytiX",
    heroTitle: "Application received.",
    heroSub:
      "Thanks for your interest in joining BioAnalytiX. We'll review your details and reach out when a relevant role opens.",
    checkTitle: "You've joined our talent pool",
    checkBody:
      "We don't have open positions right now, but we review every application carefully. When a role that matches your profile opens, you'll be the first to hear.",
    nextStepTitle: "What happens next?",
    nextStepBody:
      "Our team will keep your details on file. When we're ready to hire, we'll reach out directly for an initial conversation.",
    ctaLabel: "Learn about our mission →",
    ctaHref: "https://www.bioanalytix.info/about",
  },
  collaboration: {
    subject: "We received your collaboration request — BioAnalytiX",
    heroTitle: "Request received.",
    heroSub:
      "Thanks for reaching out about a collaboration with BioAnalytiX. We'll review your message and follow up shortly.",
    checkTitle: "We've received your request",
    checkBody:
      "Our team reviews every collaboration inquiry personally. We're particularly interested in clinical and academic partnerships that advance trustworthy AI in healthcare.",
    nextStepTitle: "What happens next?",
    nextStepBody:
      "We'll evaluate the collaboration opportunity and reach out to schedule a call to discuss next steps. Expect to hear from us within a few business days.",
    ctaLabel: "Learn about our technology →",
    ctaHref: "https://www.bioanalytix.info/product",
  },
};

/**
 * Send a branded confirmation email to a beta / careers / collaboration
 * applicant. Non-blocking — a failure here does not prevent the submission
 * from being stored. Returns `true` when Resend accepts the message.
 */
export async function sendBetaConfirmationEmail(
  record: Pick<BetaSubmissionRecord, "source" | "fullName" | "email" | "organization" | "role" | "message">,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from = senderFor(record.source ?? "beta");

  const copy = SOURCE_COPY[record.source ?? "beta"];
  const name = sanitizeHeaderValue(record.fullName);

  const escHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const year = new Date().getFullYear();

  // Details rows (org / role / message) — only rendered when present.
  const detailRows = [
    record.organization && `<tr><td style="padding:0 0 16px;"><p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Organization</p><p style="margin:0;font-size:14px;color:#0f172a;">${escHtml(record.organization)}</p></td></tr>`,
    record.role && `<tr><td style="padding:0 0 16px;"><p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Role</p><p style="margin:0;font-size:14px;color:#0f172a;">${escHtml(record.role)}</p></td></tr>`,
    record.message && `<tr><td style="padding:0 0 0;"><p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Your message</p><div style="background-color:#f8fafc;border-left:3px solid #7ccdb3;border-radius:0 8px 8px 0;padding:14px 18px;"><p style="margin:0;font-size:14px;line-height:1.7;color:#334155;white-space:pre-wrap;font-style:italic;">"${escHtml(record.message)}"</p></div></td></tr>`,
  ].filter(Boolean).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4f8;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;">

          <!-- Logo bar -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <a href="https://www.bioanalytix.info" style="text-decoration:none;">
                <img src="https://www.bioanalytix.info/images/complete-logo.svg" alt="BioAnalytiX" width="180" height="64" style="display:inline-block;width:180px;height:auto;border:0;" />
              </a>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="background-color:#daf7ec;border-radius:16px 16px 0 0;padding:48px 48px 40px;text-align:center;">
              <div style="width:48px;height:4px;background-color:#1f7a5a;border-radius:2px;margin:0 auto 28px;"></div>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;line-height:1.2;">${escHtml(copy.heroTitle)}</h1>
              <p style="margin:0 auto;font-size:16px;line-height:1.6;color:#1f7a5a;max-width:400px;">
                Hi <strong style="color:#0f172a;">${escHtml(name)}</strong> — ${escHtml(copy.heroSub)}
              </p>
            </td>
          </tr>

          <!-- White body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 48px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- Check row -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td style="vertical-align:top;padding-right:16px;width:40px;">
                    <div style="width:40px;height:40px;border-radius:10px;background-color:#daf7ec;text-align:center;line-height:40px;">
                      <span style="font-size:20px;color:#1f7a5a;">&#10003;</span>
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0f172a;">${escHtml(copy.checkTitle)}</p>
                    <p style="margin:0;font-size:13px;color:#5a687c;line-height:1.5;">${escHtml(copy.checkBody)}</p>
                  </td>
                </tr>
              </table>

              <hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 28px;" />

              <!-- Submission details -->
              ${detailRows ? `<p style="margin:0 0 16px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#5a687c;">Your submission</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">${detailRows}</table><hr style="border:none;border-top:1px solid #f1f5f9;margin:0 0 28px;" />` : ""}

              <!-- Next steps -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td style="vertical-align:top;padding-right:16px;width:40px;">
                    <div style="width:40px;height:40px;border-radius:10px;background-color:#f0f4f8;text-align:center;line-height:40px;">
                      <span style="font-size:18px;color:#5a687c;">&#8594;</span>
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0f172a;">${escHtml(copy.nextStepTitle)}</p>
                    <p style="margin:0;font-size:13px;color:#5a687c;line-height:1.5;">${escHtml(copy.nextStepBody)}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background-color:#7ccdb3;">
                    <a href="${copy.ctaHref}" style="display:inline-block;padding:13px 32px;font-size:14px;font-weight:700;color:#0f3d2e;text-decoration:none;letter-spacing:-0.01em;">${copy.ctaLabel}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:#5a687c;">
                <strong style="color:#0f172a;">BioAnalytiX</strong> &nbsp;·&nbsp; Thessaloniki, Greece &nbsp;·&nbsp;
                <a href="https://www.bioanalytix.info" style="color:#1f7a5a;text-decoration:none;font-weight:500;">bioanalytix.info</a>
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;line-height:1.5;">
                © ${year} BioAnalytiX. You received this because you submitted a form on our website.
              </p>
            </td>
          </tr>

          <tr><td style="height:32px;"></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `Hi ${name},`,
    ``,
    copy.heroSub,
    ``,
    copy.checkTitle,
    copy.checkBody,
    ``,
    copy.nextStepTitle,
    copy.nextStepBody,
    ``,
    record.organization ? `Organization: ${record.organization}` : "",
    record.role ? `Role: ${record.role}` : "",
    record.message ? `Your message: "${record.message}"` : "",
    ``,
    `Best regards,`,
    `The BioAnalytiX Team`,
    ``,
    `BioAnalytiX · Thessaloniki, Greece · bioanalytix.info`,
    `© ${year} BioAnalytiX. All rights reserved.`,
  ].filter((l) => l !== undefined).join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: record.email,
      subject: copy.subject,
      text,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Internal notification for beta / careers / collaboration submissions
// ---------------------------------------------------------------------------

const SOURCE_LABEL_INTERNAL: Record<SubmissionSource, string> = {
  beta:          "Beta Access Request",
  careers:       "Careers Application",
  collaboration: "Collaboration Request",
};

/**
 * Send an internal notification to the BioAnalytiX inbox whenever a new
 * beta / careers / collaboration submission is stored. Non-blocking.
 *
 * For careers submissions, `cvDriveUrl` (when present) is rendered as a
 * prominent call-to-action button in the email so the reviewer can open the
 * CV directly from the notification.
 */
export async function sendBetaNotificationEmail(
  record: Pick<BetaSubmissionRecord, "source" | "fullName" | "email" | "organization" | "role" | "message" | "cvDriveUrl">,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const to   = mailboxFor(record.source);
  const from = senderFor(record.source);

  const name  = sanitizeHeaderValue(record.fullName);
  const label = SOURCE_LABEL_INTERNAL[record.source];

  const escHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const detailRows = [
    `<tr><td style="padding:4px 12px 4px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Name</td><td style="font-size:14px;font-weight:600;color:#0f172a;">${escHtml(name)}</td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Email</td><td style="font-size:14px;color:#0f172a;"><a href="mailto:${escHtml(record.email)}" style="color:#1f7a5a;text-decoration:none;">${escHtml(record.email)}</a></td></tr>`,
    record.organization ? `<tr><td style="padding:4px 12px 4px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Organization</td><td style="font-size:14px;color:#0f172a;">${escHtml(record.organization)}</td></tr>` : "",
    record.role ? `<tr><td style="padding:4px 12px 4px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Role</td><td style="font-size:14px;color:#0f172a;">${escHtml(record.role)}</td></tr>` : "",
    `<tr><td style="padding:4px 12px 4px 0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Date</td><td style="font-size:14px;color:#0f172a;">${new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "UTC" })} UTC</td></tr>`,
  ].filter(Boolean).join("");

  const messageBlock = record.message
    ? `<p style="margin:16px 0 8px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">Message</p><div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;"><p style="margin:0;font-size:14px;line-height:1.7;color:#0f172a;white-space:pre-wrap;">${escHtml(record.message)}</p></div>`
    : "";

  // CV button — shown only for careers submissions that include a Drive link.
  const cvBlock = record.cvDriveUrl
    ? `<div style="margin:20px 0 0;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#5a687c;">CV / Resume</p>
        <table role="presentation" cellspacing="0" cellpadding="0">
          <tr><td style="border-radius:8px;background-color:#dbeafe;">
            <a href="${escHtml(record.cvDriveUrl)}" style="display:inline-block;padding:10px 22px;font-size:13px;font-weight:700;color:#1e40af;text-decoration:none;">
              View CV on Google Drive →
            </a>
          </td></tr>
        </table>
      </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>New ${escHtml(label)}</title></head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;">
        <tr><td style="background-color:#0f172a;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
          <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">BioAnalytiX</p>
          <p style="margin:4px 0 0;font-size:11px;font-weight:400;letter-spacing:0.08em;text-transform:uppercase;color:#7ccdb3;">Rethink Intelligence</p>
        </td></tr>
        <tr><td style="background-color:#ffffff;padding:32px 40px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7ccdb3;">New submission</p>
          <h1 style="margin:0 0 24px;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#0f172a;line-height:1.25;">New ${escHtml(label)}</h1>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 20px;"/>
          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${detailRows}</table>
          ${messageBlock}
          ${cvBlock}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>
          <table role="presentation" cellspacing="0" cellpadding="0">
            <tr><td style="border-radius:8px;background-color:#7ccdb3;">
              <a href="mailto:${escHtml(record.email)}" style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:700;color:#0f3d2e;text-decoration:none;">Reply to ${escHtml(name)} →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:16px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#94a3b8;">© ${new Date().getFullYear()} BioAnalytiX · This notification was generated automatically.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `New ${label} — BioAnalytiX`,
    `${"─".repeat(40)}`,
    `Name: ${name}`,
    `Email: ${record.email}`,
    record.organization ? `Organization: ${record.organization}` : "",
    record.role ? `Role: ${record.role}` : "",
    `Date: ${new Date().toISOString()}`,
    record.message ? `\nMessage:\n${record.message}` : "",
    record.cvDriveUrl ? `\nCV / Resume: ${record.cvDriveUrl}` : "",
  ].filter(Boolean).join("\n");

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: record.email,
      subject: `[BioAnalytiX] New ${label} from ${name}`,
      text,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}
