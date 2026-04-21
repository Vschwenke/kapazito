'use client';

import { useState } from 'react';
import { BaseReportView } from './base-report-view';
import { ConfigView } from '@/app/base/config/_components/config-view';
import { Database, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'daten', label: 'Datenübersicht', icon: Database },
  { id: 'system', label: 'System & Konfiguration', icon: Settings },
];

export function SystemTabs() {
  const [activeTab, setActiveTab] = useState('daten');

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
      {activeTab === 'daten' && <BaseReportView />}
      {activeTab === 'system' && <ConfigView />}
    </div>
  );
}
