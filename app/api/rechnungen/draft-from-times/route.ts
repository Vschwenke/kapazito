// POST /api/rechnungen/draft-from-times — Abrechnungs-Assistent
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { createDraftFromTimeEntries } from '@/lib/services/invoice.service';
import { audit } from '@/lib/services/audit.service';

const body = z.object({
  customerId: z.string().cuid(),
  from: z.coerce.date(),
  to: z.coerce.date(),
  projectId: z.string().optional(),
  issueDate: z.coerce.date().optional(),
  paymentTerms: z.number().int().positive().optional(),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:write');
  const input = await parseJson(req, body);
  const invoice = await createDraftFromTimeEntries({ tenantId: session.tenantId, ...input });
  await audit({
    tenantId: session.tenantId, userId: session.id, action: 'create',
    entity: 'Invoice', entityId: invoice.id,
    after: { invoiceNo: invoice.invoiceNo, source: 'time-entries' },
  });
  return json(invoice, 201);
});
