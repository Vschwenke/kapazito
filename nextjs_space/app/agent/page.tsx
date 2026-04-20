import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AgentChat } from './_components/agent-chat';

export default function AgentPage() {
  return (
    <DashboardShell title="KI-ASSISTENT" subtitle="Intelligente Analyse und Beratung f\u00fcr Ihr Unternehmen">
      <AgentChat />
    </DashboardShell>
  );
}
