// GET / PATCH / DELETE /api/rechnungen/[id]
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { cancelInvoice, recalculateTotals } from '@/lib/services/invoice.service';
import { audit } from '@/lib/services/audit.service';

export const GET = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:read');
  const db = await tenantDb();
  const inv = await db.invoice.findUniqueOrThrow({
    where: { id: ctx.params.id },
    include: { customer: true, items: { orderBy: { position: 'asc' } }, payments: true, reminders: true },
  });
  return json(inv);
});

const updateBody = z.object({
  headerText: z.string().nullable().optional(),
  footerText: z.string().nullable().optional(),
  internalNote: z.string().nullable().optional(),
  dueDate: z.coerce.date().optional(),
  paymentTerms: z.number().int().positive().optional(),
  purchaseOrder: z.string().nullable().optional(),
  leitwegId: z.string().nullable().optional(),
});

export const PATCH = withErrorHandling(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:write');
  const body = await parseJson(req, updateBody);
  const db = await tenantDb();
  const before = await db.invoice.findUniqueOrThrow({ where: { id: ctx.params.id } });
  if (before.status !== 'DRAFT') {
    return json({ error: { code: 'immutable', message: 'Nur Drafts koennen geaendert werden' } }, 409);
  }
  const updated = await db.invoice.update({ where: { id: ctx.params.id }, data: body });
  await recalculateTotals(session.tenantId, updated.id);
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'update', entity: 'Invoice', entityId: updated.id, before, after: updated });
  return json(updated);
});

export const DELETE = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:delete');
  const invoice = await cancelInvoice(session.tenantId, ctx.params.id);
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'cancel', entity: 'Invoice', entityId: ctx.params.id });
  return json(invoice);
});
