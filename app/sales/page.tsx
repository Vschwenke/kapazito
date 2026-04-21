import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SalesFakturaTabs } from './_components/sales-faktura-tabs';

export default function SalesPage() {
  return (
    <DashboardShell title="SALES & FAKTURA" subtitle="Kundenanalyse, Rechnungsstellung und Billing-Übersicht">
      <SalesFakturaTabs />
    </DashboardShell>
  );
}
