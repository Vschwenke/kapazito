import { describe, it, expect } from 'vitest';
import { formatInvoiceNumber } from '@/lib/services/invoice-number.service';

describe('formatInvoiceNumber', () => {
  it('formatiert Standard-Template', () => {
    expect(formatInvoiceNumber('{prefix}{seq:04d}', '2026-', 1, 2026)).toBe('2026-0001');
    expect(formatInvoiceNumber('{prefix}{seq:04d}', '2026-', 42, 2026)).toBe('2026-0042');
  });

  it('akzeptiert alternative Templates', () => {
    expect(formatInvoiceNumber('RE-{year}-{seq:06d}', '', 7, 2026)).toBe('RE-2026-000007');
  });
});
