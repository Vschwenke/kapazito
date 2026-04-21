import { DashboardShell } from '@/components/layout/dashboard-shell';
import { FinanzDashboard } from './_components/finanz-dashboard';

export default function FinanzenPage() {
  return (
    <DashboardShell title="FINANZREPORT" subtitle="BWA-Dashboard mit Betriebsergebnis, Cashflow und Umsatzanalysen">
      <FinanzDashboard />
    </DashboardShell>
  );
}
