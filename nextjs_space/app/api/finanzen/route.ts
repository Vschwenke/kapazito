export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') ?? '2026');
    const quarter = parseInt(searchParams.get('quarter') ?? '0');
    const month = parseInt(searchParams.get('month') ?? '0');

    let monthFilter: number[] = [];
    if (month > 0) {
      monthFilter = [month];
    } else if (quarter > 0) {
      const start = (quarter - 1) * 3 + 1;
      monthFilter = [start, start + 1, start + 2];
    }

    const whereClause: any = { year };
    if (monthFilter.length > 0) whereClause.month = { in: monthFilter };

    const accounts = await prisma.financialAccount.findMany({ where: whereClause, orderBy: [{ month: 'asc' }] });
    const cashflow = await prisma.cashflowEntry.findMany({ where: whereClause, orderBy: [{ month: 'asc' }] });
    const openItems = await prisma.openItem.findMany({ where: whereClause, include: { customer: true } });

    // BWA summary
    const bwaMap: Record<string, { name: string; total: number; prevYear: number; byMonth: Record<number, number> }> = {};
    for (const acc of accounts ?? []) {
      if (!bwaMap[acc.accountNumber]) {
        bwaMap[acc.accountNumber] = { name: acc.accountName, total: 0, prevYear: 0, byMonth: {} };
      }
      bwaMap[acc.accountNumber].total += acc.amount ?? 0;
      bwaMap[acc.accountNumber].prevYear += acc.previousYear ?? 0;
      bwaMap[acc.accountNumber].byMonth[acc.month] = acc.amount ?? 0;
    }

    const bwa = Object.entries(bwaMap ?? {}).map(([num, data]: [string, any]) => ({
      accountNumber: num,
      accountName: data?.name ?? '',
      total: data?.total ?? 0,
      previousYear: data?.prevYear ?? 0,
      delta: data?.prevYear ? ((data?.total - data?.prevYear) / Math.abs(data?.prevYear)) * 100 : 0,
      byMonth: data?.byMonth ?? {},
    }));

    // Time entries for utilization
    const timeEntries = await prisma.timeEntry.findMany({
      where: { date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) } },
    });
    const totalHours = (timeEntries ?? []).reduce((s: number, t: any) => s + (t?.hours ?? 0), 0);
    const billableHours = (timeEntries ?? []).reduce((s: number, t: any) => s + (t?.billableHours ?? 0), 0);
    const utilization = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

    const customers = await prisma.customer.count({ where: { isActive: true } });
    const developers = await prisma.employee.count({ where: { isActive: true } });

    // Open items by customer
    const openItemsByCustomer: Record<string, number> = {};
    for (const oi of openItems ?? []) {
      const name = oi?.customer?.shortName ?? oi?.customer?.name ?? 'Unbekannt';
      openItemsByCustomer[name] = (openItemsByCustomer[name] ?? 0) + (oi?.amount ?? 0);
    }

    return NextResponse.json({
      bwa,
      cashflow,
      openItemsByCustomer,
      totalOpenItems: Object.values(openItemsByCustomer ?? {}).reduce((s: number, v: any) => s + (v ?? 0), 0),
      utilization,
      customers,
      developers,
      revenue: bwa?.find((b: any) => b?.accountNumber === '1020')?.total ?? 0,
      rohertrag: bwa?.find((b: any) => b?.accountNumber === '1092')?.total ?? 0,
      gesamtkosten: bwa?.find((b: any) => b?.accountNumber === '1260')?.total ?? 0,
      betriebsergebnis: bwa?.find((b: any) => b?.accountNumber === '1270')?.total ?? 0,
      ergebnisVorSteuern: bwa?.find((b: any) => b?.accountNumber === '1300')?.total ?? 0,
      vorlErgebnis: bwa?.find((b: any) => b?.accountNumber === '1320')?.total ?? 0,
    });
  } catch (error: any) {
    console.error('Finance API error:', error);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}
