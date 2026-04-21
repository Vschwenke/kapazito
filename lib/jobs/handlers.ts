// Job-Handler — registriert im Worker-Prozess.
import type PgBoss from 'pg-boss';
import { prisma } from '@/lib/db';
import { runReminderEngine } from '@/lib/services/reminder.service';
import { logger } from '@/lib/errors';

export async function registerHandlers(boss: PgBoss) {
  // Mahn-Engine pro Tenant
  await boss.work('reminders.run', { batchSize: 5 } as any, async (job: any) => {
    const tenantId = job.data?.tenantId as string | undefined;
    if (tenantId) {
      const res = await runReminderEngine(tenantId, false);
      logger.info({ tenantId, sent: res.sent }, 'reminders.run');
      return;
    }
    // Ohne tenantId: fuer alle aktiven Tenants durchlaufen.
    const tenants = await prisma.tenant.findMany({ select: { id: true } });
    for (const t of tenants) {
      await runReminderEngine(t.id, false);
    }
  });

  await boss.work('invoice.send', async (job: any) => {
    logger.info({ jobId: job.id, data: job.data }, 'invoice.send Job angekommen');
    // TODO: Implementierung ueber invoice-executor
  });

  await boss.work('cashflow.recompute', async (job: any) => {
    logger.info({ jobId: job.id }, 'cashflow.recompute Job');
    // TODO: Cashflow-Forecast-Rebuild pro Tenant
  });

  await boss.work('audit.cleanup', async () => {
    const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365);
    const res = await prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
    logger.info({ deleted: res.count }, 'audit.cleanup');
  });
}
