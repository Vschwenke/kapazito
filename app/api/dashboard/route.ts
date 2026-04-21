export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const year = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Parallel queries
    const [
      employees, activeCustomers, activeProjects,
      timeEntries, invoices, cashflow, accounts,
      personnelCosts, absences, openItems,
    ] = await Promise.all([
      prisma.employee.findMany({ where: { isActive: true }, include: { userReports: { where: { year } }, assignments: { where: { endDate: null }, include: { customer: true } } } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.project.count({ where: { isActive: true } }),
      prisma.timeEntry.findMany({ where: { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } }, include: { customer: true, employee: true } }),
      prisma.invoice.findMany({ where: { issueDate: { gte: new Date(year, 0, 1) } }, include: { customer: true } }),
      prisma.cashflowEntry.findMany({ where: { year }, orderBy: { month: 'asc' } }),
      prisma.financialAccount.findMany({ where: { year } }),
      prisma.personnelCost.findMany({ where: { year } }),
      prisma.absence.findMany({ where: { startDate: { gte: new Date(year, 0, 1) } } }),
      prisma.openItem.findMany({ where: { year }, include: { customer: true } }),
    ]);

    const totalEmployees = employees.length;

    // === FINANZEN ===
    const revenue = accounts.filter(a => a.accountNumber === '1020').reduce((s, a) => s + (a.amount ?? 0), 0);
    const prevRevenue = accounts.filter(a => a.accountNumber === '1020').reduce((s, a) => s + (a.previousYear ?? 0), 0);
    const betriebsergebnis = accounts.filter(a => a.accountNumber === '1270').reduce((s, a) => s + (a.amount ?? 0), 0);
    const prevBetriebsergebnis = accounts.filter(a => a.accountNumber === '1270').reduce((s, a) => s + (a.previousYear ?? 0), 0);
    const gesamtkosten = accounts.filter(a => a.accountNumber === '1260').reduce((s, a) => s + (a.amount ?? 0), 0);

    // Revenue per Employee
    const revenuePerEmployee = totalEmployees > 0 ? revenue / totalEmployees : 0;
    const revenuePerEmployeeMonthly = totalEmployees > 0 ? revenue / totalEmployees / Math.max(currentMonth, 1) : 0;

    // Personalkosten-Quote
    const totalPersonnelCosts = personnelCosts.reduce((s, p) => s + (p.totalCost ?? 0), 0);
    const personnelCostRatio = revenue > 0 ? (totalPersonnelCosts / revenue) * 100 : 0;

    // Cashflow & Liquidität
    const latestCashflow = cashflow.length > 0 ? cashflow[cashflow.length - 1] : null;
    const currentLiquidity = latestCashflow?.cumulative ?? 0;
    const avgMonthlyOutflow = cashflow.length > 0 ? cashflow.reduce((s, c) => s + (c.outflow ?? 0), 0) / cashflow.length : 0;
    const liquidityMonths = avgMonthlyOutflow > 0 ? currentLiquidity / avgMonthlyOutflow : 99;

    // === HR ===
    const totalBillableHours = timeEntries.reduce((s, t) => s + (t.billableHours ?? 0), 0);
    const totalHours = timeEntries.reduce((s, t) => s + (t.hours ?? 0), 0);
    const avgUtilization = employees.length > 0
      ? employees.reduce((s, e) => {
          const reports = e.userReports ?? [];
          const target = reports.reduce((ss, r) => ss + (r.targetHours ?? 0), 0);
          const billable = reports.reduce((ss, r) => ss + (r.billableHours ?? 0), 0);
          return s + (target > 0 ? billable / target : 0);
        }, 0) / employees.length * 100
      : 0;

    // Billable Ratio
    const billableRatio = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;

    // Bench (MA ohne aktive Zuweisung)
    const benchEmployees = employees.filter(e => !e.assignments || e.assignments.length === 0);
    const benchQuote = totalEmployees > 0 ? (benchEmployees.length / totalEmployees) * 100 : 0;

    // Krankheitstage
    const sickDays = absences.filter(a => a.type === 'Krank').reduce((s, a) => s + (a.days ?? 0), 0);
    const avgSickDaysPerEmployee = totalEmployees > 0 ? sickDays / totalEmployees : 0;

    // Fluktuation
    const lostEmployees = await prisma.employee.count({ where: { isActive: false, endDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } } });
    const fluctuation = totalEmployees > 0 ? (lostEmployees / totalEmployees) * 100 : 0;

    // === SALES ===
    const avgHourlyRate = totalBillableHours > 0 ? revenue / totalBillableHours : 0;

    // Kundenkonzentration (HHI)
    const revenueByCustomer: Record<string, number> = {};
    for (const te of timeEntries) {
      const cName = te.customer?.shortName ?? te.customer?.name ?? 'Intern';
      revenueByCustomer[cName] = (revenueByCustomer[cName] ?? 0) + (te.billableHours ?? 0);
    }
    const totalBH = Object.values(revenueByCustomer).reduce((s, v) => s + v, 0);
    const hhi = totalBH > 0 ? Object.values(revenueByCustomer).reduce((s, v) => s + Math.pow((v / totalBH) * 100, 2), 0) : 0;
    const topCustomers = Object.entries(revenueByCustomer)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, hours]) => ({ name, hours, revenue: hours * (avgHourlyRate || 93), share: totalBH > 0 ? (hours / totalBH) * 100 : 0 }));

    // === RECHNUNGEN ===
    const totalInvoiced = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);
    const totalPaid = invoices.reduce((s, i) => s + (i.paidAmount ?? 0), 0);
    const totalOpen = totalInvoiced - totalPaid;
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

    // DSO
    const paidInvoices = invoices.filter(i => i.paidAmount > 0 && i.issueDate);
    const avgDSO = paidInvoices.length > 0
      ? paidInvoices.reduce((s, i) => {
          const issue = new Date(i.issueDate);
          const due = new Date(i.dueDate);
          return s + Math.max(0, (due.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / paidInvoices.length
      : 0;

    // Open Items Aging
    const now = new Date();
    const aging = { under30: 0, under60: 0, under90: 0, over90: 0 };
    for (const oi of openItems) {
      if (!oi.dueDate) { aging.over90 += oi.amount ?? 0; continue; }
      const days = Math.floor((now.getTime() - new Date(oi.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      if (days < 30) aging.under30 += oi.amount ?? 0;
      else if (days < 60) aging.under60 += oi.amount ?? 0;
      else if (days < 90) aging.under90 += oi.amount ?? 0;
      else aging.over90 += oi.amount ?? 0;
    }

    // === ECHTKOSTEN-DECKUNGSBEITRAG ===
    // Per customer: revenue from billable hours × rate - personnel costs of assigned employees
    const customerDB: { name: string; revenue: number; costs: number; db: number; dbPercent: number; hours: number }[] = [];
    const customers = await prisma.customer.findMany({
      where: { isActive: true },
      include: {
        projects: true,
        employeeAssignments: { include: { employee: { include: { personnelCosts: { where: { year } } } } } },
      },
    });

    for (const c of customers) {
      const custEntries = timeEntries.filter(t => t.customerId === c.id);
      const hours = custEntries.reduce((s, t) => s + (t.billableHours ?? 0), 0);
      const avgRate = c.projects.length > 0
        ? c.projects.reduce((s, p) => s + (p.hourlyRate ?? 0), 0) / c.projects.length
        : avgHourlyRate;
      const custRevenue = hours * avgRate;

      // Real personnel costs: sum of monthly costs for assigned employees, proportional to allocation
      let custCosts = 0;
      for (const assign of c.employeeAssignments ?? []) {
        const empCosts = assign.employee?.personnelCosts ?? [];
        const totalEmpCost = empCosts.reduce((s, pc) => s + (pc.totalCost ?? 0), 0);
        const allocation = (assign.allocation ?? 100) / 100;
        custCosts += totalEmpCost * allocation;
      }

      const db = custRevenue - custCosts;
      customerDB.push({
        name: c.shortName ?? c.name,
        revenue: custRevenue,
        costs: custCosts,
        db,
        dbPercent: custRevenue > 0 ? (db / custRevenue) * 100 : 0,
        hours,
      });
    }

    const totalDB = customerDB.reduce((s, c) => s + c.db, 0);
    const totalDBRevenue = customerDB.reduce((s, c) => s + c.revenue, 0);
    const overallDBPercent = totalDBRevenue > 0 ? (totalDB / totalDBRevenue) * 100 : 0;

    // Break-Even Auslastung
    const monthlyFixCosts = gesamtkosten / Math.max(currentMonth, 1);
    const potentialRevenuePerPercent = totalEmployees > 0 ? (avgHourlyRate * 8 * 21 * totalEmployees) / 100 : 1;
    const breakEvenUtilization = potentialRevenuePerPercent > 0 ? (monthlyFixCosts / potentialRevenuePerPercent) : 0;

    // === ALERTS ===
    const alerts: { type: 'danger' | 'warning' | 'info'; message: string }[] = [];
    if (avgUtilization < 70) alerts.push({ type: 'danger', message: `Auslastung bei ${avgUtilization.toFixed(0)}% – unter 70% Schwelle` });
    else if (avgUtilization < 80) alerts.push({ type: 'warning', message: `Auslastung bei ${avgUtilization.toFixed(0)}% – Ziel: 80%+` });
    if (benchEmployees.length > 0) alerts.push({ type: 'warning', message: `${benchEmployees.length} Berater auf der Bank ohne Kundeneinsatz` });
    if (overdueInvoices > 0) alerts.push({ type: 'danger', message: `${overdueInvoices} überfällige Rechnungen` });
    if (liquidityMonths < 4) alerts.push({ type: 'danger', message: `Liquiditätsreichweite: nur ${liquidityMonths.toFixed(1)} Monate` });
    else if (liquidityMonths < 6) alerts.push({ type: 'warning', message: `Liquiditätsreichweite: ${liquidityMonths.toFixed(1)} Monate` });
    if (personnelCostRatio > 65) alerts.push({ type: 'warning', message: `Personalkostenquote ${personnelCostRatio.toFixed(0)}% über 65%-Schwelle` });
    if (avgSickDaysPerEmployee > 12) alerts.push({ type: 'warning', message: `Ø ${avgSickDaysPerEmployee.toFixed(1)} Krankheitstage/MA – über Branchenschnitt` });

    // Cashflow mini chart
    const cashflowChart = cashflow.map(c => ({ month: c.month, inflow: c.inflow, outflow: c.outflow, cumulative: c.cumulative }));

    // Monthly revenue trend
    const monthlyRevenue: { month: number; revenue: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const mEntries = timeEntries.filter(t => new Date(t.date).getMonth() + 1 === m);
      const mHours = mEntries.reduce((s, t) => s + (t.billableHours ?? 0), 0);
      if (mHours > 0 || m <= currentMonth) monthlyRevenue.push({ month: m, revenue: mHours * (avgHourlyRate || 93) });
    }

    return NextResponse.json({
      // Finanzen
      revenue, prevRevenue, betriebsergebnis, prevBetriebsergebnis, gesamtkosten,
      revenuePerEmployee, revenuePerEmployeeMonthly, personnelCostRatio, totalPersonnelCosts,
      currentLiquidity, liquidityMonths, breakEvenUtilization,
      // HR
      totalEmployees, avgUtilization, billableRatio, totalBillableHours, totalHours,
      benchCount: benchEmployees.length, benchQuote, benchEmployees: benchEmployees.map(e => ({ name: `${e.lastName} ${e.firstName}`, level: e.experienceLevel })),
      sickDays, avgSickDaysPerEmployee, fluctuation,
      // Sales
      activeCustomers, activeProjects, avgHourlyRate, hhi, topCustomers,
      // Rechnungen
      totalInvoiced, totalPaid, totalOpen, overdueInvoices, avgDSO, aging,
      // Deckungsbeitrag (Echtkosten)
      customerDB, totalDB, overallDBPercent,
      // Charts
      cashflowChart, monthlyRevenue,
      // Alerts
      alerts,
      year, currentMonth,
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
