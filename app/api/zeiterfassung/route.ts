import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      where.date = { gte: new Date(startDate) };
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        customer: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    });
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = await prisma.timeEntry.create({
      data: {
        employeeId: body.employeeId,
        customerId: body.customerId || null,
        projectId: body.projectId || null,
        date: new Date(body.date),
        hours: parseFloat(body.hours),
        billableHours: body.isBillable !== false ? parseFloat(body.hours) : 0,
        description: body.description || null,
        isBillable: body.isBillable !== false,
        workLocation: body.workLocation || null,
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
