import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import { env } from '../config/env';
import { logger } from './logger';

const hasSmtpConfig = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
const smtpPassword = env.SMTP_PASSWORD.replace(/["'\s]+/g, '');

function createTransporters(): Transporter[] {
  if (!hasSmtpConfig) {
    return [];
  }

  const transports: Transporter[] = [];

  if (env.SMTP_HOST.includes('gmail.com')) {
    transports.push(
      nodemailer.createTransport({
        service: 'gmail',
        secure: true,
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        auth: {
          user: env.SMTP_USER,
          pass: smtpPassword,
        },
      }),
    );
  }

  transports.push(
    nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      requireTLS: !env.SMTP_SECURE,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      tls: {
        servername: env.SMTP_HOST,
        ...(env.NODE_ENV !== 'production'
          ? {
              checkServerIdentity: () => undefined,
            }
          : {}),
      },
      auth: {
        user: env.SMTP_USER,
        pass: smtpPassword,
      },
    }),
  );

  return transports;
}

const transporters = createTransporters();

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail(payload: MailPayload) {
  if (transporters.length === 0) {
    logger.info(
      {
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      },
      '[TEST MODE] Email would be sent (SMTP not configured)',
    );
    return { skipped: true };
  }

  let lastError: string | null = null;

  for (const [index, transporter] of transporters.entries()) {
    try {
      const result = (await Promise.race([
        transporter.sendMail({
          from: env.SMTP_FROM,
          ...payload,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMTP timeout after 12s')), 12000),
        ),
      ])) as {
        messageId?: string;
      } | null;

      logger.info(
        { to: payload.to, subject: payload.subject, messageId: result?.messageId, attempt: index + 1 },
        'Email sent successfully via SMTP',
      );

      return result;
    } catch (error) {
      const smtpError = error as {
        code?: string;
        responseCode?: number;
        response?: string;
        command?: string;
        stack?: string;
      } | null;

      const message = error instanceof Error ? error.message : 'Unknown SMTP error';
      lastError = message;

      const logPayload = {
        to: payload.to,
        subject: payload.subject,
        error: smtpError?.stack ?? message,
        code: smtpError?.code,
        responseCode: smtpError?.responseCode,
        response: smtpError?.response,
        command: smtpError?.command,
        smtpHost: env.SMTP_HOST,
        smtpUser: env.SMTP_USER,
        attempt: index + 1,
        totalAttempts: transporters.length,
      };

      if (index < transporters.length - 1) {
        logger.warn(logPayload, 'SMTP mail send attempt failed, trying fallback transport');
      } else {
        logger.error(logPayload, 'SMTP mail send failed');
      }
    }
  }

  return { skipped: true, error: lastError ?? 'Unknown SMTP error' };
}

export async function sendWelcomeEmail(recipient: { to: string; name: string }) {
  const subject = 'Welcome to Elchub';

  return sendMail({
    to: recipient.to,
    subject,
    text: `Welcome, ${recipient.name}. Your account is ready.`,
    html: `<p>Welcome, <strong>${recipient.name}</strong>. Your account is ready.</p>`,
  });
}

export async function sendPasswordResetEmail(recipient: { to: string; name: string; resetLink: string }) {
  const subject = 'Reset password Elchub';

  return sendMail({
    to: recipient.to,
    subject,
    text: `Hi ${recipient.name}, gunakan link ini untuk reset password: ${recipient.resetLink}`,
    html: `<p>Hi <strong>${recipient.name}</strong>,</p><p>Klik link berikut untuk reset password:</p><p><a href="${recipient.resetLink}">${recipient.resetLink}</a></p>`,
  });
}