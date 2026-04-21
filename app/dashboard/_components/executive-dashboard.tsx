'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { GaugeChart } from '@/components/ui/gauge-chart';
import { formatCurrency, getMonthShort } from '@/lib/format';
import Link from 'next/link';
import {
  Loader2, DollarSign, TrendingUp, TrendingDown, Users, BarChart3, Clock,
  AlertTriangle, Wallet, PieChart as PieChartIcon, Target, Shield, Banknote,
  ArrowRight, AlertCircle, CheckCircle2, Info, UserMinus
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, ComposedChart
} from 'recharts';

const COLORS = ['#1a9a8a', '#7c5cfc', '#f59e42', '#e8577a', '#38bdf8', '#34d399'];

export function ExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!data) return <div className="flex items-center justify-center h-64 text-muted-foreground"><AlertCircle className="w-5 h-5 mr-2" /> Keine Daten verfügbar</div>;

  const revDelta = data.prevRevenue ? ((data.revenue - data.prevRevenue) / Math.abs(data.prevRevenue)) * 100 : 0;
  const beDelta = data.prevBetriebsergebnis ? ((data.betriebsergebnis - data.prevBetriebsergebnis) / Math.abs(data.prevBetriebsergebnis)) * 100 : 0;

  const cashflowData = (data.cashflowChart ?? []).map((c: any) => ({
    month: getMonthShort(c.month), Zufluss: c.inflow, Abfluss: c.outflow, Kumulativ: c.cumulative,
  }));

  const revenueData = (data.monthlyRevenue ?? []).map((m: any) => ({
    month: getMonthShort(m.month), Umsatz: m.revenue,
  }));

  const dbData = (data.customerDB ?? []).map((c: any, i: number) => ({
    name: c.name, Umsatz: c.revenue, Kosten: c.costs, DB: c.db, color: COLORS[i % COLORS.length],
  }));

  const agingData = [
    { name: '<30 T', value: data.aging?.under30 ?? 0, fill: '#10b981' },
    { name: '30-60', value: data.aging?.under60 ?? 0, fill: '#f59e0b' },
    { name: '60-90', value: data.aging?.under90 ?? 0, fill: '#f97316' },
    { name: '>90 T', value: data.aging?.over90 ?? 0, fill: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {(data.alerts ?? []).length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((a: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
              a.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' :
              a.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {a.type === 'danger' ? <AlertCircle className="w-4 h-4 shrink-0" /> :
               a.type === 'warning' ? <AlertTriangle className="w-4 h-4 shrink-0" /> :
               <Info className="w-4 h-4 shrink-0" />}
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Top KPIs - Traffic Light System */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Umsatz" value={data.revenue ?? 0} format="currency" delta={revDelta} deltaLabel="Δ/VJ" icon={DollarSign} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard title="Betriebsergebnis" value={data.betriebsergebnis ?? 0} format="currency" delta={beDelta} deltaLabel="Δ/VJ" icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Rev/Mitarbeiter" value={`${Math.round(data.revenuePerEmployeeMonthly ?? 0).toLocaleString('de-DE')}€`} icon={Banknote} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Offene Posten" value={data.totalOpen ?? 0} format="currency" icon={Wallet} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Berater" value={data.totalEmployees ?? 0} icon={Users} iconColor="bg-cyan-50 text-cyan-600" />
        <KpiCard title="Kunden" value={data.activeCustomers ?? 0} icon={Target} iconColor="bg-pink-50 text-pink-600" />
      </div>

      {/* Gauges Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={data.avgUtilization ?? 0} label="Auslastung" color={data.avgUtilization >= 80 ? '#10b981' : data.avgUtilization >= 70 ? '#f59e0b' : '#ef4444'} size={100} />
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={data.billableRatio ?? 0} label="Billable Ratio" color="#1a9a8a" size={100} />
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={data.overallDBPercent ?? 0} label="Deckungsbeitrag" color="#34d399" size={100} />
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={data.personnelCostRatio ?? 0} maxValue={100} label="Personalkosten" color={data.personnelCostRatio <= 60 ? '#10b981' : data.personnelCostRatio <= 65 ? '#f59e0b' : '#ef4444'} size={100} />
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Liquidität</p>
          <p className="text-lg font-bold font-mono mt-1">{formatCurrency(data.currentLiquidity ?? 0)}</p>
          <p className={`text-[10px] font-semibold mt-0.5 ${(data.liquidityMonths ?? 0) > 6 ? 'text-emerald-600' : (data.liquidityMonths ?? 0) > 3 ? 'text-amber-600' : 'text-red-600'}`}>
            {(data.liquidityMonths ?? 0).toFixed(1)} Monate Reichweite
          </p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm text-center flex flex-col justify-center">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold">DSO</p>
          <p className="text-lg font-bold font-mono mt-1">{(data.avgDSO ?? 0).toFixed(0)} Tage</p>
          <p className={`text-[10px] font-semibold mt-0.5 ${(data.avgDSO ?? 0) < 30 ? 'text-emerald-600' : (data.avgDSO ?? 0) < 45 ? 'text-amber-600' : 'text-red-600'}`}>
            {(data.avgDSO ?? 0) < 30 ? '✅ Gut' : (data.avgDSO ?? 0) < 45 ? '⚠️ Akzeptabel' : '🔴 Zu hoch'}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Umsatzentwicklung {data.year}</h3>
            <Link href="/finanzen" className="text-xs text-primary hover:underline flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v ?? 0) / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                <Bar dataKey="Umsatz" fill="#1a9a8a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cashflow */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Cashflow & Liquidität</h3>
            <Link href="/finanzen" className="text-xs text-primary hover:underline flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={cashflowData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v ?? 0) / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                <Bar dataKey="Zufluss" fill="#34d399" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Abfluss" fill="#e8577a" radius={[4, 4, 0, 0]} />
                <Line dataKey="Kumulativ" stroke="#7c5cfc" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Echtkosten-DB */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Echtkosten-Deckungsbeitrag pro Kunde</h3>
            <Link href="/finanzen/deckungsbeitrag" className="text-xs text-primary hover:underline flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dbData} layout="vertical" margin={{ top: 5, right: 10, left: 50, bottom: 5 }}>
                <XAxis type="number" tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v ?? 0) / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tickLine={false} tick={{ fontSize: 10 }} width={45} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                <Bar dataKey="Umsatz" fill="#1a9a8a" radius={[0, 4, 4, 0]} stackId="a" />
                <Bar dataKey="DB" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offene Posten Aging */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Offene Posten – Aging-Analyse</h3>
            <Link href="/rechnungen" className="text-xs text-primary hover:underline flex items-center gap-1">Details <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="h-52 flex items-center justify-center">
            {agingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={agingData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75}
                    label={({ name, value }: any) => `${name}: ${formatCurrency(value)}`} labelLine={false} fontSize={10}>
                    {agingData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-sm">Keine offenen Posten</p>}
          </div>
        </div>
      </div>

      {/* Bottom: Bench + Top Customers + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bench */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2"><UserMinus className="w-4 h-4 text-amber-500" /> Bench ({data.benchCount ?? 0})</h3>
            <Link href="/hr" className="text-xs text-primary hover:underline flex items-center gap-1">HR <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {(data.benchEmployees ?? []).length > 0 ? (
            <div className="space-y-2">
              {data.benchEmployees.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <span className="text-xs font-medium">{e.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">{e.level ?? 'k.A.'}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground mt-2">
                Geschätzter Umsatzausfall: {formatCurrency((data.benchCount ?? 0) * (data.avgHourlyRate ?? 93) * 8 * 21)}/Monat
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 text-emerald-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-2" /> Alle Berater sind im Einsatz
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Top 5 Kunden</h3>
            <Link href="/sales" className="text-xs text-primary hover:underline flex items-center gap-1">Sales <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2">
            {(data.topCustomers ?? []).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: COLORS[i % COLORS.length] }}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">{c.name}</span>
                    <span className="text-xs font-mono font-semibold">{formatCurrency(c.revenue)}</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-1.5 mt-1">
                    <div className="h-1.5 rounded-full" style={{ width: `${Math.min(c.share, 100)}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Kundenkonzentration (HHI)</span>
              <span className={`font-semibold ${(data.hhi ?? 0) < 1500 ? 'text-emerald-600' : (data.hhi ?? 0) < 2500 ? 'text-amber-600' : 'text-red-600'}`}>
                {(data.hhi ?? 0).toFixed(0)} {(data.hhi ?? 0) < 1500 ? '(Diversifiziert)' : (data.hhi ?? 0) < 2500 ? '(Moderat)' : '(Konzentriert)'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Kennzahlen-Übersicht</h3>
          <div className="space-y-2.5">
            {[
              { label: 'Ø Stundensatz', value: `${(data.avgHourlyRate ?? 0).toFixed(0)}€`, status: (data.avgHourlyRate ?? 0) >= 100 ? 'green' : (data.avgHourlyRate ?? 0) >= 80 ? 'yellow' : 'red' },
              { label: 'Break-Even Auslastung', value: `${(data.breakEvenUtilization ?? 0).toFixed(0)}%`, status: (data.breakEvenUtilization ?? 0) < 65 ? 'green' : (data.breakEvenUtilization ?? 0) < 75 ? 'yellow' : 'red' },
              { label: 'Fluktuation', value: `${(data.fluctuation ?? 0).toFixed(1)}%`, status: (data.fluctuation ?? 0) < 10 ? 'green' : (data.fluctuation ?? 0) < 15 ? 'yellow' : 'red' },
              { label: 'Ø Kranktage/MA', value: `${(data.avgSickDaysPerEmployee ?? 0).toFixed(1)}`, status: (data.avgSickDaysPerEmployee ?? 0) < 10 ? 'green' : (data.avgSickDaysPerEmployee ?? 0) < 15 ? 'yellow' : 'red' },
              { label: 'Bench-Quote', value: `${(data.benchQuote ?? 0).toFixed(0)}%`, status: (data.benchQuote ?? 0) < 5 ? 'green' : (data.benchQuote ?? 0) < 15 ? 'yellow' : 'red' },
              { label: 'Rechnungen überfällig', value: `${data.overdueInvoices ?? 0}`, status: (data.overdueInvoices ?? 0) === 0 ? 'green' : (data.overdueInvoices ?? 0) < 3 ? 'yellow' : 'red' },
              { label: 'Aktive Projekte', value: `${data.activeProjects ?? 0}`, status: 'neutral' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold">{s.value}</span>
                  {s.status !== 'neutral' && (
                    <div className={`w-2 h-2 rounded-full ${s.status === 'green' ? 'bg-emerald-500' : s.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
