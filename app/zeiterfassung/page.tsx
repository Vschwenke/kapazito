import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ZeiterfassungClient } from './_components/zeiterfassung-client';

export default function ZeiterfassungPage() {
  return (
    <DashboardShell title="ZEITERFASSUNG" subtitle="Stunden buchen und Wochenübersicht">
      <ZeiterfassungClient />
    </DashboardShell>
  );
}
