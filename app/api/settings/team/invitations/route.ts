// POST /api/settings/team/invitations — neue Einladung
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'node:crypto';
import { addDays } from 'date-fns';
import { Role } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { sendMail } from '@/lib/services/email.service';
import { audit } from '@/lib/services/audit.service';
import { logger } from '@/lib/errors';

const body = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role).default(Role.MEMBER),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'user:invite');
  const { email, role } = await parseJson(req, body);

  // Doppelte Invitations verhindern
  const existing = await prisma.invitation.findFirst({
    where: { tenantId: session.tenantId, email: email.toLowerCase(), acceptedAt: null, expiresAt: { gt: new Date() } },
  });
  if (existing) return json(existing, 200);

  // Bereits Mitglied?
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { memberships: { where: { tenantId: session.tenantId } } } });
  if (user && user.memberships.length > 0) {
    return json({ error: { code: 'already_member', message: 'Nutzer ist bereits Mitglied dieser Organisation.' } }, 409);
  }

  const token = crypto.randomBytes(32).toString('base64url');
  const expiresAt = addDays(new Date(), 7);

  const invite = await prisma.invitation.create({
    data: {
      tenantId: session.tenantId,
      email: email.toLowerCase(),
      role,
      token,
      expiresAt,
    },
  });

  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });
  const url = `${process.env.NEXTAUTH_URL ?? 'https://app.kapazito.de'}/invite/accept?token=${token}`;
  try {
    await sendMail({
      to: email,
      subject: `${session.name ?? session.email} hat dich zu ${tenant.name} eingeladen`,
      body: `Hallo,

du wurdest zur Organisation "${tenant.name}" auf Kapazito eingeladen.

Einladung annehmen:
${url}

Der Link gilt 7 Tage.

Freundliche Gruesse
Kapazito
`,
    });
  } catch (e: any) {
    logger.warn({ err: e }, 'Invite-Mail fehlgeschlagen');
  }

  await audit({ tenantId: session.tenantId, userId: session.id, action: 'create', entity: 'Invitation', entityId: invite.id, after: { email, role } });
  return json(invite, 201);
});
