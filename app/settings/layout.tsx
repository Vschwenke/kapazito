import { DashboardShell } from '@/components/layout/dashboard-shell';
import { SettingsNav } from './_nav';

export const dynamic = 'force-dynamic';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="EINSTELLUNGEN" subtitle="Organisation, Team, Integrationen">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <aside>
          <SettingsNav />
        </aside>
        <section>{children}</section>
      </div>
    </DashboardShell>
  );
}
