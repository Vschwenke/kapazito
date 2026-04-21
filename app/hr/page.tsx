import { DashboardShell } from '@/components/layout/dashboard-shell';
import { TeamLeistungTabs } from './_components/team-leistung-tabs';

export default function HrPage() {
  return (
    <DashboardShell title="TEAM & LEISTUNG" subtitle="Auslastung, Mitarbeiter-Performance und Abwesenheiten">
      <TeamLeistungTabs />
    </DashboardShell>
  );
}
