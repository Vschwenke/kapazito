// POST /api/kapi/actions/[id]/reject — lehnt Aktion ab
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { withErrorHandling, json } from '@/lib/api';
import { audit } from '@/lib/services/audit.service';

export const POST = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'agent:approve');
  const db = await tenantDb();
  const action = await db.agentAction.findUniqueOrThrow({ where: { id: ctx.params.id } });
  await db.agentAction.update({
    where: { id: ctx.params.id },
    data: { status: 'REJECTED', confirmedBy: session.id, confirmedAt: new Date() },
  });
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'update', entity: 'AgentAction', entityId: ctx.params.id, after: { status: 'REJECTED', tool: action.toolName } });
  return json({ ok: true });
});
