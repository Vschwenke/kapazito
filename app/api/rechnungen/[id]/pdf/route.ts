// GET /api/rechnungen/[id]/pdf — Rechnungs-PDF streamen
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { prisma } from '@/lib/db';
import { withErrorHandling } from '@/lib/api';
import { renderInvoicePdfBuffer } from '@/lib/services/invoice-pdf.service';

export const GET = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:read');
  const db = await tenantDb();
  const invoice = await db.invoice.findUniqueOrThrow({
    where: { id: ctx.params.id },
    include: { customer: true, items: { orderBy: { position: 'asc' } } },
  });
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });
  const buf = await renderInvoicePdfBuffer({ invoice: invoice as any, tenant });
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Rechnung-${invoice.invoiceNo}.pdf"`,
      'Content-Length': String(buf.length),
    },
  });
});
