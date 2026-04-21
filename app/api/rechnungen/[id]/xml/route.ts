// GET /api/rechnungen/[id]/xml — XRechnung 3.0 UBL
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { prisma } from '@/lib/db';
import { withErrorHandling } from '@/lib/api';
import { buildXRechnungXml } from '@/lib/services/xrechnung.service';

export const GET = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:read');
  const db = await tenantDb();
  const invoice = await db.invoice.findUniqueOrThrow({
    where: { id: ctx.params.id },
    include: { customer: true, items: { orderBy: { position: 'asc' } } },
  });
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });
  const xml = buildXRechnungXml({ invoice: invoice as any, tenant });
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Disposition': `attachment; filename="XRechnung-${invoice.invoiceNo}.xml"`,
    },
  });
});
