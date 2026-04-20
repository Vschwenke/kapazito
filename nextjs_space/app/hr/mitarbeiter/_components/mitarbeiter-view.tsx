'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { GaugeChart } from '@/components/ui/gauge-chart';
import { formatCurrency, formatPercent } from '@/lib/format';
import { Loader2, User, Briefcase, Home, Clock, Heart, Palmtree, DollarSign } from 'lucide-react';

export function MitarbeiterView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hr?year=2026')
      .then(r => r.json())
      .then(d => { setData(d); if ((d?.employees?.length ?? 0) > 0) setSelectedId(d?.employees?.[0]?.id ?? null); })
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const employees = data?.employees ?? [];
  const selected = employees.find((e: any) => e?.id === selectedId) ?? employees?.[0];

  return (
    <div className="flex gap-4 flex-col lg:flex-row">
      {/* Employee list */}
      <div className="w-full lg:w-64 shrink-0 bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-semibold">Mitarbeiter</h3>
        </div>
        <div className="overflow-y-auto max-h-[600px]">
          {employees.map((e: any) => (
            <button key={e?.id} onClick={() => setSelectedId(e?.id)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-border/30 transition-colors flex items-center gap-2 ${selectedId === e?.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50'}`}>
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{e?.name ?? ''}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Employee detail */}
      {selected && (
        <div className="flex-1 space-y-4">
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <h2 className="text-lg font-bold font-display">{selected?.name ?? ''}</h2>
            <p className="text-sm text-muted-foreground">{selected?.customer ?? ''} \u2022 {selected?.experienceLevel ?? ''} \u2022 {selected?.contractType ?? ''}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <KpiCard title="Vertragsart" value={selected?.contractType ?? '-'} icon={Briefcase} iconColor="bg-blue-50 text-blue-600" />
            <KpiCard title="Homeoffice" value={formatPercent(selected?.homeOfficePercent)} icon={Home} iconColor="bg-cyan-50 text-cyan-600" />
            <KpiCard title="Monatseinkommen" value={selected?.monthlyIncome ?? 0} format="currency" icon={DollarSign} iconColor="bg-emerald-50 text-emerald-600" />
            <KpiCard title="Erfahrung" value={selected?.experienceLevel ?? '-'} icon={User} iconColor="bg-purple-50 text-purple-600" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center">
              <GaugeChart value={selected?.utilization ?? 0} label="Auslastung" color="#10b981" size={100} />
            </div>
            <KpiCard title="Abrechenbare Std." value={Math.round(selected?.billableHours ?? 0).toLocaleString('de-DE')} icon={Clock} iconColor="bg-blue-50 text-blue-600" />
            <KpiCard title="Krankheitstage" value={Math.round(selected?.sickDays ?? 0)} icon={Heart} iconColor="bg-red-50 text-red-600" />
            <KpiCard title="Urlaubstage" value={Math.round(selected?.vacationDays ?? 0)} icon={Palmtree} iconColor="bg-amber-50 text-amber-600" />
          </div>

          {/* Employee table */}
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
            <h3 className="text-sm font-semibold mb-3">Alle Mitarbeiter</h3>
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border">
                <th className="text-left py-1.5 px-2">Name</th>
                <th className="text-left py-1.5 px-2">Kunde</th>
                <th className="text-left py-1.5 px-2">Level</th>
                <th className="text-right py-1.5 px-2">Auslastung</th>
                <th className="text-right py-1.5 px-2">Std.</th>
                <th className="text-right py-1.5 px-2">HO %</th>
              </tr></thead>
              <tbody>
                {employees.map((e: any) => (
                  <tr key={e?.id} className={`border-b border-border/50 hover:bg-muted/50 cursor-pointer ${selectedId === e?.id ? 'bg-primary/5' : ''}`}
                    onClick={() => setSelectedId(e?.id)}>
                    <td className="py-1.5 px-2 font-medium">{e?.name}</td>
                    <td className="py-1.5 px-2">{e?.customer}</td>
                    <td className="py-1.5 px-2">{e?.experienceLevel}</td>
                    <td className="text-right py-1.5 px-2 font-mono">{(e?.utilization ?? 0).toFixed(1)}%</td>
                    <td className="text-right py-1.5 px-2 font-mono">{Math.round(e?.billableHours ?? 0)}</td>
                    <td className="text-right py-1.5 px-2 font-mono">{(e?.homeOfficePercent ?? 0).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
