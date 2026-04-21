// POST /api/rechnungen/[id]/send — Rechnung per E-Mail versenden (PDF + XML)
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { prisma } from '@/lib/db';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { renderInvoicePdfBuffer } from '@/lib/services/invoice-pdf.service';
import { buildXRechnungXml } from '@/lib/services/xrechnung.service';
import { sendMail } from '@/lib/services/email.service';
import { markSent } from '@/lib/services/invoice.service';
import { audit } from '@/lib/services/audit.service';

const body = z.object({
  to: z.string().email().optional(),
  subject: z.string().optional(),
  message: z.string().optional(),
  includeXml: z.boolean().default(true),
});

export const POST = withErrorHandling(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:send');
  const input = await parseJson(req, body);

  const db = await tenantDb();
  const invoice = await db.invoice.findUniqueOrThrow({
    where: { id: ctx.params.id },
    include: { customer: true, items: { orderBy: { position: 'asc' } } },
  });
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  const to = input.to ?? invoice.customer.contactEmail;
  if (!to) throw new Error('Keine E-Mail-Adresse fuer den Kunden hinterlegt.');

  const pdf = await renderInvoicePdfBuffer({ invoice: invoice as any, tenant });
  const xml = input.includeXml ? buildXRechnungXml({ invoice: invoice as any, tenant }) : null;

  const attachments: Array<{ filename: string; content: Buffer | string; contentType?: string }> = [
    { filename: `Rechnung-${invoice.invoiceNo}.pdf`, content: pdf, contentType: 'application/pdf' },
  ];
  if (xml) attachments.push({ filename: `XRechnung-${invoice.invoiceNo}.xml`, content: xml, contentType: 'application/xml' });

  const subject = input.subject ?? `Rechnung ${invoice.invoiceNo} von ${tenant.name}`;
  const bodyText =
    input.message ??
    `Sehr geehrte Damen und Herren,\n\nanbei senden wir Ihnen unsere Rechnung ${invoice.invoiceNo} vom ${new Date(invoice.issueDate).toLocaleDateString('de-DE')} ueber ${Number(invoice.grossAmount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} ${invoice.currency}.\n\nDie Rechnung ist zahlbar bis zum ${new Date(invoice.dueDate).toLocaleDateString('de-DE')}.\n\nFreundliche Gruesse\n${tenant.name}`;

  const res = await sendMail({ to, subject, body: bodyText, attachments });
  const updated = await markSent(session.tenantId, invoice.id);
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'send', entity: 'Invoice', entityId: invoice.id, after: { to, messageId: res.id } });
  return json({ invoice: updated, sent: !res.skipped, messageId: res.id });
});
