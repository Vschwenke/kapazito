export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') ?? '2026');
    const customerId = searchParams.get('customerId') ?? '';

    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
        ...(customerId ? { customerId } : {}),
      },
      include: { customer: true, items: true },
      orderBy: { issueDate: 'desc' },
    });

    const totalInvoiced = (invoices ?? []).reduce((s: number, i: any) => s + (i?.totalAmount ?? 0), 0);
    const totalPaid = (invoices ?? []).reduce((s: number, i: any) => s + (i?.paidAmount ?? 0), 0);
    const totalOpen = totalInvoiced - totalPaid;

    const byStatus: Record<string, number> = {};
    for (const inv of invoices ?? []) {
      const st = inv?.status ?? 'unknown';
      byStatus[st] = (byStatus[st] ?? 0) + 1;
    }

    // By customer
    const byCustomer: Record<string, { name: string; invoiced: number; paid: number; count: number }> = {};
    for (const inv of invoices ?? []) {
      const name = inv?.customer?.shortName ?? inv?.customer?.name ?? 'Unknown';
      if (!byCustomer[name]) byCustomer[name] = { name, invoiced: 0, paid: 0, count: 0 };
      byCustomer[name].invoiced += inv?.totalAmount ?? 0;
      byCustomer[name].paid += inv?.paidAmount ?? 0;
      byCustomer[name].count += 1;
    }

    // Employee assignments with time for billing
    const assignments = await prisma.employeeAssignment.findMany({
      where: customerId ? { customerId } : {},
      include: { employee: true, customer: true },
    });

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
        ...(customerId ? { customerId } : {}),
      },
      include: { employee: true, customer: true },
    });

    // Build employee billing summary
    const empBilling: Record<string, any> = {};
    for (const te of timeEntries ?? []) {
      const eid = te?.employeeId ?? '';
      if (!empBilling[eid]) {
        empBilling[eid] = {
          name: `${te?.employee?.lastName ?? ''} ${te?.employee?.firstName ?? ''}`,
          customer: te?.customer?.shortName ?? te?.customer?.name ?? '',
          totalHours: 0,
          billableHours: 0,
          byMonth: {} as Record<number, number>,
        };
      }
      empBilling[eid].totalHours += te?.hours ?? 0;
      empBilling[eid].billableHours += te?.billableHours ?? 0;
      const m = new Date(te?.date ?? 0)?.getMonth?.() + 1;
      empBilling[eid].byMonth[m] = (empBilling[eid].byMonth[m] ?? 0) + (te?.billableHours ?? 0);
    }

    const customers = await prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });

    return NextResponse.json({
      totalInvoiced,
      totalPaid,
      totalOpen,
      byStatus,
      byCustomer: Object.values(byCustomer ?? {}),
      invoices: (invoices ?? []).map((i: any) => ({
        id: i?.id,
        invoiceNo: i?.invoiceNo,
        customer: i?.customer?.shortName ?? i?.customer?.name ?? '',
        issueDate: i?.issueDate,
        dueDate: i?.dueDate,
        totalAmount: i?.totalAmount,
        paidAmount: i?.paidAmount,
        status: i?.status,
      })),
      employeeBilling: Object.values(empBilling ?? {}),
      customers: (customers ?? []).map((c: any) => ({ id: c?.id, name: c?.name, shortName: c?.shortName })),
    });
  } catch (error: any) {
    console.error('Rechnungen API error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice data' }, { status: 500 });
  }
}
