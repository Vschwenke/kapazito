import { DashboardShell } from '@/components/layout/dashboard-shell';
import { InvoiceDetailClient } from './_invoice-detail-client';

export const dynamic = 'force-dynamic';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell title="RECHNUNGSDETAIL" subtitle="">
      <InvoiceDetailClient id={params.id} />
    </DashboardShell>
  );
}
