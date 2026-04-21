import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ConfigView } from './_components/config-view';

export default function ConfigPage() {
  return (
    <DashboardShell title="KONFIGURATION" subtitle="System-Einstellungen und Datenquelleninfo">
      <ConfigView />
    </DashboardShell>
  );
}
