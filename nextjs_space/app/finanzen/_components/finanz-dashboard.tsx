'use client';

import { useState, useEffect, useCallback } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { GaugeChart } from '@/components/ui/gauge-chart';
import { FilterBar } from '@/components/ui/filter-bar';
import { formatCurrency, getMonthShort } from '@/lib/format';
import { DollarSign, TrendingUp, TrendingDown, Users, UserPlus, BarChart3, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend, ComposedChart, Area
} from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3'];

export function FinanzDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2026);
  const [quarter, setQuarter] = useState(0);
  const [month, setMonth] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finanzen?year=${year}&quarter=${quarter}&month=${month}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [year, quarter, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!data) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground"><AlertCircle className="w-5 h-5 mr-2" /> Keine Daten verf\u00fcgbar</div>;
  }

  const revenueDelta = data?.bwa?.find((b: any) => b?.accountNumber === '1020')?.delta ?? 0;
  const rohertragDelta = data?.bwa?.find((b: any) => b?.accountNumber === '1092')?.delta ?? 0;
  const kostenDelta = data?.bwa?.find((b: any) => b?.accountNumber === '1260')?.delta ?? 0;
  const ergebnisDelta = data?.bwa?.find((b: any) => b?.accountNumber === '1270')?.delta ?? 0;

  const deckungsbeitrag = (data?.revenue ?? 0) > 0 ? ((data?.rohertrag ?? 0) / (data?.revenue ?? 1)) * 100 : 0;
  const umsatzrendite = (data?.revenue ?? 0) > 0 ? ((data?.betriebsergebnis ?? 0) / (data?.revenue ?? 1)) * 100 : 0;

  // BWA table data
  const bwaRows = (data?.bwa ?? []).map((b: any) => ({
    name: b?.accountName ?? '',
    total: b?.total ?? 0,
    prevYear: b?.previousYear ?? 0,
    delta: b?.delta ?? 0,
    byMonth: b?.byMonth ?? {},
  }));

  // Cashflow chart data
  const cashflowData = (data?.cashflow ?? []).map((c: any) => ({
    month: getMonthShort(c?.month ?? 0),
    Zufluss: c?.inflow ?? 0,
    Abfluss: c?.outflow ?? 0,
    Kumulativ: c?.cumulative ?? 0,
  }));

  // Open items
  const openItemsData = Object.entries(data?.openItemsByCustomer ?? {}).map(([name, amount]: [string, any]) => ({
    name,
    amount: amount ?? 0,
  }));

  // Betriebsergebnis by month
  const beMonths = Object.keys((data?.bwa?.find((b: any) => b?.accountNumber === '1270')?.byMonth ?? {}));
  const beData = beMonths.map((m: any) => {
    const month = parseInt(m);
    return {
      month: getMonthShort(month),
      Umsatz: data?.bwa?.find((b: any) => b?.accountNumber === '1020')?.byMonth?.[m] ?? 0,
      Kosten: data?.bwa?.find((b: any) => b?.accountNumber === '1260')?.byMonth?.[m] ?? 0,
      Ergebnis: data?.bwa?.find((b: any) => b?.accountNumber === '1270')?.byMonth?.[m] ?? 0,
    };
  });

  return (
    <div className="space-y-4">
      <FilterBar selectedYear={year} selectedQuarter={quarter} selectedMonth={month}
        onYearChange={setYear} onQuarterChange={setQuarter} onMonthChange={setMonth} />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Umsatzerl\u00f6se" value={data?.revenue ?? 0} format="currency" delta={revenueDelta} deltaLabel="\u0394/VJ" icon={DollarSign} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Rohertrag" value={data?.rohertrag ?? 0} format="currency" delta={rohertragDelta} deltaLabel="\u0394/VJ" icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Gesamtkosten" value={data?.gesamtkosten ?? 0} format="currency" delta={kostenDelta} deltaLabel="\u0394/VJ" icon={TrendingDown} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Betriebsergebnis" value={data?.betriebsergebnis ?? 0} format="currency" delta={ergebnisDelta} deltaLabel="\u0394/VJ" icon={BarChart3} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Kunden" value={data?.customers ?? 0} icon={Users} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Entwickler" value={data?.developers ?? 0} icon={UserPlus} iconColor="bg-cyan-50 text-cyan-600" />
      </div>

      {/* Gauges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={deckungsbeitrag} label="Deckungsbeitrag" color="#60B5FF" />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={data?.utilization ?? 0} label="Auslastung" color="#10b981" />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={umsatzrendite} label="Umsatzrendite" color="#FF9149" />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Offene Posten</p>
            <p className="text-2xl font-bold font-mono mt-2">{formatCurrency(data?.totalOpenItems ?? 0)}</p>
            <Wallet className="w-6 h-6 mx-auto mt-2 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Betriebsergebnis */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Betriebsergebnis</h3>
          <div className="h-64">
            {beData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={beData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v ?? 0) / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                  <Bar dataKey="Umsatz" fill="#60B5FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Kosten" fill="#FF9898" radius={[4, 4, 0, 0]} />
                  <Line dataKey="Ergebnis" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten f\u00fcr diesen Zeitraum</p>}
          </div>
        </div>

        {/* Cashflow */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Cashflow</h3>
          <div className="h-64">
            {cashflowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={cashflowData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v ?? 0) / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                  <Bar dataKey="Zufluss" fill="#80D8C3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Abfluss" fill="#FF9898" radius={[4, 4, 0, 0]} />
                  <Line dataKey="Kumulativ" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten f\u00fcr diesen Zeitraum</p>}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Offene Posten by Customer */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Offene Posten nach Kunden</h3>
          <div className="h-64">
            {openItemsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={openItemsData} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
                  <XAxis type="number" tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v ?? 0) / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 10 }} width={55} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                  <Bar dataKey="amount" fill="#FF9149" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine offenen Posten</p>}
          </div>
        </div>

        {/* BWA Table */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
          <h3 className="text-sm font-semibold mb-3">BWA-\u00dcbersicht</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 px-2 font-semibold">Position</th>
                <th className="text-right py-1.5 px-2 font-semibold">Gesamt</th>
                <th className="text-right py-1.5 px-2 font-semibold">Vorjahr</th>
                <th className="text-right py-1.5 px-2 font-semibold">\u0394 %</th>
              </tr>
            </thead>
            <tbody>
              {(bwaRows ?? []).map((row: any, i: number) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-1.5 px-2 font-medium">{row?.name ?? ''}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(row?.total ?? 0)}</td>
                  <td className="text-right py-1.5 px-2 font-mono text-muted-foreground">{formatCurrency(row?.prevYear ?? 0)}</td>
                  <td className={`text-right py-1.5 px-2 font-mono ${(row?.delta ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {(row?.delta ?? 0) >= 0 ? '+' : ''}{(row?.delta ?? 0).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
