import { DashboardShell } from '@/components/layout/dashboard-shell';
import { BillingAssistantClient } from './_assistant-client';

export const dynamic = 'force-dynamic';

export default function AbrechnenPage() {
  return (
    <DashboardShell
      title="ABRECHNUNGS-ASSISTENT"
      subtitle="Kapi erstellt aus den genehmigten Stunden Rechnungsentwuerfe — du gibst frei."
    >
      <BillingAssistantClient />
    </DashboardShell>
  );
}
