export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') ?? '2026');

    const planning = await prisma.financialPlanning.findMany({
      where: { year },
      orderBy: [{ category: 'asc' }, { month: 'asc' }],
    });

    const categories = [...new Set((planning ?? []).map((p: any) => p?.category))];
    const result: Record<string, any[]> = {};
    for (const cat of categories) {
      result[cat ?? 'unknown'] = (planning ?? []).filter((p: any) => p?.category === cat).map((p: any) => ({
        month: p?.month,
        planned: p?.planned ?? 0,
        actual: p?.actual ?? 0,
        forecast: p?.forecast ?? 0,
      }));
    }

    return NextResponse.json({ planning: result, categories });
  } catch (error: any) {
    console.error('Planning API error:', error);
    return NextResponse.json({ error: 'Failed to fetch planning data' }, { status: 500 });
  }
}
