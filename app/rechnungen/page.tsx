import { DashboardShell } from '@/components/layout/dashboard-shell';
import { RechnungenClient } from './_components/rechnungen-client';

export const dynamic = 'force-dynamic';

export default function RechnungenPage() {
  return (
    <DashboardShell
      title="RECHNUNGEN"
      subtitle="XRechnung/ZUGFeRD-konform · 3-Stufen-Mahnwesen · DATEV-Export"
    >
      <RechnungenClient />
    </DashboardShell>
  );
}
