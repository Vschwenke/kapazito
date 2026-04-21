// PATCH  /api/settings/team/memberships/[id] — Rolle aendern
// DELETE /api/settings/team/memberships/[id] — Mitglied entfernen
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { audit } from '@/lib/services/audit.service';

const body = z.object({ role: z.nativeEnum(Role) });

export const PATCH = withErrorHandling(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'user:invite');
  const { role } = await parseJson(req, body);

  const existing = await prisma.membership.findUniqueOrThrow({ where: { id: ctx.params.id } });
  if (existing.tenantId !== session.tenantId) {
    return json({ error: { code: 'forbidden', message: 'Nicht diese Organisation.' } }, 403);
  }

  // Verhindern, dass der letzte Owner entfernt oder degradiert wird.
  if (existing.role === Role.OWNER && role !== Role.OWNER) {
    const owners = await prisma.membership.count({ where: { tenantId: session.tenantId, role: Role.OWNER } });
    if (owners <= 1) {
      return json({ error: { code: 'last_owner', message: 'Der letzte Owner kann nicht degradiert werden.' } }, 409);
    }
  }

  const updated = await prisma.membership.update({ where: { id: ctx.params.id }, data: { role } });
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'update', entity: 'Membership', entityId: updated.id, before: existing, after: updated });
  return json(updated);
});

export const DELETE = withErrorHandling(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await requireAuth();
  requirePermission(session.role, 'user:remove');

  const existing = await prisma.membership.findUniqueOrThrow({ where: { id: ctx.params.id } });
  if (existing.tenantId !== session.tenantId) {
    return json({ error: { code: 'forbidden', message: 'Nicht diese Organisation.' } }, 403);
  }
  if (existing.userId === session.id) {
    return json({ error: { code: 'self_remove', message: 'Du kannst dich nicht selbst entfernen.' } }, 409);
  }
  if (existing.role === Role.OWNER) {
    const owners = await prisma.membership.count({ where: { tenantId: session.tenantId, role: Role.OWNER } });
    if (owners <= 1) {
      return json({ error: { code: 'last_owner', message: 'Der letzte Owner kann nicht entfernt werden.' } }, 409);
    }
  }

  await prisma.membership.delete({ where: { id: ctx.params.id } });
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'delete', entity: 'Membership', entityId: ctx.params.id });
  return json({ ok: true });
});
