// POST /api/rechnungen/[id]/finalize — vergibt Nummer, setzt auf OPEN
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { withErrorHandling, json } from '@/lib/api';
import { finalizeInvoice } from '@/lib/services/invoice.service';
import { audit } from '@/lib/services/audit.service';

export const POST = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:write');
  const inv = await finalizeInvoice(session.tenantId, ctx.params.id);
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'update', entity: 'Invoice', entityId: inv.id, after: { status: inv.status, invoiceNo: inv.invoiceNo } });
  return json(inv);
});
