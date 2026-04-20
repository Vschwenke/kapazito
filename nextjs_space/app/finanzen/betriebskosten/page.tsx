import { DashboardShell } from '@/components/layout/dashboard-shell';
import { BetriebskostenView } from './_components/betriebskosten-view';

export default function BetriebskostenPage() {
  return (
    <DashboardShell title="BETRIEBSKOSTEN" subtitle="Kostenaufschl\u00fcsselung nach Kategorien">
      <BetriebskostenView />
    </DashboardShell>
  );
}
