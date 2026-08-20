import nodemailer from "nodemailer";
import { Resend } from "resend";
import { APP_NAME, BRAND, SUPPORT_EMAIL } from "../config/constants.config";
import { env } from "../config/env.config";
import { renderEmail } from "./email-templates.util";

let resend: Resend | null = null;
let smtp: nodemailer.Transporter | null = null;

function getFrom(): string {
  return env.emailFrom || `${APP_NAME} <noreply@${BRAND.domain}>`;
}

function getResend(): Resend | null {
  if (!env.resendApiKey) return null;
  if (!resend) resend = new Resend(env.resendApiKey);
  return resend;
}

function getSmtp(): nodemailer.Transporter | null {
  if (!env.smtpHost || !env.smtpUser) return null;
  if (!smtp) {
    smtp = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: { user: env.smtpUser, pass: env.smtpPassword },
    });
  }
  return smtp;
}

export async function sendEmail(params: {
  to: string | string[];
  templateName: string;
  data?: Record<string, string | number | undefined>;
  subject?: string;
}): Promise<void> {
  const rendered = renderEmail(params.templateName, params.data ?? {});
  const subject = params.subject ?? rendered.subject;
  const html = rendered.html;
  const to = Array.isArray(params.to) ? params.to : [params.to];

  const resendClient = getResend();
  if (resendClient) {
    try {
      await resendClient.emails.send({
        from: getFrom(),
        to,
        subject,
        html,
      });
      return;
    } catch (error) {
      console.error(`[${APP_NAME}] Resend failed, trying SMTP`, error);
    }
  }

  const transporter = getSmtp();
  if (transporter) {
    await transporter.sendMail({
      from: getFrom(),
      to: to.join(","),
      subject,
      html,
    });
    return;
  }

  console.warn(`[${APP_NAME}] Email skipped (no provider). To=${to.join(",")} subject=${subject}`);
}

export async function sendRawEmail(to: string, subject: string, html: string): Promise<void> {
  await sendEmail({
    to,
    templateName: "custom",
    subject,
    data: { subject, message: html },
  });
}

export function adminInbox(): string {
  return env.emailFrom ? SUPPORT_EMAIL : SUPPORT_EMAIL;
}
