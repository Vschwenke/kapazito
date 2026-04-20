import { DashboardShell } from '@/components/layout/dashboard-shell';
import { HrTeamDashboard } from './_components/hr-team-dashboard';

export default function HrPage() {
  return (
    <DashboardShell title="HR & RECRUITING - TEAM" subtitle="Auslastungsquoten, Fluktuation, Krankheitsquoten">
      <HrTeamDashboard />
    </DashboardShell>
  );
}
