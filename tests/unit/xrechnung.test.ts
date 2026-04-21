import { describe, it, expect } from 'vitest';
import { buildXRechnungXml } from '@/lib/services/xrechnung.service';

const invoice: any = {
  invoiceNo: 'T-001',
  issueDate: new Date('2026-04-01'),
  dueDate: new Date('2026-04-15'),
  servicePeriodFrom: new Date('2026-03-01'),
  servicePeriodTo: new Date('2026-03-31'),
  netAmount: 1000, vatAmount: 190, grossAmount: 1190,
  currency: 'EUR',
  buyerReference: 'X',
  customer: {
    name: 'Test-Kunde', vatId: 'DE111', addressStreet: 'X 1',
    addressZip: '10115', addressCity: 'Berlin', addressCountry: 'DE',
    leitwegId: 'LW-1',
  },
  items: [{
    position: 1, description: 'Test', quantity: 10, unit: 'Std',
    unitPrice: 100, netAmount: 1000, vatRate: 19, vatAmount: 190,
    vatCategory: 'S',
    servicePeriodFrom: new Date('2026-03-01'),
    servicePeriodTo: new Date('2026-03-31'),
  }],
};
const tenant: any = {
  name: 'Demo', legalName: 'Demo GmbH', vatId: 'DE222',
  addressStreet: 'Y 1', addressZip: '80331', addressCity: 'Muc', addressCountry: 'DE',
  iban: 'DE1', bic: 'B', bankName: 'Bank',
};

describe('XRechnung-Builder', () => {
  const xml = buildXRechnungXml({ invoice, tenant });

  it('enthaelt Customization-ID der XRechnung 3.0', () => {
    expect(xml).toContain('xrechnung_3.0');
  });

  it('enthaelt Rechnungsnummer und Typ-Code 380', () => {
    expect(xml).toContain('T-001');
    expect(xml).toContain('380');
  });

  it('enthaelt Kaeufer und Verkaeufer-Parteien', () => {
    expect(xml).toContain('AccountingSupplierParty');
    expect(xml).toContain('AccountingCustomerParty');
  });

  it('enthaelt Leistungszeitraum', () => {
    expect(xml).toContain('2026-03-01');
    expect(xml).toContain('2026-03-31');
  });

  it('berechnet Totals korrekt', () => {
    expect(xml).toContain('>1000.00<');
    expect(xml).toContain('>190.00<');
    expect(xml).toContain('>1190.00<');
  });
});
