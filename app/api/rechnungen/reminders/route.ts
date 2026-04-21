// POST /api/rechnungen/reminders — Mahnwesen-Durchlauf ausloesen
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { runReminderEngine } from '@/lib/services/reminder.service';
import { audit } from '@/lib/services/audit.service';

const body = z.object({ dryRun: z.boolean().default(false) });

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:send');
  const { dryRun } = await parseJson(req, body);
  const res = await runReminderEngine(session.tenantId, dryRun);
  if (!dryRun) {
    await audit({ tenantId: session.tenantId, userId: session.id, action: 'send', entity: 'Reminder', after: { count: res.sent } });
  }
  return json(res);
});
