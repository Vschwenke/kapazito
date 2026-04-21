/**
 * Tool: Generiert eine Test-XRechnung aus einer Demo-Rechnung und prueft das
 * Ergebnis gegen grundlegende EN-16931-Pflichtfelder.
 *
 * Fuer die 100 %-Validierung empfiehlt KoSIT den offiziellen Validator:
 *   https://github.com/itplr-kosit/validator
 */
import { buildXRechnungXml } from '../lib/services/xrechnung.service';

const demoInvoice: any = {
  invoiceNo: 'TEST-0001',
  issueDate: new Date('2026-04-01'),
  dueDate: new Date('2026-04-15'),
  servicePeriodFrom: new Date('2026-03-01'),
  servicePeriodTo: new Date('2026-03-31'),
  netAmount: 1000, vatAmount: 190, grossAmount: 1190,
  currency: 'EUR', paymentTerms: 14, discount: 0,
  buyerReference: 'TEST-BUYER-REF',
  leitwegId: '991-55555-55',
  customer: {
    name: 'Test-Kunde GmbH',
    vatId: 'DE123456789',
    addressStreet: 'Teststrasse 5',
    addressZip: '10115',
    addressCity: 'Berlin',
    addressCountry: 'DE',
    leitwegId: '991-55555-55',
    peppolId: null,
  },
  items: [{
    id: 'i1', position: 1,
    description: 'Beratungsleistung Maerz 2026',
    quantity: 10, unit: 'Std', unitPrice: 100,
    netAmount: 1000, vatRate: 19, vatAmount: 190, vatCategory: 'S',
    servicePeriodFrom: new Date('2026-03-01'),
    servicePeriodTo: new Date('2026-03-31'),
  }],
};

const demoTenant: any = {
  name: 'Kapazito Test',
  legalName: 'Kapazito Test GmbH',
  vatId: 'DE987654321',
  addressStreet: 'Musterweg 1',
  addressZip: '80331', addressCity: 'Muenchen', addressCountry: 'DE',
  iban: 'DE89 3704 0044 0532 0130 00',
  bic: 'COBADEFFXXX',
  bankName: 'Commerzbank',
};

const xml = buildXRechnungXml({ invoice: demoInvoice, tenant: demoTenant });
console.log(xml);

const required = [
  'cbc:CustomizationID',
  'cbc:ID>TEST-0001',
  'cbc:IssueDate>2026-04-01',
  'cbc:DueDate>2026-04-15',
  'cbc:InvoiceTypeCode>380',
  'cbc:DocumentCurrencyCode>EUR',
  'cbc:BuyerReference',
  'cac:AccountingSupplierParty',
  'cac:AccountingCustomerParty',
  'cac:TaxTotal',
  'cac:LegalMonetaryTotal',
  'cac:InvoiceLine',
];

let ok = 0, fail = 0;
for (const r of required) {
  const [tag, expected] = r.split('>');
  if (expected) {
    if (xml.includes(`<${tag}`) && xml.includes(expected)) { ok++; continue; }
  } else {
    if (xml.includes(`<${tag}`)) { ok++; continue; }
  }
  console.error('FEHLEND:', r);
  fail++;
}

console.log(`\nValidierung: ${ok}/${required.length} Pflichtfelder ok, ${fail} fehlend.`);
if (fail > 0) process.exit(1);
