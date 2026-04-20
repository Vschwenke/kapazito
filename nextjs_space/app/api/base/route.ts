export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [customers, employees, projects, timeEntries, absences, accounts, invoices, cashflow, planning, openItems, holidays, assignments, userReports, personnelCosts] = await Promise.all([
      prisma.customer.count(),
      prisma.employee.count(),
      prisma.project.count(),
      prisma.timeEntry.count(),
      prisma.absence.count(),
      prisma.financialAccount.count(),
      prisma.invoice.count(),
      prisma.cashflowEntry.count(),
      prisma.financialPlanning.count(),
      prisma.openItem.count(),
      prisma.holiday.count(),
      prisma.employeeAssignment.count(),
      prisma.userReport.count(),
      prisma.personnelCost.count(),
    ]);

    const totalEntries = customers + employees + projects + timeEntries + absences + accounts + invoices + cashflow + planning + openItems + holidays + assignments + userReports + personnelCosts;

    const tables = [
      { name: 'Kunden', count: customers, source: 'Stammdaten', type: 'Dimension' },
      { name: 'Mitarbeiter', count: employees, source: 'Stammdaten', type: 'Dimension' },
      { name: 'Projekte', count: projects, source: 'Projektverwaltung', type: 'Dimension' },
      { name: 'Zeiteinträge', count: timeEntries, source: 'Zeiterfassung', type: 'Fakt' },
      { name: 'Abwesenheiten', count: absences, source: 'Zeiterfassung', type: 'Fakt' },
      { name: 'Finanzbuchungen', count: accounts, source: 'Buchhaltung', type: 'Fakt' },
      { name: 'Personalkosten', count: personnelCosts, source: 'Buchhaltung', type: 'Fakt' },
      { name: 'Rechnungen', count: invoices, source: 'Rechnungsmodul', type: 'Fakt' },
      { name: 'Rechnungspositionen', count: 0, source: 'Rechnungsmodul', type: 'Fakt' },
      { name: 'Cashflow', count: cashflow, source: 'Buchhaltung', type: 'Fakt' },
      { name: 'Finanzplanung', count: planning, source: 'Planung', type: 'Fakt' },
      { name: 'Offene Posten', count: openItems, source: 'Buchhaltung', type: 'Fakt' },
      { name: 'Feiertage', count: holidays, source: 'System', type: 'Dimension' },
      { name: 'Zuordnungen', count: assignments, source: 'Projektverwaltung', type: 'Beziehung' },
      { name: 'Monatsberichte', count: userReports, source: 'Zeiterfassung', type: 'Fakt' },
    ];

    const devByExperience = await prisma.employee.groupBy({
      by: ['experienceLevel'],
      _count: true,
      where: { isActive: true },
    });

    return NextResponse.json({
      totalEntries,
      tables,
      devByExperience: (devByExperience ?? []).map((d: any) => ({ level: d?.experienceLevel ?? 'Unknown', count: d?._count ?? 0 })),
    });
  } catch (error: any) {
    console.error('Base API error:', error);
    return NextResponse.json({ error: 'Failed to fetch base data' }, { status: 500 });
  }
}
