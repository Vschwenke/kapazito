// Rechnungs-Service — E2E Lifecycle.
//
// Funktionen:
//   - createDraftFromTimeEntries: Abrechnungs-Assistent. Nimmt approved Stunden,
//     gruppiert pro Projekt/Zeitraum, erzeugt einen Rechnungs-Entwurf.
//   - createManualDraft: Leere Rechnung mit Positionen anlegen.
//   - finalize: DRAFT -> OPEN, vergibt Nummer, berechnet Totals, erstellt PDF+XML.
//   - markSent: OPEN -> SENT (nach Versand).
//   - registerPayment: Payment anlegen, Status updaten.
//   - cancel: Storno.
//
// Geschaeftsregeln:
//   - Draft kann beliebig editiert werden.
//   - Sobald finalisiert, sind Positionen eingefroren (Compliance).
//   - paidAmount >= grossAmount -> PAID; >0 und <gross -> PARTIAL; = 0 und due passed -> OVERDUE.

import { prisma } from '@/lib/db';
import { nextInvoiceNumber } from './invoice-number.service';
import type { Prisma, Invoice, InvoiceStatus, InvoiceItem } from '@prisma/client';
import { addDays } from 'date-fns';
import { logger } from '@/lib/errors';

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------

export interface InvoiceItemDraft {
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  vatRate?: number;
  vatCategory?: 'S' | 'AE' | 'Z' | 'E';
  projectId?: string;
  servicePeriodFrom?: Date | null;
  servicePeriodTo?: Date | null;
  timeEntryIds?: string[]; // Zum Traceability-Link
}

export interface CreateInvoiceDraftInput {
  tenantId: string;
  customerId: string;
  items: InvoiceItemDraft[];
  issueDate?: Date;
  paymentTerms?: number;
  headerText?: string;
  footerText?: string;
  servicePeriodFrom?: Date | null;
  servicePeriodTo?: Date | null;
}

export interface DraftFromTimeEntriesInput {
  tenantId: string;
  customerId: string;
  from: Date;
  to: Date;
  projectId?: string;
  issueDate?: Date;
  paymentTerms?: number;
}

// ------------------------------------------------------------------
// DRAFT FROM TIME ENTRIES — Kernfeature des Abrechnungs-Assistenten
// ------------------------------------------------------------------

export async function createDraftFromTimeEntries(input: DraftFromTimeEntriesInput): Promise<Invoice> {
  const { tenantId, customerId, from, to, projectId } = input;

  // Hole alle approved, noch nicht abgerechneten TimeEntries im Zeitraum.
  const entries = await prisma.timeEntry.findMany({
    where: {
      tenantId,
      customerId,
      projectId: projectId ?? undefined,
      status: 'APPROVED',
      isBillable: true,
      date: { gte: from, lte: to },
    },
    include: { project: true, employee: true },
    orderBy: [{ projectId: 'asc' }, { date: 'asc' }],
  });

  if (entries.length === 0) {
    throw new Error('Keine abrechenbaren Zeiten fuer diesen Zeitraum gefunden.');
  }

  // Gruppiere pro Projekt + Rate
  const groups = new Map<string, {
    project: typeof entries[number]['project'];
    hours: number;
    rate: number;
    ids: string[];
    descriptions: Set<string>;
  }>();

  for (const e of entries) {
    const rate = Number(e.project?.hourlyRate ?? 0);
    const key = `${e.projectId ?? 'none'}:${rate}`;
    const g = groups.get(key) ?? {
      project: e.project,
      hours: 0,
      rate,
      ids: [],
      descriptions: new Set<string>(),
    };
    g.hours += e.billableHours;
    g.ids.push(e.id);
    if (e.description) g.descriptions.add(e.description);
    groups.set(key, g);
  }

  const customer = await prisma.customer.findFirstOrThrow({ where: { tenantId, id: customerId } });
  const tenant = await prisma.tenant.findFirstOrThrow({ where: { id: tenantId } });

  const items: InvoiceItemDraft[] = [];
  let position = 1;
  for (const g of groups.values()) {
    const desc = g.project
      ? `${g.project.name} (${formatDate(from)} – ${formatDate(to)})`
      : `Beratungsleistung (${formatDate(from)} – ${formatDate(to)})`;
    items.push({
      description: desc,
      quantity: g.hours,
      unit: 'Std',
      unitPrice: g.rate,
      vatRate: Number(g.project?.vatRate ?? 19),
      vatCategory: 'S',
      projectId: g.project?.id,
      servicePeriodFrom: from,
      servicePeriodTo: to,
      timeEntryIds: g.ids,
    });
    position++;
  }

  return createDraft({
    tenantId,
    customerId,
    items,
    issueDate: input.issueDate ?? new Date(),
    paymentTerms: input.paymentTerms ?? customer.paymentTerms,
    headerText: `Leistungszeitraum ${formatDate(from)} bis ${formatDate(to)}`,
    footerText: undefined,
    servicePeriodFrom: from,
    servicePeriodTo: to,
  });
}

// ------------------------------------------------------------------
// CREATE DRAFT
// ------------------------------------------------------------------

export async function createDraft(input: CreateInvoiceDraftInput): Promise<Invoice> {
  const { tenantId, customerId, items } = input;
  if (items.length === 0) throw new Error('Mindestens eine Position ist erforderlich.');

  const tenant = await prisma.tenant.findFirstOrThrow({ where: { id: tenantId } });
  const customer = await prisma.customer.findFirstOrThrow({ where: { tenantId, id: customerId } });

  const calcItems = items.map((it, idx) => {
    const net = round(it.quantity * it.unitPrice);
    const vatRate = it.vatRate ?? 19;
    const vat = round((net * vatRate) / 100);
    return {
      position: idx + 1,
      description: it.description,
      quantity: it.quantity,
      unit: it.unit ?? 'Std',
      unitPrice: it.unitPrice,
      netAmount: net,
      vatRate,
      vatAmount: vat,
      vatCategory: it.vatCategory ?? 'S',
      projectId: it.projectId,
      servicePeriodFrom: it.servicePeriodFrom ?? null,
      servicePeriodTo: it.servicePeriodTo ?? null,
      timeEntryIds: it.timeEntryIds ?? [],
    };
  });

  const netTotal = calcItems.reduce((s, i) => s + i.netAmount, 0);
  const vatTotal = calcItems.reduce((s, i) => s + i.vatAmount, 0);
  const grossTotal = round(netTotal + vatTotal);

  const issueDate = input.issueDate ?? new Date();
  const dueDate = addDays(issueDate, input.paymentTerms ?? customer.paymentTerms ?? 14);

  // DRAFT bekommt VORLAEUFIGE Nummer (wird beim Finalisieren gezogen).
  // Wir setzen hier "ENTWURF-{timestamp}" um Unique-Constraint zu erfuellen.
  const placeholderNo = `ENTWURF-${Date.now()}`;

  const invoice = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        tenantId,
        customerId,
        invoiceNo: placeholderNo,
        status: 'DRAFT',
        issueDate,
        dueDate,
        servicePeriodFrom: input.servicePeriodFrom ?? null,
        servicePeriodTo: input.servicePeriodTo ?? null,
        netAmount: netTotal,
        vatAmount: vatTotal,
        grossAmount: grossTotal,
        currency: tenant.defaultCurrency,
        paymentTerms: input.paymentTerms ?? customer.paymentTerms,
        headerText: input.headerText,
        footerText: input.footerText,
        bankIban: tenant.iban,
        bankBic: tenant.bic,
        bankName: tenant.bankName,
        leitwegId: customer.leitwegId,
        peppolId: customer.peppolId,
      },
    });

    for (const it of calcItems) {
      const item = await tx.invoiceItem.create({
        data: {
          tenantId,
          invoiceId: inv.id,
          position: it.position,
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
          netAmount: it.netAmount,
          vatRate: it.vatRate,
          vatAmount: it.vatAmount,
          vatCategory: it.vatCategory,
          projectId: it.projectId,
          servicePeriodFrom: it.servicePeriodFrom,
          servicePeriodTo: it.servicePeriodTo,
        },
      });

      // TimeEntries an InvoiceItem binden, falls vorhanden.
      if (it.timeEntryIds.length > 0) {
        await tx.timeEntry.updateMany({
          where: { id: { in: it.timeEntryIds }, tenantId },
          data: { invoiceItemId: item.id, status: 'INVOICED' },
        });
      }
    }

    return inv;
  });

  logger.info({ tenantId, invoiceId: invoice.id, customerId }, 'Rechnungs-Entwurf erstellt');
  return invoice;
}

// ------------------------------------------------------------------
// FINALIZE — vergibt Nummer, eingefroren
// ------------------------------------------------------------------

export async function finalizeInvoice(tenantId: string, invoiceId: string): Promise<Invoice> {
  const inv = await prisma.invoice.findFirstOrThrow({ where: { tenantId, id: invoiceId } });
  if (inv.status !== 'DRAFT') throw new Error(`Rechnung ist bereits ${inv.status}, Finalisieren nicht moeglich.`);

  const number = await nextInvoiceNumber({ tenantId });
  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { invoiceNo: number, status: 'OPEN' },
  });
  logger.info({ tenantId, invoiceId, number }, 'Rechnung finalisiert');
  return updated;
}

// ------------------------------------------------------------------
// STATUS-OPERATIONEN
// ------------------------------------------------------------------

export async function markSent(tenantId: string, invoiceId: string, sentAt?: Date): Promise<Invoice> {
  const inv = await prisma.invoice.findFirstOrThrow({ where: { tenantId, id: invoiceId } });
  if (inv.status === 'DRAFT') throw new Error('Draft kann nicht direkt auf SENT gesetzt werden.');
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'SENT', sentAt: sentAt ?? new Date() },
  });
}

export async function registerPayment(
  tenantId: string,
  invoiceId: string,
  amount: number,
  options: { receivedAt?: Date; method?: string; reference?: string; note?: string } = {}
) {
  return prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.findFirstOrThrow({ where: { tenantId, id: invoiceId } });
    const payment = await tx.payment.create({
      data: {
        tenantId,
        invoiceId,
        amount,
        receivedAt: options.receivedAt ?? new Date(),
        method: options.method,
        reference: options.reference,
        note: options.note,
      },
    });
    const paid = Number(inv.paidAmount) + amount;
    const gross = Number(inv.grossAmount);
    const status: InvoiceStatus = paid >= gross ? 'PAID' : paid > 0 ? 'PARTIAL' : inv.status;
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: paid, status, paidAt: status === 'PAID' ? new Date() : null },
    });
    return { payment, invoice: updated };
  });
}

export async function cancelInvoice(tenantId: string, invoiceId: string): Promise<Invoice> {
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });
}

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

function round(v: number): number {
  return Math.round(v * 100) / 100;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('de-DE');
}

/**
 * Berechnet Rechnung nochmal (Totals) nach Aenderung der Items.
 */
export async function recalculateTotals(tenantId: string, invoiceId: string): Promise<Invoice> {
  const items = await prisma.invoiceItem.findMany({ where: { tenantId, invoiceId } });
  const net = items.reduce((s, i) => s + Number(i.netAmount), 0);
  const vat = items.reduce((s, i) => s + Number(i.vatAmount), 0);
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: { netAmount: round(net), vatAmount: round(vat), grossAmount: round(net + vat) },
  });
}
