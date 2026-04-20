import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email || null,
        contractType: body.contractType || null,
        experienceLevel: body.experienceLevel || null,
        monthlyIncome: body.monthlyIncome ? parseFloat(body.monthlyIncome) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        weeklyHours: body.weeklyHours ? parseFloat(body.weeklyHours) : 40,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employee = await prisma.employee.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
