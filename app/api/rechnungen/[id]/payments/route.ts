// POST /api/rechnungen/[id]/payments — Zahlung registrieren
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { registerPayment } from '@/lib/services/invoice.service';
import { audit } from '@/lib/services/audit.service';

const body = z.object({
  amount: z.number().positive(),
  receivedAt: z.coerce.date().optional(),
  method: z.string().optional(),
  reference: z.string().optional(),
  note: z.string().optional(),
});

export const POST = withErrorHandling(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:write');
  const input = await parseJson(req, body);
  const res = await registerPayment(session.tenantId, ctx.params.id, input.amount, input);
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'update', entity: 'Invoice', entityId: ctx.params.id, after: { paymentAmount: input.amount } });
  return json(res, 201);
});
