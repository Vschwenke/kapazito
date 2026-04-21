import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ProjektControllingClient } from './_components/projekt-controlling-client';

export default function ProjektControllingPage() {
  return (
    <DashboardShell title="PROJEKT-CONTROLLING" subtitle="Budget, Profitabilität und Fortschritt pro Projekt">
      <ProjektControllingClient />
    </DashboardShell>
  );
}
