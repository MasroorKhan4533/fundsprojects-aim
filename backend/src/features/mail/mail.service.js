import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

let transporter;
const testOutbox = [];

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
    });
  }
  return transporter;
};

const escapeHtml = (value) => String(value || "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

export const sendMail = async ({ to, subject, text, html }) => {
  if (env.smtp.deliveryMode === "test") {
    const message = { to, subject, text, html, createdAt: new Date() };
    testOutbox.push(message);
    return { messageId: `test-${testOutbox.length}` };
  }

  const info = await getTransporter().sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html,
  });
  logger.info({ messageId: info.messageId, to }, "Transactional email sent");
  return info;
};

export const sendActivationEmail = async ({ user, token }) => {
  const link = `${env.frontendUrl}/activate?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(user.fullName);
  return sendMail({
    to: user.email,
    subject: "Activate your FundsProjects AIM account",
    text: `Hello ${user.fullName}, your account has been approved. Set your password using this secure link: ${link}`,
    html: `<p>Hello ${safeName},</p><p>Your FundsProjects AIM account has been approved.</p><p><a href="${link}">Set your password and activate your account</a></p><p>This link expires automatically.</p>`,
  });
};

export const sendPasswordResetEmail = async ({ user, token }) => {
  const link = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml(user.fullName);
  return sendMail({
    to: user.email,
    subject: "Reset your FundsProjects AIM password",
    text: `Hello ${user.fullName}, reset your password using this secure link: ${link}`,
    html: `<p>Hello ${safeName},</p><p>A password reset was requested for your FundsProjects AIM account.</p><p><a href="${link}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
};

export const getTestOutbox = () => [...testOutbox];
export const clearTestOutbox = () => { testOutbox.length = 0; };
