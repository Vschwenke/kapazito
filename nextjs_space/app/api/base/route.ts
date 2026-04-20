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
      { name: 'Customer', count: customers, source: 'Dataverse', type: 'Dimension' },
      { name: 'Employee', count: employees, source: 'Dataverse', type: 'Dimension' },
      { name: 'Project', count: projects, source: 'SharePoint', type: 'Dimension' },
      { name: 'TimeEntry', count: timeEntries, source: 'Clockodo', type: 'Fakt' },
      { name: 'Absence', count: absences, source: 'Clockodo', type: 'Fakt' },
      { name: 'FinancialAccount', count: accounts, source: 'DATEV', type: 'Fakt' },
      { name: 'PersonnelCost', count: personnelCosts, source: 'DATEV', type: 'Fakt' },
      { name: 'Invoice', count: invoices, source: 'Intern', type: 'Fakt' },
      { name: 'InvoiceItem', count: 0, source: 'Intern', type: 'Fakt' },
      { name: 'CashflowEntry', count: cashflow, source: 'DATEV', type: 'Fakt' },
      { name: 'FinancialPlanning', count: planning, source: 'Dataverse', type: 'Fakt' },
      { name: 'OpenItem', count: openItems, source: 'DATEV', type: 'Fakt' },
      { name: 'Holiday', count: holidays, source: 'Clockodo', type: 'Dimension' },
      { name: 'EmployeeAssignment', count: assignments, source: 'Intern', type: 'Beziehung' },
      { name: 'UserReport', count: userReports, source: 'Clockodo', type: 'Fakt' },
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
