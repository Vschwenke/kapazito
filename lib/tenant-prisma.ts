// Tenant-aware Prisma-Wrapper.
//
// Anstelle von `prisma.invoice.findMany(...)` direkt rufen API-Routes immer:
//   const db = await tenantDb();
//   await db.invoice.findMany(...)
//
// Der Wrapper injiziert tenantId automatisch in where-Clauses und create-Data.
// Schutz gegen versehentliche cross-tenant Queries, ohne dass Entwickler sich
// merken muss, wo tenantId hingehoert.
//
// Implementierung nutzt Prisma Client Extensions (Prisma 5+).

import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getServerAuth } from '@/lib/auth';

// Liste der Models, die tenantId haben (zum automatischen Scope).
const TENANT_MODELS = new Set([
  'Customer',
  'Employee',
  'Project',
  'TimeEntry',
  'Absence',
  'FinancialAccount',
  'PersonnelCost',
  'Invoice',
  'InvoiceItem',
  'InvoiceNumberRange',
  'OpenItem',
  'FinancialPlanning',
  'Holiday',
  'EmployeeAssignment',
  'UserReport',
  'CashflowEntry',
  'ChatMessage',
  'Payment',
  'Reminder',
  'Quote',
  'QuoteItem',
  'AgentAction',
  'AuditLog',
  'Document',
  'ApiKey',
  'WebhookSubscription',
  'Invitation',
]);

export function createTenantScopedClient(tenantId: string) {
  return prisma.$extends({
    name: 'tenant-scope',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_MODELS.has(model)) {
            return query(args);
          }
          // Mutate args to enforce tenantId
          const a = args as any;
          if (operation === 'create') {
            a.data = { ...a.data, tenantId };
          } else if (operation === 'createMany' && Array.isArray(a.data)) {
            a.data = a.data.map((d: any) => ({ ...d, tenantId }));
          } else if (operation === 'upsert') {
            a.where = { ...a.where, tenantId };
            a.create = { ...a.create, tenantId };
          } else if (
            ['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany',
             'update', 'updateMany', 'delete', 'deleteMany', 'count', 'aggregate', 'groupBy'].includes(operation)
          ) {
            a.where = { ...(a.where || {}), tenantId };
          }
          return query(a);
        },
      },
    },
  });
}

/**
 * Liefert den tenant-scoped Prisma-Client fuer die aktuelle Session.
 * Wirft 401 wenn keine Session.
 */
export async function tenantDb() {
  const session = await getServerAuth();
  if (!session) {
    const err = new Error('Nicht autorisiert — keine Session') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return createTenantScopedClient(session.tenantId);
}

/**
 * Fuer Jobs/Cron, wo explizit ein Tenant gewaehlt wird.
 */
export function tenantDbFor(tenantId: string) {
  return createTenantScopedClient(tenantId);
}
