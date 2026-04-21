// Executor — Fuehrt approved AgentActions tatsaechlich gegen die Services aus.
// Wird vom Approval-Handler (/api/kapi/actions/[id]/approve) aufgerufen.

import { prisma } from '@/lib/db';
import { createDraftFromTimeEntries, registerPayment as svcRegisterPayment } from '@/lib/services/invoice.service';
import { renderInvoicePdfBuffer } from '@/lib/services/invoice-pdf.service';
import { buildXRechnungXml } from '@/lib/services/xrechnung.service';
import { sendMail } from '@/lib/services/email.service';
import { markSent } from '@/lib/services/invoice.service';
import { runReminderEngine } from '@/lib/services/reminder.service';
import { buildDatevBuchungsstapelCsv } from '@/lib/services/datev-export.service';
import { tenantDbFor } from '@/lib/tenant-prisma';

export async function executeApprovedAction(actionId: string): Promise<{ result: unknown }> {
  const action = await prisma.agentAction.findUniqueOrThrow({ where: { id: actionId } });
  if (action.status !== 'APPROVED') throw new Error('Aktion nicht freigegeben.');

  const input = action.input as any;
  try {
    let result: unknown;
    switch (action.toolName) {
      case 'createDraftFromTimes':
        result = await createDraftFromTimeEntries({
          tenantId: action.tenantId,
          customerId: input.customerId,
          from: new Date(input.from),
          to: new Date(input.to),
        });
        break;

      case 'sendInvoice': {
        const db = tenantDbFor(action.tenantId);
        const invoice = await db.invoice.findUniqueOrThrow({
          where: { id: input.invoiceId },
          include: { customer: true, items: { orderBy: { position: 'asc' } } },
        });
        const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: action.tenantId } });
        const pdf = await renderInvoicePdfBuffer({ invoice: invoice as any, tenant });
        const xml = buildXRechnungXml({ invoice: invoice as any, tenant });
        const to = input.to ?? invoice.customer.contactEmail;
        if (!to) throw new Error('Keine E-Mail hinterlegt.');
        const mail = await sendMail({
          to,
          subject: `Rechnung ${invoice.invoiceNo} von ${tenant.name}`,
          body: `Anbei unsere Rechnung ${invoice.invoiceNo}. Zahlbar bis ${new Date(invoice.dueDate).toLocaleDateString('de-DE')}.`,
          attachments: [
            { filename: `Rechnung-${invoice.invoiceNo}.pdf`, content: pdf, contentType: 'application/pdf' },
            { filename: `XRechnung-${invoice.invoiceNo}.xml`, content: xml, contentType: 'application/xml' },
          ],
        });
        await markSent(action.tenantId, invoice.id);
        result = { messageId: mail.id, skipped: mail.skipped ?? false };
        break;
      }

      case 'runReminders':
        result = await runReminderEngine(action.tenantId, false);
        break;

      case 'exportDatev': {
        const db = tenantDbFor(action.tenantId);
        const invoices = await db.invoice.findMany({
          where: {
            status: { in: ['OPEN', 'SENT', 'VIEWED', 'PARTIAL', 'PAID', 'OVERDUE'] },
            issueDate: { gte: new Date(input.from), lte: new Date(input.to) },
          },
          include: { customer: true, items: true },
        });
        const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: action.tenantId } });
        const csv = buildDatevBuchungsstapelCsv({
          tenant,
          invoices: invoices as any,
          periodFrom: new Date(input.from),
          periodTo: new Date(input.to),
        });
        result = { csvLength: csv.length, invoiceCount: invoices.length };
        break;
      }

      case 'registerPayment':
        result = await svcRegisterPayment(action.tenantId, input.invoiceId, input.amount, {
          method: input.method,
          reference: input.reference,
        });
        break;

      default:
        throw new Error(`Unbekanntes Tool: ${action.toolName}`);
    }

    await prisma.agentAction.update({
      where: { id: actionId },
      data: { status: 'EXECUTED', output: result as any, executedAt: new Date() },
    });
    return { result };
  } catch (e: any) {
    await prisma.agentAction.update({
      where: { id: actionId },
      data: { status: 'FAILED', errorMessage: e.message, executedAt: new Date() },
    });
    throw e;
  }
}
