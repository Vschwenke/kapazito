import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PlanungDashboard } from './_components/planung-dashboard';

export default function PlanungPage() {
  return (
    <DashboardShell title="PLANUNG & FORECAST" subtitle="IST-SOLL-Vergleiche und Forecast-Analysen">
      <PlanungDashboard />
    </DashboardShell>
  );
}
