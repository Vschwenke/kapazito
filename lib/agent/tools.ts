// Kapis Tool-Kit — was der Agent darf.
//
// Wichtig fuer Sicherheit:
// - READ-Tools (preview*, query*, list*) werden direkt ausgefuehrt.
// - WRITE-Tools (create*, send*, export*) legen nur eine AgentAction mit
//   status=PENDING an. Der User muss sie im Approval-Dialog bestaetigen,
//   erst dann ruft der Approval-Handler die tatsaechliche Service-Methode.
//
// Audit: jede Tool-Invocation wird in AgentAction gespeichert (GoBD-konform).

import { z } from 'zod';
import { tool } from 'ai';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { tenantDbFor } from '@/lib/tenant-prisma';
import { formatISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface ToolContext {
  tenantId: string;
  userId: string;
  actionSink: Array<{ toolName: string; input: any; output?: any; requiresApproval: boolean }>;
}

export function buildKapiTools(ctx: ToolContext) {
  const db = tenantDbFor(ctx.tenantId);

  return {
    // -------------------------- READ TOOLS --------------------------
    queryBusinessData: tool({
      description: 'Liest aktuelle Geschaeftsdaten des Mandanten — Kunden, Projekte, Mitarbeiter, Rechnungsstatus, Auslastung. Nutze es, um Fragen zu beantworten.',
      parameters: z.object({
        topic: z.enum(['overview', 'customers', 'projects', 'employees', 'invoices', 'utilization']),
      }),
      execute: async ({ topic }) => {
        ctx.actionSink.push({ toolName: 'queryBusinessData', input: { topic }, requiresApproval: false });
        return await runQuery(ctx.tenantId, topic);
      },
    }),

    listOverdueInvoices: tool({
      description: 'Listet alle Rechnungen mit Status OVERDUE oder faellig aber unbezahlt. Enthaelt Betrag, Kunde und Tage-Ueberfaellig.',
      parameters: z.object({}),
      execute: async () => {
        ctx.actionSink.push({ toolName: 'listOverdueInvoices', input: {}, requiresApproval: false });
        const today = new Date();
        const invoices = await db.invoice.findMany({
          where: { status: { in: ['OPEN', 'SENT', 'PARTIAL', 'OVERDUE'] }, dueDate: { lt: today } },
          include: { customer: { select: { name: true } } },
        });
        return invoices.map((i) => ({
          id: i.id,
          number: i.invoiceNo,
          customer: i.customer.name,
          open: Number(i.grossAmount) - Number(i.paidAmount),
          daysOverdue: Math.floor((today.getTime() - new Date(i.dueDate).getTime()) / 86_400_000),
          status: i.status,
        }));
      },
    }),

    findBillableTimeEntries: tool({
      description: 'Findet genehmigte, abrechenbare Zeitbuchungen im Zeitraum, die noch KEINER Rechnung zugeordnet sind.',
      parameters: z.object({
        customerId: z.string().optional(),
        fromISO: z.string().describe('ISO-Datum, z.B. 2026-04-01'),
        toISO: z.string().describe('ISO-Datum, z.B. 2026-04-30'),
      }),
      execute: async ({ customerId, fromISO, toISO }) => {
        ctx.actionSink.push({ toolName: 'findBillableTimeEntries', input: { customerId, fromISO, toISO }, requiresApproval: false });
        const rows = await db.timeEntry.findMany({
          where: {
            status: 'APPROVED',
            isBillable: true,
            invoiceItemId: null,
            customerId: customerId ?? undefined,
            date: { gte: new Date(fromISO), lte: new Date(toISO) },
          },
          include: { customer: { select: { id: true, name: true } }, project: { select: { id: true, name: true, hourlyRate: true } } },
        });
        const byCustomer = new Map<string, { customer: any; hours: number; estValue: number; count: number }>();
        for (const r of rows) {
          const c = r.customer;
          if (!c) continue;
          const rate = Number(r.project?.hourlyRate ?? 0);
          const g = byCustomer.get(c.id) ?? { customer: c, hours: 0, estValue: 0, count: 0 };
          g.hours += r.billableHours;
          g.estValue += r.billableHours * rate;
          g.count += 1;
          byCustomer.set(c.id, g);
        }
        return Array.from(byCustomer.values()).map((v) => ({
          customerId: v.customer.id,
          customerName: v.customer.name,
          hours: Math.round(v.hours * 100) / 100,
          estimatedValue: Math.round(v.estValue * 100) / 100,
          entries: v.count,
        }));
      },
    }),

    forecastCashflow: tool({
      description: 'Einfache 90-Tage-Cashflow-Prognose auf Basis offener Rechnungen (Inflow) und historischer Personalkosten (Outflow).',
      parameters: z.object({}),
      execute: async () => {
        ctx.actionSink.push({ toolName: 'forecastCashflow', input: {}, requiresApproval: false });
        const today = new Date();
        const horizon = new Date(today);
        horizon.setDate(horizon.getDate() + 90);

        const openInvoices = await db.invoice.findMany({
          where: { status: { in: ['OPEN', 'SENT', 'PARTIAL', 'OVERDUE'] } },
        });
        const inflow = openInvoices
          .filter((i) => i.dueDate <= horizon)
          .reduce((s, i) => s + (Number(i.grossAmount) - Number(i.paidAmount)), 0);

        const last3mKey = [
          { y: subMonths(today, 1).getFullYear(), m: subMonths(today, 1).getMonth() + 1 },
          { y: subMonths(today, 2).getFullYear(), m: subMonths(today, 2).getMonth() + 1 },
          { y: subMonths(today, 3).getFullYear(), m: subMonths(today, 3).getMonth() + 1 },
        ];
        const personnel = await db.personnelCost.findMany({
          where: { OR: last3mKey.map((k) => ({ year: k.y, month: k.m })) },
        });
        const avgMonthlyOut = personnel.reduce((s, p) => s + Number(p.totalCost), 0) / 3;
        const outflow = avgMonthlyOut * 3;
        return {
          horizonDays: 90,
          expectedInflow: Math.round(inflow),
          expectedOutflow: Math.round(outflow),
          netExpected: Math.round(inflow - outflow),
          disclaimer: 'Einfaches Modell: offene Rechnungen + durchschnittl. Personalkosten letzter 3 Monate.',
        };
      },
    }),

    // -------------------------- WRITE TOOLS (benoetigen Approval) --------------------------
    proposeInvoiceFromTimes: tool({
      description: 'Schlaegt einen Rechnungs-Entwurf aus genehmigten Zeiten eines Kunden vor. User muss das Ergebnis im Approval-Dialog bestaetigen, bevor der Entwurf tatsaechlich angelegt wird.',
      parameters: z.object({
        customerId: z.string(),
        fromISO: z.string(),
        toISO: z.string(),
        note: z.string().optional(),
      }),
      execute: async ({ customerId, fromISO, toISO, note }) => {
        ctx.actionSink.push({
          toolName: 'createDraftFromTimes',
          input: { customerId, from: fromISO, to: toISO, note },
          requiresApproval: true,
          output: { preview: 'Rechnungs-Entwurf wird nach Freigabe erzeugt.' },
        });
        return { status: 'pending_approval', tool: 'createDraftFromTimes' };
      },
    }),

    proposeSendInvoice: tool({
      description: 'Schlaegt vor, eine bestehende OPEN/PARTIAL/OVERDUE Rechnung per E-Mail (PDF+XRechnung) an den Kunden zu senden. User bestaetigt im Approval-Dialog.',
      parameters: z.object({
        invoiceId: z.string(),
        to: z.string().email().optional(),
      }),
      execute: async ({ invoiceId, to }) => {
        ctx.actionSink.push({ toolName: 'sendInvoice', input: { invoiceId, to }, requiresApproval: true });
        return { status: 'pending_approval', tool: 'sendInvoice' };
      },
    }),

    proposeRunReminders: tool({
      description: 'Schlaegt vor, den Mahnwesen-Durchlauf zu starten. Erzeugt bei ueberfaelligen Rechnungen Mahnungen in den passenden Stufen. User bestaetigt.',
      parameters: z.object({}),
      execute: async () => {
        ctx.actionSink.push({ toolName: 'runReminders', input: {}, requiresApproval: true });
        return { status: 'pending_approval', tool: 'runReminders' };
      },
    }),

    proposeDatevExport: tool({
      description: 'Schlaegt vor, den DATEV-Buchungsstapel fuer den angegebenen Zeitraum zu erzeugen.',
      parameters: z.object({
        fromISO: z.string(),
        toISO: z.string(),
      }),
      execute: async ({ fromISO, toISO }) => {
        ctx.actionSink.push({
          toolName: 'exportDatev',
          input: { from: fromISO, to: toISO },
          requiresApproval: true,
        });
        return { status: 'pending_approval', tool: 'exportDatev' };
      },
    }),

    proposeRegisterPayment: tool({
      description: 'Schlaegt vor, eine Zahlung fuer eine Rechnung zu registrieren. User bestaetigt.',
      parameters: z.object({
        invoiceId: z.string(),
        amount: z.number().positive(),
        method: z.string().optional(),
        reference: z.string().optional(),
      }),
      execute: async ({ invoiceId, amount, method, reference }) => {
        ctx.actionSink.push({
          toolName: 'registerPayment',
          input: { invoiceId, amount, method, reference },
          requiresApproval: true,
        });
        return { status: 'pending_approval', tool: 'registerPayment' };
      },
    }),

    suggestStaffing: tool({
      description: 'Schlaegt geeignete Mitarbeiter fuer ein Staffing-Anfrage vor (basierend auf Skills + verfuegbarer Kapazitaet).',
      parameters: z.object({
        weekISO: z.string().describe('Wochen-Startdatum ISO'),
        hoursNeeded: z.number(),
        skills: z.array(z.string()).default([]),
      }),
      execute: async ({ weekISO, hoursNeeded, skills }) => {
        ctx.actionSink.push({ toolName: 'suggestStaffing', input: { weekISO, hoursNeeded, skills }, requiresApproval: false });
        const employees = await db.employee.findMany({ where: { isActive: true } });
        // Vereinfacht: rank nach Skill-Match, nimm top 5.
        const ranked = employees
          .map((e) => ({
            id: e.id,
            name: `${e.firstName} ${e.lastName}`,
            level: e.experienceLevel,
            skillMatch: skills.filter((s) => e.skills.includes(s)).length,
            skills: e.skills,
            weeklyHours: e.weeklyHours ?? 40,
          }))
          .sort((a, b) => b.skillMatch - a.skillMatch)
          .slice(0, 5);
        return { ranked, remark: 'Detail-Auslastungscheck folgt in kommendem Release.' };
      },
    }),
  };
}

// ------------------------------------------------------------
async function runQuery(tenantId: string, topic: string) {
  const db = tenantDbFor(tenantId);
  switch (topic) {
    case 'overview': {
      const [customers, projects, employees, openInv, overdueInv] = await Promise.all([
        db.customer.count({ where: { isActive: true } }),
        db.project.count({ where: { isActive: true } }),
        db.employee.count({ where: { isActive: true } }),
        db.invoice.count({ where: { status: { in: ['OPEN','SENT','PARTIAL'] } } }),
        db.invoice.count({ where: { status: 'OVERDUE' } }),
      ]);
      return { customers, projects, employees, openInvoices: openInv, overdueInvoices: overdueInv };
    }
    case 'invoices': {
      const byStatus = await db.invoice.groupBy({
        by: ['status'],
        _sum: { grossAmount: true, paidAmount: true },
        _count: { _all: true },
      });
      return byStatus.map((b) => ({
        status: b.status,
        count: b._count._all,
        grossAmount: Number(b._sum.grossAmount ?? 0),
        paidAmount: Number(b._sum.paidAmount ?? 0),
      }));
    }
    case 'customers': {
      const c = await db.customer.findMany({ where: { isActive: true }, select: { id: true, name: true, industry: true } });
      return c;
    }
    case 'projects': {
      const p = await db.project.findMany({
        where: { isActive: true },
        select: { id: true, name: true, customer: { select: { name: true } }, hourlyRate: true, billingMode: true, budgetHours: true },
      });
      return p;
    }
    case 'employees': {
      const e = await db.employee.findMany({
        where: { isActive: true },
        select: { id: true, firstName: true, lastName: true, experienceLevel: true, skills: true },
      });
      return e;
    }
    case 'utilization': {
      const today = new Date();
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      const entries = await db.timeEntry.groupBy({
        by: ['employeeId'],
        where: { date: { gte: start, lte: end } },
        _sum: { hours: true, billableHours: true },
      });
      const emps = await db.employee.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, weeklyHours: true } });
      return emps.map((e) => {
        const entry = entries.find((x) => x.employeeId === e.id);
        const total = entry?._sum.hours ?? 0;
        const billable = entry?._sum.billableHours ?? 0;
        return {
          employee: `${e.firstName} ${e.lastName}`,
          totalHours: total,
          billableHours: billable,
          utilization: total > 0 ? Math.round((billable / total) * 100) : 0,
        };
      });
    }
  }
}
