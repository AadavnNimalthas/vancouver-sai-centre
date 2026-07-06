import "server-only";
import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "Vancouver Sai Centre <vancouversaicentre@gmail.com>";

/**
 * Sends a branded transactional email via Resend.
 * Silently no-ops when RESEND_API_KEY is not configured (demo mode).
 */
export async function sendEmail(input: {
  to: string | string[];
  subject: string;
  heading: string;
  body: string;
}): Promise<void> {
  if (!resendKey) return;
  const resend = new Resend(resendKey);

  const paragraphs = input.body
    .split("\n\n")
    .map(
      (p) =>
        `<p style="margin:0 0 16px;color:#666;font-size:15px;line-height:1.7;">${p.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: `
<div style="background:#FBF9F6;padding:40px 16px;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:0 auto;background:#FFFDFA;border:1px solid #E7DFD3;border-radius:8px;padding:40px;">
    <p style="margin:0 0 24px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#C25F36;font-family:Arial,sans-serif;">Vancouver Sai Centre</p>
    <h1 style="margin:0 0 20px;font-size:26px;font-weight:500;color:#2B2B2B;">${input.heading}</h1>
    <div style="font-family:Arial,sans-serif;">${paragraphs}</div>
    <hr style="border:none;border-top:1px solid #E7DFD3;margin:28px 0;"/>
    <p style="margin:0;font-size:12px;color:#9B9186;font-family:Arial,sans-serif;">
      Love · Truth · Peace · Right Conduct · Non-Violence<br/>
      3855 Albert St, Burnaby BC
    </p>
  </div>
</div>`,
  });
}
