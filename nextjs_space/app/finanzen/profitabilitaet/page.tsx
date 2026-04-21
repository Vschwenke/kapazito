'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DeckungsbeitragView } from '@/app/finanzen/deckungsbeitrag/_components/deckungsbeitrag-view';
import { ProjektControllingClient } from '@/app/projekte/_components/projekt-controlling-client';
import { PieChart, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'kunden', label: 'Kunden-Deckungsbeitrag', icon: PieChart },
  { id: 'projekte', label: 'Projekt-Controlling', icon: Target },
];

export default function ProfitabilitaetPage() {
  const [activeTab, setActiveTab] = useState('kunden');

  return (
    <DashboardShell title="PROFITABILITÄT" subtitle="Echtkosten-Deckungsbeiträge nach Kunden und Projekt-Budget-Controlling">
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
        {activeTab === 'kunden' && <DeckungsbeitragView />}
        {activeTab === 'projekte' && <ProjektControllingClient />}
      </div>
    </DashboardShell>
  );
}
