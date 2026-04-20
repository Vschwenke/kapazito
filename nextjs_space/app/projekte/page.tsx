import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProjektControllingClient } from './_components/projekt-controlling-client';

export default function ProjektControllingPage() {
  return (
    <DashboardShell title="PROJEKT-CONTROLLING" subtitle="Budget, Profitabilit\u00e4t und Fortschritt pro Projekt">
      <ProjektControllingClient />
    </DashboardShell>
  );
}
