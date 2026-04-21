// XRechnung 3.0 (UBL 2.1) XML-Builder — EN 16931 konform.
//
// Referenz: https://xeinkauf.de/xrechnung/
// Ziel-Customization: urn:cen.eu:en16931:2017#compliant#urn:xoev-de:kosit:standard:xrechnung_3.0
//
// Wir erzeugen eine valide UBL-Invoice mit allen Pflichtfeldern aus BG-1..16.
// Fuer ZUGFeRD 2.3 (Hybrid-PDF) wird dieses XML spaeter in die PDF/A-3 eingebettet.
//
// Test-Validierung: KoSIT-Validator (siehe scripts/validate-xrechnung.ts).

import { create } from 'xmlbuilder2';
import type { Invoice, InvoiceItem, Customer, Tenant } from '@prisma/client';

export interface XRechnungInput {
  invoice: Invoice & { items: InvoiceItem[]; customer: Customer };
  tenant: Tenant;
}

const UBL_NS = {
  xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
  'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
  'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
};

export function buildXRechnungXml({ invoice, tenant }: XRechnungInput): string {
  const d = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Invoice', UBL_NS)
      .ele('cbc:CustomizationID').txt('urn:cen.eu:en16931:2017#compliant#urn:xoev-de:kosit:standard:xrechnung_3.0').up()
      .ele('cbc:ProfileID').txt('urn:fdc:peppol.eu:2017:poacc:billing:01:1.0').up()
      .ele('cbc:ID').txt(invoice.invoiceNo).up()
      .ele('cbc:IssueDate').txt(isoDate(invoice.issueDate)).up()
      .ele('cbc:DueDate').txt(isoDate(invoice.dueDate)).up()
      .ele('cbc:InvoiceTypeCode').txt('380').up() // 380 = kommerzielle Rechnung
      .ele('cbc:DocumentCurrencyCode').txt(invoice.currency ?? 'EUR').up()
      .ele('cbc:BuyerReference').txt(invoice.leitwegId || invoice.customer.leitwegId || invoice.buyerReference || 'N/A').up();

  // Optional: Bestellreferenz
  if (invoice.purchaseOrder) {
    d.ele('cac:OrderReference')
      .ele('cbc:ID').txt(invoice.purchaseOrder).up()
    .up();
  }

  // Leistungszeitraum (BG-14)
  if (invoice.servicePeriodFrom && invoice.servicePeriodTo) {
    d.ele('cac:InvoicePeriod')
      .ele('cbc:StartDate').txt(isoDate(invoice.servicePeriodFrom)).up()
      .ele('cbc:EndDate').txt(isoDate(invoice.servicePeriodTo)).up()
    .up();
  }

  // Seller (Tenant)
  const seller = d.ele('cac:AccountingSupplierParty').ele('cac:Party');
  seller.ele('cac:PartyName').ele('cbc:Name').txt(tenant.legalName || tenant.name).up().up();
  const sellerAddr = seller.ele('cac:PostalAddress');
  if (tenant.addressStreet) sellerAddr.ele('cbc:StreetName').txt(tenant.addressStreet).up();
  if (tenant.addressCity) sellerAddr.ele('cbc:CityName').txt(tenant.addressCity).up();
  if (tenant.addressZip) sellerAddr.ele('cbc:PostalZone').txt(tenant.addressZip).up();
  sellerAddr.ele('cac:Country').ele('cbc:IdentificationCode').txt(tenant.addressCountry || 'DE').up().up();

  if (tenant.vatId) {
    seller.ele('cac:PartyTaxScheme')
      .ele('cbc:CompanyID').txt(tenant.vatId).up()
      .ele('cac:TaxScheme').ele('cbc:ID').txt('VAT').up().up()
    .up();
  }
  seller.ele('cac:PartyLegalEntity')
    .ele('cbc:RegistrationName').txt(tenant.legalName || tenant.name).up()
  .up();
  seller.ele('cac:Contact')
    .ele('cbc:ElectronicMail').txt(process.env.MAIL_FROM?.match(/<(.+)>/)?.[1] || 'info@example.com').up()
  .up();
  seller.up().up();

  // Buyer (Customer)
  const buyer = d.ele('cac:AccountingCustomerParty').ele('cac:Party');
  buyer.ele('cac:PartyName').ele('cbc:Name').txt(invoice.customer.name).up().up();
  const buyerAddr = buyer.ele('cac:PostalAddress');
  if (invoice.customer.addressStreet) buyerAddr.ele('cbc:StreetName').txt(invoice.customer.addressStreet).up();
  if (invoice.customer.addressCity) buyerAddr.ele('cbc:CityName').txt(invoice.customer.addressCity).up();
  if (invoice.customer.addressZip) buyerAddr.ele('cbc:PostalZone').txt(invoice.customer.addressZip).up();
  buyerAddr.ele('cac:Country').ele('cbc:IdentificationCode').txt(invoice.customer.addressCountry || 'DE').up().up();

  if (invoice.customer.vatId) {
    buyer.ele('cac:PartyTaxScheme')
      .ele('cbc:CompanyID').txt(invoice.customer.vatId).up()
      .ele('cac:TaxScheme').ele('cbc:ID').txt('VAT').up().up()
    .up();
  }
  buyer.ele('cac:PartyLegalEntity')
    .ele('cbc:RegistrationName').txt(invoice.customer.name).up()
  .up();
  buyer.up().up();

  // Bankverbindung (PaymentMeans)
  if (tenant.iban) {
    d.ele('cac:PaymentMeans')
      .ele('cbc:PaymentMeansCode').txt('58').up() // 58 = SEPA Credit Transfer
      .ele('cbc:PaymentID').txt(invoice.invoiceNo).up()
      .ele('cac:PayeeFinancialAccount')
        .ele('cbc:ID').txt(tenant.iban).up()
        .ele('cbc:Name').txt(tenant.bankName || '').up()
        .ele('cac:FinancialInstitutionBranch')
          .ele('cbc:ID').txt(tenant.bic || '').up()
        .up()
      .up()
    .up();
  }

  d.ele('cac:PaymentTerms')
    .ele('cbc:Note').txt(`Zahlbar bis ${isoDate(invoice.dueDate)}`).up()
  .up();

  // Steuersummen (aggregiert pro vatRate)
  const vatGroups = groupByVatRate(invoice.items);
  const taxTotal = d.ele('cac:TaxTotal');
  taxTotal.ele('cbc:TaxAmount', { currencyID: 'EUR' }).txt(money(invoice.vatAmount)).up();
  for (const [rate, group] of vatGroups) {
    const sub = taxTotal.ele('cac:TaxSubtotal');
    sub.ele('cbc:TaxableAmount', { currencyID: 'EUR' }).txt(money(group.net)).up();
    sub.ele('cbc:TaxAmount', { currencyID: 'EUR' }).txt(money(group.vat)).up();
    sub.ele('cac:TaxCategory')
      .ele('cbc:ID').txt(group.category).up()
      .ele('cbc:Percent').txt(String(rate)).up()
      .ele('cac:TaxScheme').ele('cbc:ID').txt('VAT').up().up()
    .up();
  }
  taxTotal.up();

  // Gesamtsummen
  d.ele('cac:LegalMonetaryTotal')
    .ele('cbc:LineExtensionAmount', { currencyID: 'EUR' }).txt(money(invoice.netAmount)).up()
    .ele('cbc:TaxExclusiveAmount', { currencyID: 'EUR' }).txt(money(invoice.netAmount)).up()
    .ele('cbc:TaxInclusiveAmount', { currencyID: 'EUR' }).txt(money(invoice.grossAmount)).up()
    .ele('cbc:PayableAmount', { currencyID: 'EUR' }).txt(money(invoice.grossAmount)).up()
  .up();

  // Rechnungspositionen
  for (const item of invoice.items) {
    const line = d.ele('cac:InvoiceLine');
    line.ele('cbc:ID').txt(String(item.position)).up();
    line.ele('cbc:InvoicedQuantity', { unitCode: mapUnit(item.unit) }).txt(String(item.quantity)).up();
    line.ele('cbc:LineExtensionAmount', { currencyID: 'EUR' }).txt(money(item.netAmount)).up();

    if (item.servicePeriodFrom && item.servicePeriodTo) {
      line.ele('cac:InvoicePeriod')
        .ele('cbc:StartDate').txt(isoDate(item.servicePeriodFrom)).up()
        .ele('cbc:EndDate').txt(isoDate(item.servicePeriodTo)).up()
      .up();
    }

    line.ele('cac:Item')
      .ele('cbc:Description').txt(item.description).up()
      .ele('cbc:Name').txt(truncate(item.description, 100)).up()
      .ele('cac:ClassifiedTaxCategory')
        .ele('cbc:ID').txt(item.vatCategory).up()
        .ele('cbc:Percent').txt(String(item.vatRate)).up()
        .ele('cac:TaxScheme').ele('cbc:ID').txt('VAT').up().up()
      .up()
    .up();

    line.ele('cac:Price')
      .ele('cbc:PriceAmount', { currencyID: 'EUR' }).txt(money(item.unitPrice)).up()
    .up();
  }

  return d.end({ prettyPrint: true });
}

// -------- Helpers --------

function isoDate(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

function money(v: any): string {
  return Number(v).toFixed(2);
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.substring(0, n - 1) + '…' : s;
}

function mapUnit(unit: string): string {
  // UN/ECE Recommendation 20 Codes
  const map: Record<string, string> = {
    Std: 'HUR',  // Stunde
    Stunde: 'HUR',
    Tag: 'DAY',
    Stueck: 'C62',
    Pauschale: 'LS', // Lump Sum
  };
  return map[unit] ?? 'C62';
}

function groupByVatRate(items: InvoiceItem[]): Map<number, { net: number; vat: number; category: string }> {
  const m = new Map<number, { net: number; vat: number; category: string }>();
  for (const i of items) {
    const rate = Number(i.vatRate);
    const g = m.get(rate) ?? { net: 0, vat: 0, category: i.vatCategory };
    g.net += Number(i.netAmount);
    g.vat += Number(i.vatAmount);
    m.set(rate, g);
  }
  return m;
}
