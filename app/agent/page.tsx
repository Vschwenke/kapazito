import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AgentChat } from './_components/agent-chat';

export default function AgentPage() {
  return (
    <DashboardShell title="KI-ASSISTENT" subtitle="Intelligente Analyse und Beratung für Ihr Unternehmen">
      <AgentChat />
    </DashboardShell>
  );
}
