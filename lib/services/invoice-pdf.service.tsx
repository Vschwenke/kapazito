// Rechnungs-PDF-Rendering mit @react-pdf/renderer.
// Tenant-Template: Logo, Farben, AGB-Block konfigurierbar.
//
// Hinweis: Das ZUGFeRD-konforme Einbetten des XML in eine PDF/A-3
// benoetigt eine zusaetzliche Nachbearbeitung (ghostscript / veraPDF).
// Das MVP hier liefert ein valides, professionelles PDF.

import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice, InvoiceItem, Customer, Tenant } from '@prisma/client';

interface PdfInput {
  invoice: Invoice & { items: InvoiceItem[]; customer: Customer };
  tenant: Tenant;
}

const COLORS = {
  teal: '#1a9a8a',
  slate900: '#0f172a',
  slate700: '#334155',
  slate500: '#64748b',
  slate200: '#e2e8f0',
  slate50: '#f8fafc',
};

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: 'Helvetica', fontSize: 9.5, color: COLORS.slate900 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  brand: { color: COLORS.teal, fontSize: 18, fontWeight: 'bold' },
  addressBlock: { marginTop: 24, fontSize: 8.5, color: COLORS.slate700 },
  customerBlock: { marginTop: 12, marginBottom: 32 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 12 },
  meta: { flexDirection: 'row', marginBottom: 8 },
  metaLabel: { width: 110, color: COLORS.slate500 },
  metaValue: { flex: 1 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate50,
    padding: 6,
    borderTop: `1pt solid ${COLORS.slate200}`,
    borderBottom: `1pt solid ${COLORS.slate200}`,
    fontWeight: 'bold',
    fontSize: 8.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: `0.5pt solid ${COLORS.slate200}`,
  },
  col_pos: { width: 24 },
  col_desc: { flex: 1, paddingRight: 6 },
  col_qty: { width: 54, textAlign: 'right' },
  col_price: { width: 68, textAlign: 'right' },
  col_vat: { width: 40, textAlign: 'right' },
  col_total: { width: 76, textAlign: 'right' },
  totals: { marginTop: 18, alignSelf: 'flex-end', width: 260 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTop: `1pt solid ${COLORS.slate900}`,
    fontWeight: 'bold',
    fontSize: 11,
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 7.5,
    color: COLORS.slate500,
    borderTop: `0.5pt solid ${COLORS.slate200}`,
    paddingTop: 8,
  },
  footerCols: { flexDirection: 'row', justifyContent: 'space-between' },
  footerCol: { flex: 1 },
  paymentBlock: {
    marginTop: 26,
    padding: 12,
    backgroundColor: COLORS.slate50,
    borderLeft: `3pt solid ${COLORS.teal}`,
    fontSize: 8.5,
  },
});

function money(v: any, currency = 'EUR'): string {
  return `${Number(v).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function date(d: Date): string {
  return new Date(d).toLocaleDateString('de-DE');
}

export function InvoicePdf({ invoice, tenant }: PdfInput) {
  return (
    <Document title={`Rechnung ${invoice.invoiceNo}`} author={tenant.name}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.row}>
          <View>
            <Text style={styles.brand}>{tenant.name}</Text>
            <Text style={{ fontSize: 9, color: COLORS.slate500, marginTop: 2 }}>
              {tenant.legalName}
            </Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 8, color: COLORS.slate500 }}>
              {tenant.addressStreet}
            </Text>
            <Text style={{ fontSize: 8, color: COLORS.slate500 }}>
              {tenant.addressZip} {tenant.addressCity}
            </Text>
            {tenant.vatId ? (
              <Text style={{ fontSize: 8, color: COLORS.slate500 }}>USt-ID: {tenant.vatId}</Text>
            ) : null}
          </View>
        </View>

        {/* Kundenadresse */}
        <View style={styles.customerBlock}>
          <Text style={{ fontSize: 7.5, color: COLORS.slate500, marginBottom: 4 }}>
            {tenant.name} · {tenant.addressStreet} · {tenant.addressZip} {tenant.addressCity}
          </Text>
          <Text style={{ fontWeight: 'bold' }}>{invoice.customer.name}</Text>
          {invoice.customer.contactName ? <Text>{invoice.customer.contactName}</Text> : null}
          {invoice.customer.addressStreet ? <Text>{invoice.customer.addressStreet}</Text> : null}
          <Text>
            {invoice.customer.addressZip} {invoice.customer.addressCity}
          </Text>
        </View>

        {/* Rechnungs-Titel + Meta */}
        <View style={styles.row}>
          <Text style={styles.title}>Rechnung {invoice.invoiceNo}</Text>
          <View>
            <View style={styles.meta}>
              <Text style={styles.metaLabel}>Rechnungsdatum:</Text>
              <Text style={styles.metaValue}>{date(invoice.issueDate)}</Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.metaLabel}>Leistungszeitraum:</Text>
              <Text style={styles.metaValue}>
                {invoice.servicePeriodFrom && invoice.servicePeriodTo
                  ? `${date(invoice.servicePeriodFrom)} – ${date(invoice.servicePeriodTo)}`
                  : date(invoice.issueDate)}
              </Text>
            </View>
            <View style={styles.meta}>
              <Text style={styles.metaLabel}>Faellig bis:</Text>
              <Text style={styles.metaValue}>{date(invoice.dueDate)}</Text>
            </View>
            {invoice.customer.vatId ? (
              <View style={styles.meta}>
                <Text style={styles.metaLabel}>USt-ID Kunde:</Text>
                <Text style={styles.metaValue}>{invoice.customer.vatId}</Text>
              </View>
            ) : null}
            {invoice.leitwegId ? (
              <View style={styles.meta}>
                <Text style={styles.metaLabel}>Leitweg-ID:</Text>
                <Text style={styles.metaValue}>{invoice.leitwegId}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {invoice.headerText ? (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 9, color: COLORS.slate700 }}>{invoice.headerText}</Text>
          </View>
        ) : null}

        {/* Positionen */}
        <View style={{ marginTop: 18 }}>
          <View style={styles.tableHeader}>
            <Text style={styles.col_pos}>Pos.</Text>
            <Text style={styles.col_desc}>Leistung</Text>
            <Text style={styles.col_qty}>Menge</Text>
            <Text style={styles.col_price}>Einzelpreis</Text>
            <Text style={styles.col_vat}>USt</Text>
            <Text style={styles.col_total}>Summe</Text>
          </View>
          {invoice.items.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.col_pos}>{item.position}</Text>
              <View style={styles.col_desc}>
                <Text>{item.description}</Text>
                {item.servicePeriodFrom && item.servicePeriodTo ? (
                  <Text style={{ fontSize: 7.5, color: COLORS.slate500, marginTop: 2 }}>
                    Leistungszeitraum: {date(item.servicePeriodFrom)} – {date(item.servicePeriodTo)}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.col_qty}>
                {Number(item.quantity).toLocaleString('de-DE')} {item.unit}
              </Text>
              <Text style={styles.col_price}>{money(item.unitPrice, invoice.currency)}</Text>
              <Text style={styles.col_vat}>{Number(item.vatRate)}%</Text>
              <Text style={styles.col_total}>{money(item.netAmount, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Netto-Summe:</Text>
            <Text>{money(invoice.netAmount, invoice.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>zzgl. Umsatzsteuer:</Text>
            <Text>{money(invoice.vatAmount, invoice.currency)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Gesamtbetrag:</Text>
            <Text>{money(invoice.grossAmount, invoice.currency)}</Text>
          </View>
        </View>

        {/* Zahlungsinfo */}
        {tenant.iban ? (
          <View style={styles.paymentBlock}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4, color: COLORS.teal }}>
              Zahlungsinformationen
            </Text>
            <Text>
              Bitte ueberweisen Sie den Betrag von {money(invoice.grossAmount, invoice.currency)} bis
              zum {date(invoice.dueDate)} unter Angabe der Rechnungsnummer {invoice.invoiceNo}.
            </Text>
            <Text style={{ marginTop: 6 }}>
              IBAN: {tenant.iban} {tenant.bic ? `· BIC: ${tenant.bic}` : ''}
              {tenant.bankName ? ` · ${tenant.bankName}` : ''}
            </Text>
          </View>
        ) : null}

        {invoice.footerText ? (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 9, color: COLORS.slate700 }}>{invoice.footerText}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerCols}>
            <View style={styles.footerCol}>
              <Text style={{ fontWeight: 'bold' }}>{tenant.legalName || tenant.name}</Text>
              <Text>
                {tenant.addressStreet}, {tenant.addressZip} {tenant.addressCity}
              </Text>
            </View>
            <View style={styles.footerCol}>
              {tenant.vatId ? <Text>USt-ID: {tenant.vatId}</Text> : null}
              {tenant.taxId ? <Text>Steuernummer: {tenant.taxId}</Text> : null}
            </View>
            <View style={styles.footerCol}>
              {tenant.iban ? <Text>IBAN: {tenant.iban}</Text> : null}
              {tenant.bankName ? <Text>{tenant.bankName}</Text> : null}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdfBuffer(input: PdfInput): Promise<Buffer> {
  return renderToBuffer(<InvoicePdf {...input} />);
}
