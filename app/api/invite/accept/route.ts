// POST /api/invite/accept — Annahme einer Einladung.
// Zwei Faelle:
//  A) Nutzer mit dieser Email existiert -> nur Membership anlegen, Passwort optional aktualisieren
//  B) Nutzer existiert nicht -> anlegen mit Passwort, Membership anlegen
//
// Danach direkter Login via NextAuth (serverseitig nicht moeglich, daher Client macht signIn).
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/db';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { rateLimit } from '@/lib/rate-limit';
import { audit } from '@/lib/services/audit.service';
import { logger } from '@/lib/errors';

const body = z.object({
  token: z.string().min(8),
  name: z.string().min(2).optional(),
  password: z.string().min(10).optional(),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const limited = await rateLimit(req, 'invite-accept', 10, 3600);
  if (limited) return limited;

  const { token, name, password } = await parseJson(req, body);

  const invite = await prisma.invitation.findUnique({ where: { token } });
  if (!invite) return json({ error: { code: 'not_found', message: 'Einladung ungueltig.' } }, 404);
  if (invite.acceptedAt) return json({ error: { code: 'already_used', message: 'Einladung bereits benutzt.' } }, 409);
  if (invite.expiresAt < new Date()) return json({ error: { code: 'expired', message: 'Einladung abgelaufen.' } }, 410);

  const email = invite.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  let userId: string;
  const result = await prisma.$transaction(async (tx) => {
    if (existing) {
      userId = existing.id;
      const alreadyMember = await tx.membership.findUnique({
        where: { userId_tenantId: { userId, tenantId: invite.tenantId } },
      });
      if (!alreadyMember) {
        await tx.membership.create({ data: { userId, tenantId: invite.tenantId, role: invite.role as Role } });
      }
    } else {
      if (!password) {
        throw new ValidationError('Passwort erforderlich — der Nutzer existiert noch nicht.');
      }
      const hashed = await bcrypt.hash(password, 12);
      const u = await tx.user.create({
        data: { email, name: name ?? email.split('@')[0], password: hashed },
      });
      userId = u.id;
      await tx.membership.create({ data: { userId, tenantId: invite.tenantId, role: invite.role as Role } });
    }

    await tx.invitation.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } });

    const tenant = await tx.tenant.findUniqueOrThrow({ where: { id: invite.tenantId } });
    return { userId, tenantId: invite.tenantId, tenantSlug: tenant.slug, email };
  });

  await audit({ tenantId: invite.tenantId, userId: result.userId, action: 'create', entity: 'Membership', after: { email, role: invite.role, acceptedInvitationId: invite.id } });
  logger.info({ tenantId: invite.tenantId, email }, 'Invite angenommen');
  return json(result);
});

class ValidationError extends Error {
  status = 400;
}
