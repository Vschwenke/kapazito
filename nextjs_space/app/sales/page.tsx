import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SalesDashboard } from './_components/sales-dashboard';

export default function SalesPage() {
  return (
    <DashboardShell title="SALES & CRM" subtitle="Kundenspezifische Umsatzanalyse, Stunds\u00e4tze, Projekte">
      <SalesDashboard />
    </DashboardShell>
  );
}
