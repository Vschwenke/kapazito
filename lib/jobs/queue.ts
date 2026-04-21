// Job-Queue auf Basis von pg-boss.
// Nutzt dieselbe Postgres-DB — keine zusaetzliche Infrastruktur.
// Laeuft als separater Prozess (scripts/worker.ts) oder im selben Container.

import PgBoss from 'pg-boss';
import { logger } from '@/lib/errors';

let boss: PgBoss | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL fehlt.');
  boss = new PgBoss({
    connectionString: url,
    schema: 'pgboss',
    retentionDays: 30,
  });
  boss.on('error', (e) => logger.error({ err: e }, 'pg-boss Fehler'));
  await boss.start();
  logger.info('pg-boss gestartet');
  return boss;
}

// Job-Typen
export type JobName =
  | 'reminders.run'
  | 'invoice.send'
  | 'cashflow.recompute'
  | 'audit.cleanup';

export async function enqueue<T extends object>(name: JobName, payload: T, opts?: PgBoss.SendOptions) {
  const b = await getBoss();
  return b.send(name, payload, opts);
}

export async function scheduleCron(name: JobName, cron: string, payload: object = {}) {
  const b = await getBoss();
  await b.schedule(name, cron, payload, { tz: 'Europe/Berlin' });
}
