import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function StammdatenLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell title="STAMMDATEN" subtitle="Kunden, Mitarbeiter und Projekte verwalten">
      {children}
    </DashboardShell>
  );
}
