import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const year = parseInt(searchParams.get('year') ?? new Date().getFullYear().toString());

    const where: any = {
      startDate: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
    };
    if (employeeId) where.employeeId = employeeId;

    const absences = await prisma.absence.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ startDate: 'desc' }],
    });

    // Summary by type
    const summary: Record<string, { count: number; days: number }> = {};
    for (const a of absences) {
      if (!summary[a.type]) summary[a.type] = { count: 0, days: 0 };
      summary[a.type].count++;
      summary[a.type].days += a.days ?? 0;
    }

    // Employee summary
    const empSummary: Record<string, { name: string; urlaub: number; krank: number; sonstige: number; total: number }> = {};
    for (const a of absences) {
      const key = a.employeeId;
      if (!empSummary[key]) empSummary[key] = { name: `${a.employee.firstName} ${a.employee.lastName}`, urlaub: 0, krank: 0, sonstige: 0, total: 0 };
      const days = a.days ?? 0;
      empSummary[key].total += days;
      if (a.type === 'Urlaub') empSummary[key].urlaub += days;
      else if (a.type === 'Krank') empSummary[key].krank += days;
      else empSummary[key].sonstige += days;
    }

    return NextResponse.json({
      absences,
      summary,
      employeeSummary: Object.values(empSummary).sort((a, b) => b.total - a.total),
      totalDays: absences.reduce((s, a) => s + (a.days ?? 0), 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const absence = await prisma.absence.create({
      data: {
        employeeId: body.employeeId,
        type: body.type,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        days: parseFloat(body.days),
        approved: body.approved !== false,
      },
    });
    return NextResponse.json(absence, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
