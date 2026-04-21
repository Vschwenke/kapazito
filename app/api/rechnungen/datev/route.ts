// POST /api/rechnungen/datev — DATEV-Buchungsstapel-Export (CSV)
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { parseQuery, withErrorHandling } from '@/lib/api';
import { tenantDb } from '@/lib/tenant-prisma';
import { prisma } from '@/lib/db';
import { buildDatevBuchungsstapelCsv } from '@/lib/services/datev-export.service';

const query = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'finance:read');
  const { from, to } = parseQuery(req, query);

  const db = await tenantDb();
  const invoices = await db.invoice.findMany({
    where: {
      status: { in: ['OPEN', 'SENT', 'VIEWED', 'PARTIAL', 'PAID', 'OVERDUE'] },
      issueDate: { gte: from, lte: to },
    },
    include: { customer: true, items: true },
    orderBy: { issueDate: 'asc' },
  });
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });
  const csv = buildDatevBuchungsstapelCsv({ tenant, invoices: invoices as any, periodFrom: from, periodTo: to });

  // Windows-1252 kompatibel senden (DATEV-Pflicht)
  return new Response('\uFEFF' + csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="DATEV-Buchungsstapel-${from.toISOString().slice(0,10)}-${to.toISOString().slice(0,10)}.csv"`,
    },
  });
});
