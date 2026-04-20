'use client';

import { useState, useEffect, useCallback } from 'react';
import { FilterBar } from '@/components/ui/filter-bar';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency, getMonthShort } from '@/lib/format';
import { Loader2, DollarSign, Users, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#A19AD3'];

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

  const kostenAcc = finData?.bwa?.find((b: any) => b?.accountNumber === '1260');
  const total = kostenAcc?.total ?? 0;

  // Simulate cost breakdown
  const costBreakdown = [
    { name: 'Personalkosten', value: total * 0.65 },
    { name: 'Sachkosten', value: total * 0.18 },
    { name: 'Abschreibungen', value: total * 0.08 },
    { name: 'Sonstige', value: total * 0.09 },
  ];

  const monthlyData = Object.keys(kostenAcc?.byMonth ?? {}).map((m: any) => ({
    month: getMonthShort(parseInt(m)),
    Personalkosten: (kostenAcc?.byMonth?.[m] ?? 0) * 0.65,
    Sachkosten: (kostenAcc?.byMonth?.[m] ?? 0) * 0.18,
    Abschreibungen: (kostenAcc?.byMonth?.[m] ?? 0) * 0.08,
    Sonstige: (kostenAcc?.byMonth?.[m] ?? 0) * 0.09,
  }));

  return (
    <div className="space-y-4">
      <FilterBar selectedYear={year} selectedQuarter={quarter} selectedMonth={month} onYearChange={setYear} onQuarterChange={setQuarter} onMonthChange={setMonth} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Gesamtkosten" value={total} format="currency" delta={kostenAcc?.delta} deltaLabel="\u0394/VJ" icon={DollarSign} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Personalkosten" value={total * 0.65} format="currency" icon={Users} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Sachkosten" value={total * 0.18} format="currency" icon={Building} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Sonstige" value={total * 0.17} format="currency" icon={DollarSign} iconColor="bg-purple-50 text-purple-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Kostenaufschl\u00fcsselung</h3>
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
                  <Bar dataKey="Personalkosten" stackId="a" fill="#60B5FF" />
                  <Bar dataKey="Sachkosten" stackId="a" fill="#FF9149" />
                  <Bar dataKey="Abschreibungen" stackId="a" fill="#FF9898" />
                  <Bar dataKey="Sonstige" stackId="a" fill="#A19AD3" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
