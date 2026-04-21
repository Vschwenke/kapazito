// GET /api/settings/team — Mitglieder + offene Invites
export const dynamic = 'force-dynamic';

import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { withErrorHandling, json } from '@/lib/api';

export const GET = withErrorHandling(async () => {
  const session = await requireAuth();
  requirePermission(session.role, 'tenant:read');

  const [memberships, invitations] = await Promise.all([
    prisma.membership.findMany({
      where: { tenantId: session.tenantId },
      include: { user: { select: { id: true, email: true, name: true, imageUrl: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.invitation.findMany({
      where: { tenantId: session.tenantId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return json({ memberships, invitations });
});
