import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DeckungsbeitragView } from './_components/deckungsbeitrag-view';

export default function DeckungsbeitragPage() {
  return (
    <DashboardShell title="DECKUNGSBEITRAG" subtitle="Deckungsbeitragsanalyse nach Kunden und Projekten">
      <DeckungsbeitragView />
    </DashboardShell>
  );
}
