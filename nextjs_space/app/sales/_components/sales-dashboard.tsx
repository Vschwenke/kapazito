'use client';

import { useState, useEffect, useCallback } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency, getMonthShort } from '@/lib/format';
import { Loader2, DollarSign, Clock, Users, Wallet, TrendingUp, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart, Area
} from 'recharts';

const COLORS = ['#1a9a8a', '#7c5cfc', '#f59e42', '#e8577a', '#38bdf8', '#34d399'];

export function SalesDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales?year=2026${selectedCustomer ? `&customerId=${selectedCustomer}` : ''}`);
      setData(await res.json());
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedCustomer]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const monthlyData = (data?.monthlyRevenue ?? []).map((m: any) => ({
    month: getMonthShort(m?.month ?? 0),
    Umsatz: m?.revenue ?? 0,
    Stunden: m?.hours ?? 0,
  }));

  const customerData = (data?.revenueByCustomer ?? []).map((c: any, i: number) => ({
    name: c?.name ?? '',
    value: c?.revenue ?? 0,
    hours: c?.hours ?? 0,
    employees: c?.employees ?? 0,
  }));

  return (
    <div className="space-y-4">
      {/* Customer filter */}
      <div className="flex flex-wrap items-center gap-2 bg-card rounded-lg px-4 py-2.5 border border-border/50 shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground">Kunde:</span>
        <button onClick={() => setSelectedCustomer('')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${!selectedCustomer ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
          Alle
        </button>
        {(data?.customers ?? []).map((c: any) => (
          <button key={c?.id} onClick={() => setSelectedCustomer(c?.id ?? '')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${selectedCustomer === c?.id ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
            {c?.shortName ?? c?.name ?? ''}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Abrechenbare Std." value={Math.round(data?.totalBillableHours ?? 0).toLocaleString('de-DE')} icon={Clock} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard title="Umsatz Kunden" value={data?.totalRevenue ?? 0} format="currency" icon={DollarSign} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Ø Stundensatz" value={`${(data?.avgHourlyRate ?? 0).toFixed(0)}€`} icon={TrendingUp} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Offene Posten" value={data?.totalOpenItems ?? 0} format="currency" icon={Wallet} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Aktive MA" value={data?.activeEmployees ?? 0} icon={Users} iconColor="bg-cyan-50 text-cyan-600" />
        <KpiCard title="Kunden" value={data?.customerCount ?? 0} icon={BarChart3} iconColor="bg-pink-50 text-pink-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Umsatz und Stunden</h3>
          <div className="h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="Umsatz" fill="#1a9a8a" radius={[4,4,0,0]} />
                  <Line yAxisId="right" dataKey="Stunden" stroke="#f59e42" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Umsatz nach Kunden</h3>
          <div className="h-72">
            {customerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={customerData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                    label={({ name, percent }: any) => `${name} ${((percent??0)*100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {customerData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Projekte</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border">
            <th className="text-left py-1.5 px-2">Projekt</th>
            <th className="text-left py-1.5 px-2">Kunde</th>
            <th className="text-right py-1.5 px-2">Stundensatz</th>
            <th className="text-right py-1.5 px-2">Budget (Std.)</th>
          </tr></thead>
          <tbody>
            {(data?.projects ?? []).map((p: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-medium">{p?.name}</td>
                <td className="py-1.5 px-2">{p?.customer}</td>
                <td className="text-right py-1.5 px-2 font-mono">{(p?.hourlyRate ?? 0).toFixed(0)}€</td>
                <td className="text-right py-1.5 px-2 font-mono">{(p?.budgetHours ?? 0).toLocaleString('de-DE')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
