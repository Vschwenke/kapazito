import { DashboardShell } from '@/components/layout/dashboard-shell';
import { BaseReportView } from './_components/base-report-view';

export default function BasePage() {
  return (
    <DashboardShell title="BASE REPORT" subtitle="Datenmodell-\u00dcbersicht und Statistiken">
      <BaseReportView />
    </DashboardShell>
  );
}
