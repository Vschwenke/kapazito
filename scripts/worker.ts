// Worker-Prozess — laeuft im Produktions-Container als zweiter Node-Prozess
// oder als separater Docker-Service. Registriert pg-boss-Handler + Cron-Zeitplaene.
//
// Aufruf:
//   tsx scripts/worker.ts
//
// Cron-Zeitplaene:
//   - reminders.run  taeglich 08:00 Europe/Berlin
//   - audit.cleanup  woechentlich So 03:00
//   - cashflow.recompute  taeglich 02:00
import 'dotenv/config';
import { getBoss, scheduleCron } from '../lib/jobs/queue';
import { registerHandlers } from '../lib/jobs/handlers';
import { logger } from '../lib/errors';

async function main() {
  const boss = await getBoss();
  await registerHandlers(boss);

  await scheduleCron('reminders.run', '0 8 * * *');
  await scheduleCron('audit.cleanup', '0 3 * * 0');
  await scheduleCron('cashflow.recompute', '0 2 * * *');

  logger.info('Worker gestartet — Cron-Zeitplaene aktiv.');
}

main().catch((e) => {
  logger.error({ err: e }, 'Worker-Start fehlgeschlagen');
  process.exit(1);
});
