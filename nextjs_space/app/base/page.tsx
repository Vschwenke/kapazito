import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SystemTabs } from './_components/system-tabs';

export default function BasePage() {
  return (
    <DashboardShell title="SYSTEM & DATEN" subtitle="Datenmodell, Konfiguration und Systemübersicht">
      <SystemTabs />
    </DashboardShell>
  );
}
