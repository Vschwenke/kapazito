// E-Mail-Versand via Resend. Fallback: Logging (Dev-Modus ohne API-Key).
import { Resend } from 'resend';
import { logger } from '@/lib/errors';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendMailInput {
  to: string | string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: EmailAttachment[];
  replyTo?: string;
}

export async function sendMail(input: SendMailInput): Promise<{ id: string | null; skipped?: boolean }> {
  const from = process.env.MAIL_FROM ?? 'Kapazito <no-reply@kapazito.de>';

  if (!resend) {
    logger.warn({ to: input.to, subject: input.subject }, 'RESEND_API_KEY fehlt — E-Mail nicht versendet');
    return { id: null, skipped: true };
  }

  const res = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.body,
    html: input.html,
    replyTo: input.replyTo,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
    })),
  });
  return { id: res.data?.id ?? null };
}
