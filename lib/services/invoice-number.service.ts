// Atomarer Nummernkreis-Service.
// Rechtsgrundlage: § 14 Abs. 4 UStG — Rechnungsnummern muessen fortlaufend
// und einmalig vergeben werden. Luecken sind erlaubt, muessen aber erklaerbar
// sein.
//
// Design:
// - Pro Tenant 1+ Nummernkreise (z.B. "2026-", "GS-2026-").
// - Increment passiert in einer Transaktion mit zweifelsfreier Semantik:
//     BEGIN -> UPDATE ... RETURNING lastNumber -> COMMIT
// - Format ueber Platzhalter: {prefix}{year}{seq:04d} -> "2026-0001"

import { prisma } from '@/lib/db';

export interface InvoiceNumberContext {
  tenantId: string;
  prefix?: string;
  year?: number;
}

/**
 * Gibt die naechste Rechnungsnummer aus (atomar).
 */
export async function nextInvoiceNumber(ctx: InvoiceNumberContext): Promise<string> {
  const year = ctx.year ?? new Date().getFullYear();
  const prefix = ctx.prefix ?? `${year}-`;

  // Atomare Operation via upsert + increment
  const range = await prisma.$transaction(async (tx) => {
    const existing = await tx.invoiceNumberRange.findFirst({
      where: { tenantId: ctx.tenantId, prefix, year },
    });
    if (existing) {
      return tx.invoiceNumberRange.update({
        where: { id: existing.id },
        data: { lastNumber: { increment: 1 } },
      });
    }
    return tx.invoiceNumberRange.create({
      data: {
        tenantId: ctx.tenantId,
        prefix,
        year,
        lastNumber: 1,
        format: '{prefix}{seq:04d}',
      },
    });
  });

  return formatInvoiceNumber(range.format, range.prefix, range.lastNumber, year);
}

export function formatInvoiceNumber(format: string, prefix: string, seq: number, year: number): string {
  return format
    .replace('{prefix}', prefix)
    .replace('{year}', String(year))
    .replace(/\{seq:(\d+)d\}/, (_m, w) => String(seq).padStart(parseInt(w, 10), '0'))
    .replace('{seq}', String(seq));
}

/**
 * Prueft Luecken im Nummernkreis (fuer Audit).
 */
export async function detectNumberGaps(tenantId: string, year: number): Promise<number[]> {
  const invoices = await prisma.invoice.findMany({
    where: { tenantId, issueDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
    select: { invoiceNo: true },
    orderBy: { invoiceNo: 'asc' },
  });
  const seqs = invoices
    .map((i) => i.invoiceNo.match(/(\d+)$/)?.[1])
    .filter(Boolean)
    .map((s) => parseInt(s!, 10))
    .sort((a, b) => a - b);

  const gaps: number[] = [];
  for (let i = 0; i < seqs.length - 1; i++) {
    for (let j = seqs[i] + 1; j < seqs[i + 1]; j++) {
      gaps.push(j);
    }
  }
  return gaps;
}
