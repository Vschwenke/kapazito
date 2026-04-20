export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') ?? '2026');

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      include: {
        assignments: { include: { customer: true } },
        absences: { where: { startDate: { gte: new Date(year, 0, 1) } } },
        userReports: { where: { year } },
      },
      orderBy: { lastName: 'asc' },
    });

    const totalEmployees = employees?.length ?? 0;
    const totalBillableHours = (employees ?? []).reduce((s: number, e: any) =>
      s + ((e?.userReports ?? []).reduce((ss: number, r: any) => ss + (r?.billableHours ?? 0), 0)), 0);
    const totalTargetHours = (employees ?? []).reduce((s: number, e: any) =>
      s + ((e?.userReports ?? []).reduce((ss: number, r: any) => ss + (r?.targetHours ?? 0), 0)), 0);
    const avgUtilization = totalTargetHours > 0 ? (totalBillableHours / totalTargetHours) * 100 : 0;

    const totalSickDays = (employees ?? []).reduce((s: number, e: any) =>
      s + ((e?.userReports ?? []).reduce((ss: number, r: any) => ss + (r?.sickDays ?? 0), 0)), 0);
    const totalVacationDays = (employees ?? []).reduce((s: number, e: any) =>
      s + ((e?.userReports ?? []).reduce((ss: number, r: any) => ss + (r?.vacationDays ?? 0), 0)), 0);

    const avgMonthlyIncome = totalEmployees > 0
      ? (employees ?? []).reduce((s: number, e: any) => s + (e?.monthlyIncome ?? 0), 0) / totalEmployees : 0;

    // Team composition
    const byExperience: Record<string, number> = {};
    const byContract: Record<string, number> = {};
    for (const e of employees ?? []) {
      const exp = e?.experienceLevel ?? 'Unbekannt';
      const ct = e?.contractType ?? 'Unbekannt';
      byExperience[exp] = (byExperience[exp] ?? 0) + 1;
      byContract[ct] = (byContract[ct] ?? 0) + 1;
    }

    // Monthly hours breakdown
    const monthlyData: { month: number; billable: number; target: number; sick: number; vacation: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const reports = (employees ?? []).flatMap((e: any) => (e?.userReports ?? []).filter((r: any) => r?.month === m));
      if (reports.length === 0) continue;
      monthlyData.push({
        month: m,
        billable: reports.reduce((s: number, r: any) => s + (r?.billableHours ?? 0), 0),
        target: reports.reduce((s: number, r: any) => s + (r?.targetHours ?? 0), 0),
        sick: reports.reduce((s: number, r: any) => s + (r?.sickDays ?? 0), 0),
        vacation: reports.reduce((s: number, r: any) => s + (r?.vacationDays ?? 0), 0),
      });
    }

    // Fluctuation: count employees who left this year
    const lostEmployees = await prisma.employee.count({ where: { isActive: false, endDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } } });
    const fluctuation = totalEmployees > 0 ? (lostEmployees / totalEmployees) * 100 : 0;

    const avgHourlyRate = 93; // Based on Power BI data
    const sickCostEstimate = totalSickDays * 8 * avgHourlyRate;

    const employeeList = (employees ?? []).map((e: any) => ({
      id: e?.id,
      name: `${e?.lastName ?? ''} ${e?.firstName ?? ''}`,
      firstName: e?.firstName,
      lastName: e?.lastName,
      contractType: e?.contractType,
      experienceLevel: e?.experienceLevel,
      monthlyIncome: e?.monthlyIncome,
      homeOfficePercent: e?.homeOfficePercent,
      customer: e?.assignments?.[0]?.customer?.shortName ?? e?.assignments?.[0]?.customer?.name ?? '-',
      utilization: (e?.userReports?.length ?? 0) > 0
        ? ((e?.userReports ?? []).reduce((s: number, r: any) => s + (r?.billableHours ?? 0), 0) /
           Math.max((e?.userReports ?? []).reduce((s: number, r: any) => s + (r?.targetHours ?? 0), 0), 1)) * 100 : 0,
      billableHours: (e?.userReports ?? []).reduce((s: number, r: any) => s + (r?.billableHours ?? 0), 0),
      sickDays: (e?.userReports ?? []).reduce((s: number, r: any) => s + (r?.sickDays ?? 0), 0),
      vacationDays: (e?.userReports ?? []).reduce((s: number, r: any) => s + (r?.vacationDays ?? 0), 0),
    }));

    return NextResponse.json({
      totalEmployees,
      totalBillableHours,
      avgUtilization,
      totalSickDays,
      totalVacationDays,
      fluctuation,
      sickCostEstimate,
      avgMonthlyIncome,
      byExperience,
      byContract,
      monthlyData,
      employees: employeeList,
    });
  } catch (error: any) {
    console.error('HR API error:', error);
    return NextResponse.json({ error: 'Failed to fetch HR data' }, { status: 500 });
  }
}
