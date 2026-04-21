import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ErtraegeView } from './_components/ertraege-view';

export default function ErtraegePage() {
  return (
    <DashboardShell title="ERTRÄGE" subtitle="Detaillierte Ertragsaufschlüsselung und Zeitreihenanalyse">
      <ErtraegeView />
    </DashboardShell>
  );
}
