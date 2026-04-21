// POST /api/kapi/actions/[id]/approve — gibt Aktion frei UND fuehrt sie aus
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { withErrorHandling, json } from '@/lib/api';
import { executeApprovedAction } from '@/lib/agent/executor';
import { audit } from '@/lib/services/audit.service';

export const POST = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'agent:approve');
  const db = await tenantDb();
  const action = await db.agentAction.findUniqueOrThrow({ where: { id: ctx.params.id } });
  if (action.status !== 'PENDING') {
    return json({ error: { code: 'invalid_state', message: `Action ist ${action.status}, nicht PENDING.` } }, 409);
  }
  await db.agentAction.update({
    where: { id: ctx.params.id },
    data: { status: 'APPROVED', confirmedBy: session.id, confirmedAt: new Date() },
  });
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'update', entity: 'AgentAction', entityId: ctx.params.id, after: { status: 'APPROVED', tool: action.toolName } });

  const { result } = await executeApprovedAction(ctx.params.id);
  return json({ ok: true, result });
});
