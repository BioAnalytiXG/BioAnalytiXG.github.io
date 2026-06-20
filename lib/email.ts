import "server-only";

import { Resend } from "resend";

import type { ContactValues } from "@/lib/schemas";

/**
 * Contact-form email delivery via Resend.
 *
 * The contact form is delivered as an email to the BioAnalytiX inbox
 * (`info@bioanalytix.info` by default). All configuration is read from
 * server-only environment variables and is never shipped to the client:
 *
 *  - `RESEND_API_KEY`   (required) — Resend API key. When absent, delivery is
 *                        treated as unconfigured and {@link sendContactEmail}
 *                        returns `false` so the action surfaces a generic
 *                        retryable failure (Req 15.5) without leaking config.
 *  - `CONTACT_TO_EMAIL` (optional) — recipient. Defaults to info@bioanalytix.info.
 *  - `CONTACT_FROM_EMAIL` (optional) — verified sender. Defaults to a no-reply
 *                        address on the verified `bioanalytix.info` domain.
 *
 * The visitor's address is set as `replyTo` so a reply goes straight back to
 * them. Returns `true` only when Resend accepts the message.
 */

const DEFAULT_TO = "info@bioanalytix.info";
const DEFAULT_FROM = "BioAnalytiX Website <noreply@bioanalytix.info>";

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

  const to = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;

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
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a4a 100%);border-radius:16px 16px 0 0;padding:48px 48px 40px;text-align:center;">
              <!-- Mint accent bar -->
              <div style="width:48px;height:4px;background-color:#7ccdb3;border-radius:2px;margin:0 auto 28px;"></div>
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:700;letter-spacing:-0.02em;color:#ffffff !important;line-height:1.2;">
                Message received.
              </h1>
              <p style="margin:0 0 0 0;font-size:16px;line-height:1.6;color:#94a3b8;max-width:380px;">
                Thanks for reaching out, <strong style="color:#ffffff !important;">${escapeHtml(name)}</strong>. We'll be in touch shortly.
              </p>
            </td>
          </tr>

          <!-- White body card -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 48px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

              <!-- What to expect -->
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7ccdb3;">Message received</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:32px;">
                <tr>
                  <td style="vertical-align:top;padding-right:16px;width:40px;">
                    <div style="width:40px;height:40px;border-radius:10px;background-color:#daf7ec;display:table-cell;text-align:center;vertical-align:middle;">
                      <span style="font-size:20px;line-height:40px;">&#10003;</span>
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
