'use client';

import { useState, useEffect } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { GaugeChart } from '@/components/ui/gauge-chart';
import { formatCurrency, formatNumber, getMonthShort } from '@/lib/format';
import { Loader2, Users, Clock, AlertTriangle, Palmtree, Heart, DollarSign, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3'];

export function HrTeamDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hr?year=2026')
      .then(r => r.json())
      .then(setData)
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const expData = Object.entries(data?.byExperience ?? {}).map(([k, v]: [string, any]) => ({ name: k, value: v ?? 0 }));
  const contractData = Object.entries(data?.byContract ?? {}).map(([k, v]: [string, any]) => ({ name: k, value: v ?? 0 }));
  const monthlyData = (data?.monthlyData ?? []).map((m: any) => ({
    month: getMonthShort(m?.month ?? 0),
    Abrechenbar: m?.billable ?? 0,
    Zielstunden: m?.target ?? 0,
    Krank: (m?.sick ?? 0) * 8,
    Urlaub: (m?.vacation ?? 0) * 8,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Entwickler" value={data?.totalEmployees ?? 0} icon={Users} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Abrechenbare Std." value={formatNumber(data?.totalBillableHours ?? 0)} icon={Clock} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Fluktuation" value={`${(data?.fluctuation ?? 0).toFixed(1)}%`} icon={AlertTriangle} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Verl. Umsatz (Krank)" value={data?.sickCostEstimate ?? 0} format="currency" icon={Heart} iconColor="bg-pink-50 text-pink-600" />
        <KpiCard title="Krankheitstage" value={formatNumber(data?.totalSickDays ?? 0)} icon={Heart} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Urlaubstage" value={formatNumber(data?.totalVacationDays ?? 0)} icon={Palmtree} iconColor="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={data?.avgUtilization ?? 0} label="Auslastung" color="#10b981" />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm flex flex-col items-center">
          <GaugeChart value={data?.totalBillableHours > 0 ? ((data?.totalBillableHours / Math.max((data?.totalBillableHours + (data?.totalSickDays ?? 0) * 8), 1)) * 100) : 0} label="Abrechenbare Std. %" color="#60B5FF" />
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm text-center">
          <p className="text-xs text-muted-foreground uppercase font-semibold">\u00d8 Monatseinkommen</p>
          <p className="text-2xl font-bold font-mono mt-3">{formatCurrency(data?.avgMonthlyIncome ?? 0)}</p>
          <DollarSign className="w-5 h-5 mx-auto mt-2 text-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Stunden und Abwesenheiten</h3>
          <div className="h-72">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Abrechenbar" fill="#60B5FF" radius={[4,4,0,0]} />
                  <Bar dataKey="Krank" fill="#FF9898" radius={[4,4,0,0]} />
                  <Bar dataKey="Urlaub" fill="#FF90BB" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Erfahrung</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} fontSize={10}
                    label={({ name, value }: any) => `${name}: ${value}`} labelLine={false}>
                    {expData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Vertragsart</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={contractData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={65} fontSize={10}
                    label={({ name, value }: any) => `${name}: ${value}`} labelLine={false}>
                    {contractData.map((_: any, i: number) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
