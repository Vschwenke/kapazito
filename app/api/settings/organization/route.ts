// GET  /api/settings/organization  — Stammdaten der Organisation
// PATCH /api/settings/organization — Firmendaten aktualisieren
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { parseJson, withErrorHandling, json } from '@/lib/api';
import { audit } from '@/lib/services/audit.service';

export const GET = withErrorHandling(async () => {
  const session = await requireAuth();
  requirePermission(session.role, 'tenant:read');
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });
  return json(tenant);
});

const body = z.object({
  name: z.string().min(2).optional(),
  legalName: z.string().optional().nullable(),
  vatId: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  addressStreet: z.string().optional().nullable(),
  addressZip: z.string().optional().nullable(),
  addressCity: z.string().optional().nullable(),
  addressCountry: z.string().length(2).optional(),
  iban: z.string().optional().nullable(),
  bic: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  defaultCurrency: z.string().length(3).optional(),
  locale: z.string().optional(),
  datevClientNo: z.string().optional().nullable(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional().nullable(),
});

export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'tenant:update');
  const input = await parseJson(req, body);
  const before = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });
  const after = await prisma.tenant.update({ where: { id: session.tenantId }, data: input as any });
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'update', entity: 'Tenant', entityId: session.tenantId, before, after });
  return json(after);
});
