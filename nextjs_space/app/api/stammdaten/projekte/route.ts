import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        customer: { select: { id: true, name: true } },
        _count: { select: { timeEntries: true, invoiceItems: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const project = await prisma.project.create({
      data: {
        name: body.name,
        customerId: body.customerId,
        purchaseOrder: body.purchaseOrder || null,
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        budgetHours: body.budgetHours ? parseFloat(body.budgetHours) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
