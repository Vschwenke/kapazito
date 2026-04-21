// Audit-Log. Append-only. GoBD-relevant.
import { prisma } from '@/lib/db';

export interface AuditEntry {
  tenantId: string;
  userId?: string | null;
  action: 'create' | 'update' | 'delete' | 'read' | 'send' | 'cancel';
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
}

export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: entry.tenantId,
        userId: entry.userId ?? null,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        before: entry.before as any,
        after: entry.after as any,
        ip: entry.ip,
        userAgent: entry.userAgent,
      },
    });
  } catch {
    // Audit darf die Business-Action nicht crashen.
  }
}
