import { DashboardShell } from '@/components/layout/dashboard-shell';
import { ExecutiveDashboard } from './_components/executive-dashboard';

export default function DashboardPage() {
  return (
    <DashboardShell title="EXECUTIVE COCKPIT" subtitle="Gesamtübersicht aller Geschäftsbereiche">
      <ExecutiveDashboard />
    </DashboardShell>
  );
}
