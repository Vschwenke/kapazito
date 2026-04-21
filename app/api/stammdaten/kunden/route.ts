import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        projects: { select: { id: true, name: true, isActive: true } },
        _count: { select: { invoices: true, timeEntries: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        shortName: body.shortName || null,
        industry: body.industry || null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
