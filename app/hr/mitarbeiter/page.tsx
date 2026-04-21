import { DashboardShell } from '@/components/layout/dashboard-shell';
import { MitarbeiterView } from './_components/mitarbeiter-view';

export default function MitarbeiterPage() {
  return (
    <DashboardShell title="HR - MITARBEITER" subtitle="Individuelle Mitarbeiter-Übersicht">
      <MitarbeiterView />
    </DashboardShell>
  );
}
