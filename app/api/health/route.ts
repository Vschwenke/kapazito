// Health-Endpoint fuer Docker-Healthcheck + Uptime-Monitoring.
// Prueft: App lebt + DB erreichbar.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      app: 'kapazito',
      version: process.env.npm_package_version ?? '0.2.0',
      db: 'up',
      uptimeMs: Math.round(process.uptime() * 1000),
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        status: 'degraded',
        app: 'kapazito',
        db: 'down',
        error: e.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
