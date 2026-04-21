'use client';

import { useState } from 'react';
import { HrTeamDashboard } from './hr-team-dashboard';
import { MitarbeiterView } from '@/app/hr/mitarbeiter/_components/mitarbeiter-view';
import { Users, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'team', label: 'Team-Übersicht', icon: Users },
  { id: 'mitarbeiter', label: 'Mitarbeiter-Details', icon: UserCheck },
];

export function TeamLeistungTabs() {
  const [activeTab, setActiveTab] = useState('team');

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === 'team' && <HrTeamDashboard />}
      {activeTab === 'mitarbeiter' && <MitarbeiterView />}
    </div>
  );
}
