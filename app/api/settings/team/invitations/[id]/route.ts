// DELETE /api/settings/team/invitations/[id] — Einladung zurueckziehen
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { tenantDb } from '@/lib/tenant-prisma';
import { withErrorHandling, json } from '@/lib/api';
import { audit } from '@/lib/services/audit.service';

export const DELETE = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'user:invite');
  const db = await tenantDb();
  await db.invitation.delete({ where: { id: ctx.params.id } });
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'delete', entity: 'Invitation', entityId: ctx.params.id });
  return json({ ok: true });
});
