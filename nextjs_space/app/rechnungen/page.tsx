import { DashboardShell } from '@/components/layout/dashboard-shell';
import { RechnungenDashboard } from './_components/rechnungen-dashboard';

export default function RechnungenPage() {
  return (
    <DashboardShell title="RECHNUNGSSTELLUNG" subtitle="Operative Rechnungs\u00fcbersicht und Billing-Status">
      <RechnungenDashboard />
    </DashboardShell>
  );
}
