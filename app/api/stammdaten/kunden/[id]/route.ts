import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        shortName: body.shortName || null,
        industry: body.industry || null,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Soft delete - set isActive to false
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: { isActive: false },
    });
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
