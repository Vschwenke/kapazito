import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ErtraegeView } from './_components/ertraege-view';

export default function ErtraegePage() {
  return (
    <DashboardShell title="ERTR\u00c4GE" subtitle="Detaillierte Ertragsaufschl\u00fcsselung und Zeitreihenanalyse">
      <ErtraegeView />
    </DashboardShell>
  );
}
