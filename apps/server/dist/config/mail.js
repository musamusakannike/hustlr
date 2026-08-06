"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResendEmail = exports.sendNodemailerEmail = exports.resend = exports.nodemailerTransporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const resend_1 = require("resend");
// Nodemailer Transporter Setup
exports.nodemailerTransporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});
// Resend Client Setup
exports.resend = new resend_1.Resend(process.env.RESEND_API_KEY || 're_placeholder');
const sendNodemailerEmail = async (to, subject, html) => {
    return exports.nodemailerTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@hustlr.com',
        to,
        subject,
        html,
    });
};
exports.sendNodemailerEmail = sendNodemailerEmail;
const sendResendEmail = async (to, subject, html) => {
    return exports.resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html,
    });
};
exports.sendResendEmail = sendResendEmail;
