'use client';

import { useState } from 'react';
import { SalesDashboard } from './sales-dashboard';
import { RechnungenDashboard } from '@/app/rechnungen/_components/rechnungen-dashboard';
import { RechnungenDetailsView } from '@/app/rechnungen/details/_components/rechnungen-details-view';
import { TrendingUp, Receipt, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'umsatz', label: 'Umsatz & Kunden', icon: TrendingUp },
  { id: 'rechnungen', label: 'Rechnungen', icon: Receipt },
  { id: 'billing', label: 'Billing-Details', icon: FileText },
];

export function SalesFakturaTabs() {
  const [activeTab, setActiveTab] = useState('umsatz');

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
      {activeTab === 'umsatz' && <SalesDashboard />}
      {activeTab === 'rechnungen' && <RechnungenDashboard />}
      {activeTab === 'billing' && <RechnungenDetailsView />}
    </div>
  );
}
