'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatNumber } from '@/lib/format';
import { Loader2, Database, Users, Layers, Table2, FileText, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1a9a8a', '#7c5cfc', '#f59e42', '#e8577a', '#38bdf8', '#34d399'];
const SOURCE_COLORS: Record<string, string> = { Zeiterfassung: '#1a9a8a', Buchhaltung: '#7c5cfc', Stammdaten: '#34d399', Projektverwaltung: '#38bdf8', Rechnungsmodul: '#e8577a', Planung: '#f59e42', System: '#818cf8' };

export function BaseReportView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/base')
      .then(r => r.json())
      .then(setData)
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const tables = data?.tables ?? [];
  const bySource: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const t of tables) {
    const src = t?.source ?? 'Unbekannt';
    const typ = t?.type ?? 'Unbekannt';
    bySource[src] = (bySource[src] ?? 0) + (t?.count ?? 0);
    byType[typ] = (byType[typ] ?? 0) + 1;
  }
  const sourceData = Object.entries(bySource ?? {}).map(([k, v]: [string, any]) => ({ name: k, value: v ?? 0, fill: SOURCE_COLORS[k] ?? '#999' }));
  const typeData = Object.entries(byType ?? {}).map(([k, v]: [string, any]) => ({ name: k, value: v ?? 0 }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Einträge DB" value={formatNumber(data?.totalEntries ?? 0)} icon={Database} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard title="Tabellen" value={tables?.length ?? 0} icon={Table2} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Datenquellen" value={Object.keys(bySource ?? {}).length} icon={Layers} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Entwickler" value={(data?.devByExperience ?? []).reduce((s: number, d: any) => s + (d?.count ?? 0), 0)} icon={Users} iconColor="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Einträge nach Quelle</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80}
                  label={({ name, value }: any) => `${name}: ${(value??0).toLocaleString('de-DE')}`} labelLine={false} fontSize={10}>
                  {sourceData.map((s: any, i: number) => <Cell key={i} fill={s?.fill ?? COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Entwickler nach Erfahrung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.devByExperience ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="level" tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="#1a9a8a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Datenmodell - Tabellenübersicht</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border">
            <th className="text-left py-1.5 px-2">Tabelle</th>
            <th className="text-left py-1.5 px-2">Typ</th>
            <th className="text-left py-1.5 px-2">Quelle</th>
            <th className="text-right py-1.5 px-2">Einträge</th>
          </tr></thead>
          <tbody>
            {(tables ?? []).map((t: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-mono font-medium">{t?.name}</td>
                <td className="py-1.5 px-2">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    t?.type === 'Fakt' ? 'bg-teal-100 text-teal-700' :
                    t?.type === 'Dimension' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                  }`}>{t?.type}</span>
                </td>
                <td className="py-1.5 px-2">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SOURCE_COLORS[t?.source ?? ''] ?? '#999' }} />
                    {t?.source}
                  </span>
                </td>
                <td className="text-right py-1.5 px-2 font-mono">{(t?.count ?? 0).toLocaleString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Data Architecture */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Datenarchitektur</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[{ name: 'Zeiterfassung', desc: 'Stunden & Abwesenheiten', icon: '⏰', color: 'bg-blue-50 border-blue-200' },
            { name: 'Buchhaltung', desc: 'BWA & Finanzen', icon: '📊', color: 'bg-orange-50 border-orange-200' },
            { name: 'Stammdaten', desc: 'Kunden & Mitarbeiter', icon: '🗄️', color: 'bg-emerald-50 border-emerald-200' },
            { name: 'Projektverwaltung', desc: 'Projekte & Verträge', icon: '📁', color: 'bg-purple-50 border-purple-200' },
            { name: 'Rechnungsmodul', desc: 'Billing & Faktura', icon: '🔗', color: 'bg-pink-50 border-pink-200' },
          ].map((s: any) => (
            <div key={s?.name} className={`rounded-lg p-3 border ${s?.color} text-center`}>
              <span className="text-2xl">{s?.icon}</span>
              <p className="text-sm font-bold mt-1">{s?.name}</p>
              <p className="text-[10px] text-muted-foreground">{s?.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center my-3">
          <span className="text-lg">↓</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center border border-slate-200 dark:border-slate-700">
          <Database className="w-6 h-6 mx-auto text-primary" />
          <p className="text-sm font-bold mt-1">Kapazito – Zentrales Datenmodell</p>
          <p className="text-[10px] text-muted-foreground">PostgreSQL • {(data?.totalEntries ?? 0).toLocaleString('de-DE')} Einträge • {tables?.length ?? 0} Tabellen</p>
        </div>
        <div className="text-center my-3">
          <span className="text-lg">↓</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {['Finanzreport', 'HR & Recruiting', 'Sales & CRM', 'Rechnungsstellung', 'Base Report'].map((r: string) => (
            <div key={r} className="bg-primary/10 rounded-lg p-2 text-center text-xs font-semibold text-primary">{r}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
