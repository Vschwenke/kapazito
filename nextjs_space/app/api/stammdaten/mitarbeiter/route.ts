import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        assignments: {
          include: { customer: { select: { id: true, name: true } } },
          where: { endDate: null },
        },
        _count: { select: { timeEntries: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const employee = await prisma.employee.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        contractType: body.contractType || null,
        experienceLevel: body.experienceLevel || null,
        monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        weeklyHours: body.weeklyHours ? parseFloat(body.weeklyHours) : 40,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
