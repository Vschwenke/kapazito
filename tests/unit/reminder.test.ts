import { describe, it, expect } from 'vitest';
import { renderReminderText, REMINDER_CONFIG } from '@/lib/services/reminder.service';

describe('Reminder-Text-Renderer', () => {
  const base = {
    customerName: 'Demo GmbH',
    invoiceNo: '2026-0001',
    invoiceDate: new Date('2026-03-01'),
    dueDate: new Date('2026-03-15'),
    amount: 1000,
    fee: 5,
    interest: 2.46,
    newDueDate: new Date('2026-04-22'),
    senderName: 'Kapazito',
    senderIban: 'DE89...',
  };

  it('Stufe 1 hat freundlichen Ton', () => {
    const { subject, body } = renderReminderText({ ...base, level: 1, fee: 0, interest: 0 });
    expect(subject).toContain('Zahlungserinnerung');
    expect(body.toLowerCase()).toContain('vermutlich');
  });

  it('Stufe 2 enthaelt Gebuehr + Zinsen', () => {
    const { subject, body } = renderReminderText({ ...base, level: 2 });
    expect(subject).toContain('1. Mahnung');
    expect(body).toContain('Mahngebuehr');
    expect(body).toContain('Verzugszinsen');
  });

  it('Stufe 3 droht gerichtliche Schritte an', () => {
    const { subject, body } = renderReminderText({ ...base, level: 3, fee: 10 });
    expect(subject).toContain('2. und letzte');
    expect(body.toLowerCase()).toContain('gerichtliche');
  });

  it('Config hat drei Stufen', () => {
    expect(REMINDER_CONFIG.stages.length).toBe(3);
  });
});
