import { DashboardShell } from '@/components/layout/dashboard-shell';
import { BetriebskostenView } from './_components/betriebskosten-view';

export default function BetriebskostenPage() {
  return (
    <DashboardShell title="BETRIEBSKOSTEN" subtitle="Kostenaufschlüsselung nach Kategorien">
      <BetriebskostenView />
    </DashboardShell>
  );
}
