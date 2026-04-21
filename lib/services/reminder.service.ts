// Mahn-Engine — 3 Stufen, DACH-konform.
//
// Stufen:
//   Stufe 1 — Zahlungserinnerung (ohne Gebuehr, freundlicher Ton)
//   Stufe 2 — 1. Mahnung (5 EUR Gebuehr empfohlen)
//   Stufe 3 — 2. Mahnung (10 EUR Gebuehr + 3 Monate Verzugszinsen)
//
// Verzugszinsen: gemaess § 288 BGB Basis-Zinssatz + 5 %-Punkte (B2C) bzw.
// + 9 %-Punkte (B2B). Wir nutzen default 9 % fuer B2B-Beratungen.
//
// Die Engine ist idempotent: wenn level N bereits gesendet, wird nicht
// erneut dasselbe Level erzeugt.

import { prisma } from '@/lib/db';
import { addDays, differenceInDays } from 'date-fns';
import { logger } from '@/lib/errors';

export const REMINDER_CONFIG = {
  stages: [
    { level: 1, daysAfterDue: 7,  fee: 0,  interestPct: 0,  template: 'zahlungserinnerung' },
    { level: 2, daysAfterDue: 21, fee: 5,  interestPct: 9,  template: 'mahnung-1' },
    { level: 3, daysAfterDue: 45, fee: 10, interestPct: 9,  template: 'mahnung-2' },
  ],
  defaultInterestPct: 9,
} as const;

export interface ReminderResult {
  sent: number;
  details: Array<{ invoiceId: string; invoiceNo: string; level: number; fee: number; interest: number }>;
}

/**
 * Laeuft ueber alle Rechnungen eines Tenants und erzeugt ausstehende Mahnungen.
 * Soll als Cron-Job taeglich laufen.
 */
export async function runReminderEngine(tenantId: string, dryRun = false): Promise<ReminderResult> {
  const today = new Date();

  const candidates = await prisma.invoice.findMany({
    where: {
      tenantId,
      status: { in: ['OPEN', 'SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'] },
      dueDate: { lt: today },
    },
    include: { reminders: true, customer: true },
  });

  const details: ReminderResult['details'] = [];

  for (const inv of candidates) {
    const overdue = differenceInDays(today, inv.dueDate);
    const lastLevel = inv.reminders.length > 0 ? Math.max(...inv.reminders.map((r) => r.level)) : 0;

    // Welches Level ist faellig?
    const nextStage = REMINDER_CONFIG.stages.find((s) => s.level > lastLevel && overdue >= s.daysAfterDue);
    if (!nextStage) continue;

    const interest = calculateInterest(Number(inv.grossAmount), inv.dueDate, today, nextStage.interestPct);

    if (!dryRun) {
      await prisma.reminder.create({
        data: {
          tenantId,
          invoiceId: inv.id,
          level: nextStage.level,
          fee: nextStage.fee,
          interest,
          template: nextStage.template,
          dueDate: addDays(today, 7),
        },
      });
      // Status ggf. auf OVERDUE setzen
      if (inv.status !== 'OVERDUE' && nextStage.level >= 2) {
        await prisma.invoice.update({ where: { id: inv.id }, data: { status: 'OVERDUE' } });
      }
    }

    details.push({
      invoiceId: inv.id,
      invoiceNo: inv.invoiceNo,
      level: nextStage.level,
      fee: nextStage.fee,
      interest,
    });
  }

  logger.info({ tenantId, sent: details.length, dryRun }, 'Reminder-Engine Durchlauf');
  return { sent: details.length, details };
}

function calculateInterest(gross: number, dueDate: Date, today: Date, pct: number): number {
  const days = Math.max(0, differenceInDays(today, dueDate));
  return Math.round((gross * pct * days) / 365 / 100 * 100) / 100;
}

/**
 * Rendert einen Mahnungs-E-Mail-Text fuer das jeweilige Level.
 */
export function renderReminderText(params: {
  customerName: string;
  invoiceNo: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  level: number;
  fee: number;
  interest: number;
  newDueDate: Date;
  senderName: string;
  senderIban: string;
}): { subject: string; body: string } {
  const { customerName, invoiceNo, invoiceDate, dueDate, amount, level, fee, interest, newDueDate, senderName } = params;

  const total = amount + fee + interest;

  if (level === 1) {
    return {
      subject: `Zahlungserinnerung Rechnung ${invoiceNo}`,
      body: `Sehr geehrte Damen und Herren,\n\nvermutlich ist es Ihnen entgangen: unsere Rechnung ${invoiceNo} vom ${invoiceDate.toLocaleDateString('de-DE')} ueber ${amount.toFixed(2)} EUR ist seit dem ${dueDate.toLocaleDateString('de-DE')} faellig.\n\nWir bitten um Ueberweisung bis zum ${newDueDate.toLocaleDateString('de-DE')}.\n\nSollte sich Ihre Zahlung mit diesem Schreiben ueberschnitten haben, betrachten Sie diese Erinnerung bitte als gegenstandslos.\n\nFreundliche Gruesse\n${senderName}`,
    };
  }

  if (level === 2) {
    return {
      subject: `1. Mahnung zu Rechnung ${invoiceNo}`,
      body: `Sehr geehrte Damen und Herren,\n\ntrotz unserer Zahlungserinnerung konnten wir den Ausgleich der Rechnung ${invoiceNo} vom ${invoiceDate.toLocaleDateString('de-DE')} nicht feststellen.\n\nOffen:\n  Rechnungsbetrag: ${amount.toFixed(2)} EUR\n  Mahngebuehr:     ${fee.toFixed(2)} EUR\n  Verzugszinsen:   ${interest.toFixed(2)} EUR\n  Gesamt:          ${total.toFixed(2)} EUR\n\nWir bitten um Ueberweisung bis zum ${newDueDate.toLocaleDateString('de-DE')}.\n\nFreundliche Gruesse\n${senderName}`,
    };
  }

  return {
    subject: `2. und letzte Mahnung zu Rechnung ${invoiceNo}`,
    body: `Sehr geehrte Damen und Herren,\n\ntrotz mehrfacher Erinnerung ist die Rechnung ${invoiceNo} vom ${invoiceDate.toLocaleDateString('de-DE')} noch offen.\n\nOffen:\n  Rechnungsbetrag: ${amount.toFixed(2)} EUR\n  Mahngebuehr:     ${fee.toFixed(2)} EUR\n  Verzugszinsen:   ${interest.toFixed(2)} EUR\n  Gesamt:          ${total.toFixed(2)} EUR\n\nSollte der Betrag bis zum ${newDueDate.toLocaleDateString('de-DE')} nicht bei uns eingegangen sein, werden wir ohne weitere Ankuendigung gerichtliche Schritte einleiten.\n\nFreundliche Gruesse\n${senderName}`,
  };
}
