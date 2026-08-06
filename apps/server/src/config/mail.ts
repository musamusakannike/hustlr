import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Nodemailer Transporter Setup
export const nodemailerTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Resend Client Setup
export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const sendNodemailerEmail = async (to: string, subject: string, html: string) => {
  return nodemailerTransporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@hustlr.com',
    to,
    subject,
    html,
  });
};

export const sendResendEmail = async (to: string, subject: string, html: string) => {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    to,
    subject,
    html,
  });
};
