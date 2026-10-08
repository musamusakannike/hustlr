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

export interface SendEmailResult {
  success: boolean;
  provider?: "resend" | "smtp" | "none";
  error?: string;
  messageId?: string;
}

export async function sendEmail(params: {
  to: string | string[];
  templateName: string;
  data?: Record<string, string | number | undefined>;
  subject?: string;
}): Promise<SendEmailResult> {
  const rendered = renderEmail(params.templateName, params.data ?? {});
  const subject = params.subject ?? rendered.subject;
  const html = rendered.html;
  const to = Array.isArray(params.to) ? params.to : [params.to];

  const resendClient = getResend();
  if (resendClient) {
    try {
      const res = await resendClient.emails.send({
        from: getFrom(),
        to,
        subject,
        html,
      });
      return { success: true, provider: "resend", messageId: res.data?.id };
    } catch (error) {
      console.error(`[EmailService] Resend failed for ${params.templateName} to ${to.join(",")}, trying SMTP:`, error);
    }
  }

  const transporter = getSmtp();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: getFrom(),
        to: to.join(","),
        subject,
        html,
      });
      return { success: true, provider: "smtp", messageId: info.messageId };
    } catch (error) {
      console.error(`[EmailService] SMTP failed for ${params.templateName} to ${to.join(",")}:`, error);
      return { success: false, provider: "smtp", error: error instanceof Error ? error.message : String(error) };
    }
  }

  console.warn(`[EmailService] Email skipped (no provider). To=${to.join(",")} template=${params.templateName}`);
  return { success: false, provider: "none", error: "No email provider configured" };
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
