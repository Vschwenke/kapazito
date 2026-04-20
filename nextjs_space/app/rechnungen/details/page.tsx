import { DashboardShell } from '@/components/layout/dashboard-shell';
import { RechnungenDetailsView } from './_components/rechnungen-details-view';

export default function RechnungenDetailsPage() {
  return (
    <DashboardShell title="RECHNUNGSSTELLUNG - DETAILS" subtitle="Kundenspezifische Rechnungsdetails">
      <RechnungenDetailsView />
    </DashboardShell>
  );
}
