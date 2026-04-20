import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const entry = await prisma.timeEntry.update({
      where: { id: params.id },
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
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.timeEntry.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
