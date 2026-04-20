'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatPercent, getMonthShort } from '@/lib/format';
import { KpiCard } from '@/components/ui/kpi-card';
import { Loader2, PieChart as PieChartIcon, TrendingUp, DollarSign, AlertTriangle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3'];

export function DeckungsbeitragView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const customerData = (data?.customerDB ?? []).map((c: any, i: number) => ({
    name: c?.name ?? '',
    Umsatz: c?.revenue ?? 0,
    Kosten: c?.costs ?? 0,
    Deckungsbeitrag: c?.db ?? 0,
    dbPercent: c?.dbPercent ?? 0,
    Stunden: c?.hours ?? 0,
    color: COLORS[i % COLORS.length],
  }));

  const totalRevenue = customerData.reduce((s: number, c: any) => s + (c?.Umsatz ?? 0), 0);
  const totalCosts = customerData.reduce((s: number, c: any) => s + (c?.Kosten ?? 0), 0);
  const totalDB = data?.totalDB ?? (totalRevenue - totalCosts);
  const dbPercent = data?.overallDBPercent ?? (totalRevenue > 0 ? (totalDB / totalRevenue) * 100 : 0);

  const exportCSV = () => {
    const header = 'Kunde;Umsatz;Personalkosten;Deckungsbeitrag;DB-Quote;Stunden\n';
    const rows = customerData.map((c: any) =>
      `${c.name};${c.Umsatz.toFixed(2)};${c.Kosten.toFixed(2)};${c.Deckungsbeitrag.toFixed(2)};${c.dbPercent.toFixed(1)}%;${c.Stunden}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `deckungsbeitrag_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Echtkosten-Berechnung
          </Badge>
          <span className="text-xs text-muted-foreground">Basierend auf realen Personalkosten × Allokation</span>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5 mr-1.5" />CSV Export</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KpiCard title="Gesamtumsatz" value={totalRevenue} format="currency" icon={DollarSign} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Personalkosten" value={totalCosts} format="currency" icon={DollarSign} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Deckungsbeitrag" value={totalDB} format="currency" icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="DB-Quote" value={`${dbPercent.toFixed(1)}%`} icon={PieChartIcon} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Kunden" value={customerData.length} icon={PieChartIcon} iconColor="bg-orange-50 text-orange-600" />
      </div>

      {customerData.some((c: any) => c.dbPercent < 20) && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <span><strong>Warnung:</strong> {customerData.filter((c: any) => c.dbPercent < 20).map((c: any) => c.name).join(', ')} ha{customerData.filter((c: any) => c.dbPercent < 20).length === 1 ? 't' : 'ben'} eine DB-Quote unter 20%</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Echtkosten-Deckungsbeitrag nach Kunden</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                <XAxis type="number" tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 10 }} width={55} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Umsatz" fill="#60B5FF" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Kosten" name="Personalkosten" fill="#FF9898" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Deckungsbeitrag" fill="#80D8C3" radius={[0, 4, 4, 0]} />
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
        <h3 className="text-sm font-semibold mb-3">Deckungsbeitrag Detail (Echtkosten)</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border"><th className="text-left py-1.5 px-2">Kunde</th><th className="text-right py-1.5 px-2">Umsatz</th><th className="text-right py-1.5 px-2">Personalkosten</th><th className="text-right py-1.5 px-2">DB</th><th className="text-right py-1.5 px-2">DB %</th><th className="text-right py-1.5 px-2">Stunden</th></tr></thead>
          <tbody>
            {customerData.map((c: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-medium">{c?.name}</td>
                <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(c?.Umsatz)}</td>
                <td className="text-right py-1.5 px-2 font-mono text-red-500">{formatCurrency(c?.Kosten)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(c?.Deckungsbeitrag)}</td>
                <td className={`text-right py-1.5 px-2 font-mono ${c?.dbPercent >= 30 ? 'text-emerald-600' : c?.dbPercent >= 15 ? 'text-orange-500' : 'text-red-500'}`}>{c?.dbPercent.toFixed(1)}%</td>
                <td className="text-right py-1.5 px-2 font-mono">{(c?.Stunden ?? 0).toLocaleString('de-DE')}</td>
              </tr>
            ))}
            <tr className="font-bold border-t-2 border-border">
              <td className="py-1.5 px-2">Gesamt</td>
              <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(totalRevenue)}</td>
              <td className="text-right py-1.5 px-2 font-mono text-red-500">{formatCurrency(totalCosts)}</td>
              <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(totalDB)}</td>
              <td className={`text-right py-1.5 px-2 font-mono ${dbPercent >= 30 ? 'text-emerald-600' : 'text-orange-500'}`}>{dbPercent.toFixed(1)}%</td>
              <td className="text-right py-1.5 px-2 font-mono">{customerData.reduce((s: number, c: any) => s + (c?.Stunden ?? 0), 0).toLocaleString('de-DE')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
