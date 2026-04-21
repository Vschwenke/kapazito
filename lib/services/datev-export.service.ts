// DATEV-Export — Buchungsstapel-CSV (EXTF-Format).
//
// Format: "DATEV Format fuer Buchungsstapel" (Version 510/700).
// Separator: Semikolon, Encoding: Windows-1252, Dezimal: Komma,
// Datum: TTMMJJJJ.
//
// Referenz: https://developer.datev.de/datev/platform/de/formate/buchungsstapel-csv
//
// Wir generieren zwei Dateien:
//   - Header-Zeile: EXTF;510;21;"Buchungsstapel";... (Metadaten)
//   - Body: pro Rechnung eine Zeile mit Umsatz, Soll-/Habenkonto, Beleginfo.
//
// Default-Konten (koennen pro Tenant angepasst werden):
//   Debitoren-Sammelkonto: 1400
//   Erloes 19 %: 8400
//   Erloes 7 %:  8300
//   Erloes 0 %:  8200 (innergemeinschaftlich)

import type { Invoice, InvoiceItem, Customer, Tenant } from '@prisma/client';

export interface DatevAccountMap {
  debtorCollective: string;       // 1400 (SKR03) oder 10000 (SKR04)
  revenueVat19: string;           // 8400 (SKR03) oder 4400 (SKR04)
  revenueVat7: string;            // 8300 (SKR03) oder 4300 (SKR04)
  revenueVat0: string;            // 8200 (SKR03) oder 4200 (SKR04)
}

export const DEFAULT_SKR03: DatevAccountMap = {
  debtorCollective: '1400',
  revenueVat19: '8400',
  revenueVat7: '8300',
  revenueVat0: '8200',
};

export interface DatevExportInput {
  tenant: Tenant;
  invoices: Array<Invoice & { items: InvoiceItem[]; customer: Customer }>;
  periodFrom: Date;
  periodTo: Date;
  accountMap?: DatevAccountMap;
}

export function buildDatevBuchungsstapelCsv(input: DatevExportInput): string {
  const { tenant, invoices, periodFrom, periodTo, accountMap = DEFAULT_SKR03 } = input;

  const lines: string[] = [];

  // Header (EXTF — 24 Felder)
  const meta = [
    '"EXTF"',
    '510',
    '21',
    '"Buchungsstapel"',
    '7',
    timestamp(),
    '',
    '"RE"',
    '"Kapazito"',
    '""',
    tenant.datevClientNo || '0',
    '0',
    datevDate(periodFrom),
    '4',
    datevDate(periodFrom),
    datevDate(periodTo),
    '"Rechnungen"',
    `"${(tenant.name || '').replace(/"/g, '""')}"`,
    '1',
    '0',
    '1',
    'EUR',
    '',
    '',
  ];
  lines.push(meta.join(';'));

  // Spalten-Header
  const cols = [
    'Umsatz (ohne Soll/Haben-Kz)',
    'Soll/Haben-Kennzeichen',
    'WKZ Umsatz',
    'Konto',
    'Gegenkonto (ohne BU-Schluessel)',
    'BU-Schluessel',
    'Belegdatum',
    'Belegfeld 1',
    'Belegfeld 2',
    'Skonto',
    'Buchungstext',
  ].map((c) => `"${c}"`);
  lines.push(cols.join(';'));

  // Body
  for (const inv of invoices) {
    if (inv.status === 'CANCELLED' || inv.status === 'DRAFT') continue;

    // Je USt-Satz eine Buchungszeile (Split)
    const vatGroups = groupByVat(inv.items);
    for (const g of vatGroups) {
      const account = g.rate === 19 ? accountMap.revenueVat19 : g.rate === 7 ? accountMap.revenueVat7 : accountMap.revenueVat0;
      const buKey = g.rate === 19 ? '2' : g.rate === 7 ? '3' : ''; // DATEV BU-Schluessel

      const row = [
        datevNumber(g.gross),
        '"S"',                                // Debit (Rechnung -> Forderung)
        'EUR',
        accountMap.debtorCollective,          // Soll: Debitor
        account,                              // Haben: Erloese
        buKey,
        datevDate(inv.issueDate),
        `"${inv.invoiceNo}"`,
        `"${inv.customer.shortName || inv.customer.name.substring(0, 36)}"`,
        '',
        `"Rechnung ${inv.customer.name}"`,
      ];
      lines.push(row.join(';'));
    }
  }

  return lines.join('\r\n');
}

function groupByVat(items: InvoiceItem[]): Array<{ rate: number; net: number; vat: number; gross: number }> {
  const m = new Map<number, { net: number; vat: number }>();
  for (const i of items) {
    const rate = Number(i.vatRate);
    const g = m.get(rate) ?? { net: 0, vat: 0 };
    g.net += Number(i.netAmount);
    g.vat += Number(i.vatAmount);
    m.set(rate, g);
  }
  return Array.from(m.entries()).map(([rate, g]) => ({
    rate,
    net: Math.round(g.net * 100) / 100,
    vat: Math.round(g.vat * 100) / 100,
    gross: Math.round((g.net + g.vat) * 100) / 100,
  }));
}

function datevDate(d: Date): string {
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}${mm}`;
}

function datevNumber(v: number): string {
  return v.toFixed(2).replace('.', ',');
}

function timestamp(): string {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0') +
    String(d.getSeconds()).padStart(2, '0') +
    '000'
  );
}
