'use client';

import { useState, useEffect, useCallback } from 'react';
import { FilterBar } from '@/components/ui/filter-bar';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency, getMonthShort } from '@/lib/format';
import { Loader2, DollarSign, Users, Building, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#1a9a8a', '#7c5cfc', '#f59e42', '#e8577a', '#38bdf8', '#34d399'];

// Map BWA account numbers to categories
const COST_CATEGORIES: Record<string, string> = {
  '1100': 'Personalkosten',
  '1110': 'Gehälter',
  '1120': 'Sozialabgaben',
  '1200': 'Sachkosten',
  '1210': 'Miete & Büro',
  '1220': 'IT & Software',
  '1230': 'Marketing',
  '1240': 'Reisekosten',
  '1250': 'Abschreibungen',
};

export function BetriebskostenView() {
  const [finData, setFinData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2026);
  const [quarter, setQuarter] = useState(0);
  const [month, setMonth] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finanzen?year=${year}&quarter=${quarter}&month=${month}`);
      setFinData(await res.json());
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [year, quarter, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  // Extract real cost categories from BWA data
  const bwa = finData?.bwa ?? [];
  const kostenAcc = bwa.find((b: any) => b?.accountNumber === '1260');
  const total = kostenAcc?.total ?? 0;

  // Try to find real sub-categories from BWA
  const personalAcc = bwa.find((b: any) => b?.category === 'Personalkosten' || b?.accountNumber === '1100');
  const sachAcc = bwa.find((b: any) => b?.category === 'Sachkosten' || b?.accountNumber === '1200');
  const abschreibAcc = bwa.find((b: any) => b?.category === 'Abschreibungen' || b?.accountNumber === '1250');

  const personalkosten = personalAcc?.total ?? 0;
  const sachkosten = sachAcc?.total ?? 0;
  const abschreibungen = abschreibAcc?.total ?? 0;

  // If we have real subcategories, use them; otherwise derive from total
  const hasRealData = personalkosten > 0 || sachkosten > 0;
  const costBreakdown = hasRealData
    ? [
        { name: 'Personalkosten', value: personalkosten },
        { name: 'Sachkosten', value: sachkosten },
        { name: 'Abschreibungen', value: abschreibungen },
        { name: 'Sonstige', value: Math.max(0, total - personalkosten - sachkosten - abschreibungen) },
      ].filter(c => c.value > 0)
    : [
        { name: 'Personalkosten', value: total * 0.65 },
        { name: 'Sachkosten', value: total * 0.18 },
        { name: 'Abschreibungen', value: total * 0.08 },
        { name: 'Sonstige', value: total * 0.09 },
      ];

  // Monthly data from real BWA
  const monthlyData = Object.keys(kostenAcc?.byMonth ?? {}).map((m: any) => {
    const mTotal = kostenAcc?.byMonth?.[m] ?? 0;
    if (hasRealData) {
      return {
        month: getMonthShort(parseInt(m)),
        Personalkosten: personalAcc?.byMonth?.[m] ?? 0,
        Sachkosten: sachAcc?.byMonth?.[m] ?? 0,
        Abschreibungen: abschreibAcc?.byMonth?.[m] ?? 0,
        Sonstige: Math.max(0, mTotal - (personalAcc?.byMonth?.[m] ?? 0) - (sachAcc?.byMonth?.[m] ?? 0) - (abschreibAcc?.byMonth?.[m] ?? 0)),
      };
    }
    return {
      month: getMonthShort(parseInt(m)),
      Personalkosten: mTotal * 0.65,
      Sachkosten: mTotal * 0.18,
      Abschreibungen: mTotal * 0.08,
      Sonstige: mTotal * 0.09,
    };
  });

  const exportCSV = () => {
    const header = 'Kategorie;Betrag\n';
    const rows = costBreakdown.map(c => `${c.name};${c.value.toFixed(2)}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `betriebskosten_${year}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FilterBar selectedYear={year} selectedQuarter={quarter} selectedMonth={month} onYearChange={setYear} onQuarterChange={setQuarter} onMonthChange={setMonth} />
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
      </div>

      {!hasRealData && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600">
          <span>⚠️ Keine detaillierten Unterkategorien in BWA-Daten. Verteilung wird geschätzt. Importieren Sie detaillierte BWA-Daten für exakte Aufschlüsselung.</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Gesamtkosten" value={total} format="currency" delta={kostenAcc?.delta} deltaLabel="Δ/VJ" icon={DollarSign} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Personalkosten" value={costBreakdown.find(c => c.name === 'Personalkosten')?.value ?? 0} format="currency" icon={Users} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard title="Sachkosten" value={costBreakdown.find(c => c.name === 'Sachkosten')?.value ?? 0} format="currency" icon={Building} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Sonstige" value={(costBreakdown.find(c => c.name === 'Abschreibungen')?.value ?? 0) + (costBreakdown.find(c => c.name === 'Sonstige')?.value ?? 0)} format="currency" icon={DollarSign} iconColor="bg-purple-50 text-purple-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Kostenaufschlüsselung</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={costBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                  label={({ name, percent }: any) => `${name} ${((percent??0)*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {costBreakdown.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Kosten nach Monat</h3>
          <div className="h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Personalkosten" stackId="a" fill="#1a9a8a" />
                  <Bar dataKey="Sachkosten" stackId="a" fill="#f59e42" />
                  <Bar dataKey="Abschreibungen" stackId="a" fill="#e8577a" />
                  <Bar dataKey="Sonstige" stackId="a" fill="#7c5cfc" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Kostendetail</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border"><th className="text-left py-1.5 px-2">Kategorie</th><th className="text-right py-1.5 px-2">Betrag</th><th className="text-right py-1.5 px-2">Anteil</th></tr></thead>
          <tbody>
            {costBreakdown.map((c, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {c.name}
                </td>
                <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(c.value)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{total > 0 ? ((c.value / total) * 100).toFixed(1) : 0}%</td>
              </tr>
            ))}
            <tr className="font-bold border-t-2 border-border">
              <td className="py-1.5 px-2">Gesamt</td>
              <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(total)}</td>
              <td className="text-right py-1.5 px-2 font-mono">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
