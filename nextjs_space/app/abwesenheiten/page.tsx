import { DashboardShell } from '@/components/layout/dashboard-shell';
import { AbwesenheitenClient } from './_components/abwesenheiten-client';

export default function AbwesenheitenPage() {
  return (
    <DashboardShell title="ABWESENHEITEN" subtitle="Urlaub, Krankheit und Abwesenheitskalender">
      <AbwesenheitenClient />
    </DashboardShell>
  );
}
