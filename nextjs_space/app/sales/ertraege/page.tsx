import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SalesErtraegeView } from './_components/sales-ertraege-view';

export default function SalesErtraegePage() {
  return (
    <DashboardShell title="SALES - ERTRÄGE" subtitle="Kundenspezifische Ertragsanalyse">
      <SalesErtraegeView />
    </DashboardShell>
  );
}
