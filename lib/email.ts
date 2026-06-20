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
    console.error("[sendContactEmail] RESEND_API_KEY is not set");
    return false;
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO;
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM;

  console.log("[sendContactEmail] Sending from:", from, "to:", to);

  const name = sanitizeHeaderValue(data.name);
  const submittedAt = new Date().toISOString();

  const text = [
    `New contact form submission`,
    ``,
    `Name:    ${name}`,
    `Email:   ${data.email}`,
    `Date:    ${submittedAt}`,
    ``,
    `Message:`,
    data.message,
  ].join("\n");

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const html = [
    `<h2 style="margin:0 0 16px">New contact form submission</h2>`,
    `<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">`,
    `<tr><td style="padding:4px 12px 4px 0;color:#5A687C">Name</td><td><strong>${escapeHtml(name)}</strong></td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#5A687C">Email</td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>`,
    `<tr><td style="padding:4px 12px 4px 0;color:#5A687C">Date</td><td>${escapeHtml(submittedAt)}</td></tr>`,
    `</table>`,
    `<p style="white-space:pre-wrap;margin-top:16px;font-family:system-ui,sans-serif;font-size:14px">${escapeHtml(data.message)}</p>`,
  ].join("");

  try {
    const resend = new Resend(apiKey);
    const { data: sendData, error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `New contact message from ${name}`,
      text,
      html,
    });
    if (error) {
      console.error("[sendContactEmail] Resend error:", JSON.stringify(error));
      return false;
    }
    console.log("[sendContactEmail] Sent successfully, id:", sendData?.id);
    return true;
  } catch (err) {
    console.error("[sendContactEmail] Unexpected error:", err);
    return false;
  }
}
