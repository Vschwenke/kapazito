import { DashboardShell } from '@/components/layout/dashboard-shell';
import { BwaImportClient } from './_components/bwa-import-client';

export default function ImportPage() {
  return (
    <DashboardShell title="DATENIMPORT" subtitle="BWA- und Finanzdaten aus CSV importieren">
      <BwaImportClient />
    </DashboardShell>
  );
}
