'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatPercent, getMonthShort } from '@/lib/format';
import { KpiCard } from '@/components/ui/kpi-card';
import { Loader2, PieChart as PieChartIcon, TrendingUp, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3'];

export function DeckungsbeitragView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sales?year=2026')
      .then(r => r.json())
      .then(setData)
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const customerData = (data?.revenueByCustomer ?? []).map((c: any, i: number) => ({
    name: c?.name ?? '',
    Umsatz: c?.revenue ?? 0,
    Stunden: c?.hours ?? 0,
    Mitarbeiter: c?.employees ?? 0,
    db: (c?.revenue ?? 0) * 0.47,
    color: COLORS[i % COLORS.length],
  }));

  const totalRevenue = customerData.reduce((s: number, c: any) => s + (c?.Umsatz ?? 0), 0);
  const totalDB = customerData.reduce((s: number, c: any) => s + (c?.db ?? 0), 0);
  const dbPercent = totalRevenue > 0 ? (totalDB / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Gesamtumsatz" value={totalRevenue} format="currency" icon={DollarSign} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Deckungsbeitrag" value={totalDB} format="currency" icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="DB-Quote" value={`${dbPercent.toFixed(1)}%`} icon={PieChartIcon} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Kunden" value={data?.customerCount ?? 0} icon={PieChartIcon} iconColor="bg-orange-50 text-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Deckungsbeitrag nach Kunden</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                <XAxis type="number" tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 10 }} width={55} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Umsatz" fill="#60B5FF" radius={[0, 4, 4, 0]} />
                <Bar dataKey="db" name="Deckungsbeitrag" fill="#80D8C3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Umsatzverteilung</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={customerData} dataKey="Umsatz" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: any) => `${name} ${((percent ?? 0)*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {customerData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Deckungsbeitrag Detail</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border"><th className="text-left py-1.5 px-2">Kunde</th><th className="text-right py-1.5 px-2">Umsatz</th><th className="text-right py-1.5 px-2">DB</th><th className="text-right py-1.5 px-2">DB %</th><th className="text-right py-1.5 px-2">Stunden</th><th className="text-right py-1.5 px-2">MA</th></tr></thead>
          <tbody>
            {customerData.map((c: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-medium">{c?.name}</td>
                <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(c?.Umsatz)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(c?.db)}</td>
                <td className="text-right py-1.5 px-2 font-mono text-emerald-600">{(c?.Umsatz > 0 ? (c?.db / c?.Umsatz * 100) : 0).toFixed(1)}%</td>
                <td className="text-right py-1.5 px-2 font-mono">{(c?.Stunden ?? 0).toLocaleString('de-DE')}</td>
                <td className="text-right py-1.5 px-2 font-mono">{c?.Mitarbeiter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
