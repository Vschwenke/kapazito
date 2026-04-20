'use client';

import { useState, useEffect, useCallback } from 'react';
import { FilterBar } from '@/components/ui/filter-bar';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency, getMonthShort } from '@/lib/format';
import { Loader2, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

export function ErtraegeView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2026);
  const [quarter, setQuarter] = useState(0);
  const [month, setMonth] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finanzen?year=${year}&quarter=${quarter}&month=${month}`);
      setData(await res.json());
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [year, quarter, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const revenueAcc = data?.bwa?.find((b: any) => b?.accountNumber === '1020');
  const refinancingAcc = data?.bwa?.find((b: any) => b?.accountNumber === '1032');
  const rohertragAcc = data?.bwa?.find((b: any) => b?.accountNumber === '1092');

  const monthlyData = Object.keys(revenueAcc?.byMonth ?? {}).map((m: any) => ({
    month: getMonthShort(parseInt(m)),
    Umsatz: revenueAcc?.byMonth?.[m] ?? 0,
    Refinancing: refinancingAcc?.byMonth?.[m] ?? 0,
    Rohertrag: rohertragAcc?.byMonth?.[m] ?? 0,
  }));

  return (
    <div className="space-y-4">
      <FilterBar selectedYear={year} selectedQuarter={quarter} selectedMonth={month} onYearChange={setYear} onQuarterChange={setQuarter} onMonthChange={setMonth} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <KpiCard title="Umsatzerl\u00f6se" value={revenueAcc?.total ?? 0} format="currency" delta={revenueAcc?.delta} deltaLabel="\u0394/VJ" icon={DollarSign} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Refinancing" value={refinancingAcc?.total ?? 0} format="currency" icon={TrendingUp} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Rohertrag" value={rohertragAcc?.total ?? 0} format="currency" delta={rohertragAcc?.delta} deltaLabel="\u0394/VJ" icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Ertr\u00e4ge nach Monat</h3>
          <div className="h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Umsatz" fill="#60B5FF" radius={[4,4,0,0]} />
                  <Bar dataKey="Refinancing" fill="#A19AD3" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Rohertrag-Entwicklung</h3>
          <div className="h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                  <Area dataKey="Rohertrag" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
