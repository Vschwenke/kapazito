// GET  /api/rechnungen          — Liste + Filter
// POST /api/rechnungen          — neuer manueller Entwurf
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { tenantDb } from '@/lib/tenant-prisma';
import { requirePermission } from '@/lib/rbac';
import { parseJson, parseQuery, withErrorHandling, json } from '@/lib/api';
import { createDraft } from '@/lib/services/invoice.service';
import { audit } from '@/lib/services/audit.service';

const listQuery = z.object({
  status: z.string().optional(),
  customerId: z.string().optional(),
  year: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(50),
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:read');
  const db = await tenantDb();
  const q = parseQuery(req, listQuery);

  const where: any = {};
  if (q.status) where.status = q.status;
  if (q.customerId) where.customerId = q.customerId;
  if (q.year) {
    where.issueDate = { gte: new Date(q.year, 0, 1), lt: new Date(q.year + 1, 0, 1) };
  }

  const [items, total] = await Promise.all([
    db.invoice.findMany({
      where,
      orderBy: [{ issueDate: 'desc' }, { invoiceNo: 'desc' }],
      skip: (q.page - 1) * q.limit,
      take: q.limit,
      include: { customer: { select: { id: true, name: true, shortName: true } }, items: true, _count: { select: { reminders: true } } },
    }),
    db.invoice.count({ where }),
  ]);

  return json({ items, total, page: q.page, limit: q.limit });
});

const createBody = z.object({
  customerId: z.string().cuid(),
  issueDate: z.coerce.date().optional(),
  paymentTerms: z.number().int().positive().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().optional(),
    unitPrice: z.number().nonnegative(),
    vatRate: z.number().min(0).max(100).optional(),
    vatCategory: z.enum(['S', 'AE', 'Z', 'E']).optional(),
    projectId: z.string().optional(),
    servicePeriodFrom: z.coerce.date().nullable().optional(),
    servicePeriodTo: z.coerce.date().nullable().optional(),
  })).min(1),
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  requirePermission(session.role, 'invoice:write');
  const body = await parseJson(req, createBody);

  const invoice = await createDraft({ tenantId: session.tenantId, ...body });
  await audit({ tenantId: session.tenantId, userId: session.id, action: 'create', entity: 'Invoice', entityId: invoice.id, after: { invoiceNo: invoice.invoiceNo } });
  return json(invoice, 201);
});
