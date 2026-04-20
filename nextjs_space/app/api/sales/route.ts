export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') ?? '2026');
    const customerId = searchParams.get('customerId') ?? '';

    const customerWhere = customerId ? { id: customerId } : {};
    const customers = await prisma.customer.findMany({
      where: { isActive: true, ...customerWhere },
      include: {
        projects: true,
        employeeAssignments: { include: { employee: true } },
      },
    });

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
        ...(customerId ? { customerId } : {}),
      },
      include: { customer: true, employee: true },
    });

    const totalBillableHours = (timeEntries ?? []).reduce((s: number, t: any) => s + (t?.billableHours ?? 0), 0);
    
    // Revenue by customer
    const revenueByCustomer: Record<string, { name: string; revenue: number; hours: number; employees: number }> = {};
    for (const c of customers ?? []) {
      const custEntries = (timeEntries ?? []).filter((t: any) => t?.customerId === c?.id);
      const hours = custEntries.reduce((s: number, t: any) => s + (t?.billableHours ?? 0), 0);
      const avgRate = (c?.projects ?? []).reduce((s: number, p: any) => s + (p?.hourlyRate ?? 0), 0) / Math.max((c?.projects?.length ?? 0), 1);
      revenueByCustomer[c?.shortName ?? c?.name ?? 'Unknown'] = {
        name: c?.shortName ?? c?.name ?? 'Unknown',
        revenue: hours * avgRate,
        hours,
        employees: c?.employeeAssignments?.length ?? 0,
      };
    }

    const totalRevenue = Object.values(revenueByCustomer ?? {}).reduce((s: number, v: any) => s + (v?.revenue ?? 0), 0);
    const avgHourlyRate = totalBillableHours > 0 ? totalRevenue / totalBillableHours : 0;
    const activeEmployees = new Set((timeEntries ?? []).map((t: any) => t?.employeeId)).size;

    // Monthly revenue trend
    const monthlyRevenue: { month: number; revenue: number; hours: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      const monthEntries = (timeEntries ?? []).filter((t: any) => {
        const d = new Date(t?.date ?? 0);
        return (d?.getMonth?.() ?? -1) + 1 === m;
      });
      if (monthEntries.length === 0 && m > 3) continue;
      const hours = monthEntries.reduce((s: number, t: any) => s + (t?.billableHours ?? 0), 0);
      monthlyRevenue.push({ month: m, revenue: hours * (avgHourlyRate || 93), hours });
    }

    // Open items
    const openItems = await prisma.openItem.findMany({
      where: { year, ...(customerId ? { customerId } : {}) },
      include: { customer: true },
    });
    const totalOpenItems = (openItems ?? []).reduce((s: number, o: any) => s + (o?.amount ?? 0), 0);

    // Projects breakdown
    const allProjects = await prisma.project.findMany({
      where: { isActive: true, ...(customerId ? { customerId } : {}) },
      include: { customer: true },
    });

    return NextResponse.json({
      totalBillableHours,
      totalRevenue,
      avgHourlyRate,
      activeEmployees,
      totalOpenItems,
      customerCount: customers?.length ?? 0,
      revenueByCustomer: Object.values(revenueByCustomer ?? {}),
      monthlyRevenue,
      projects: (allProjects ?? []).map((p: any) => ({
        name: p?.name,
        customer: p?.customer?.shortName ?? p?.customer?.name ?? '',
        hourlyRate: p?.hourlyRate,
        budgetHours: p?.budgetHours,
      })),
      customers: (customers ?? []).map((c: any) => ({ id: c?.id, name: c?.name, shortName: c?.shortName })),
    });
  } catch (error: any) {
    console.error('Sales API error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales data' }, { status: 500 });
  }
}
