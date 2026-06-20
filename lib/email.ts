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
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `New contact message from ${name}`,
      text,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}
