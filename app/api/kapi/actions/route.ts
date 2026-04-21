// GET /api/kapi/actions — Liste aller AgentActions (Approval-Queue)
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { parseQuery, withErrorHandling, json } from '@/lib/api';

const q = z.object({ status: z.enum(['PENDING','APPROVED','EXECUTED','REJECTED','FAILED']).optional() });

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'agent:use');
  const db = await tenantDb();
  const { status } = parseQuery(req, q);
  const items = await db.agentAction.findMany({
    where: { status: status ?? undefined },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return json({ items });
});
