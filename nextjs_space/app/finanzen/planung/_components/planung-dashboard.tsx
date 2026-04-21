'use client';

import { useState, useEffect } from 'react';
import { getMonthShort, formatCurrency, formatPercent } from '@/lib/format';
import { Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

export function PlanungDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Umsatz');

  useEffect(() => {
    fetch('/api/planung?year=2026')
      .then(r => r.json())
      .then(setData)
      .catch((e: any) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!data) return <div className="flex items-center justify-center h-64 text-muted-foreground"><AlertCircle className="w-5 h-5 mr-2" /> Keine Daten</div>;

  const categories = data?.categories ?? [];
  const planData = data?.planning?.[selectedCategory] ?? [];

  const chartData = (planData ?? []).map((p: any) => ({
    month: getMonthShort(p?.month ?? 0),
    Geplant: p?.planned ?? 0,
    IST: p?.actual ?? 0,
    Forecast: p?.forecast ?? 0,
  }));

  const isCurrencyCat = selectedCategory !== 'Auslastung';
  const fmt = (v: any) => isCurrencyCat ? formatCurrency(v ?? 0) : formatPercent(v ?? 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(categories ?? []).map((c: any) => (
          <button key={c} onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${selectedCategory === c ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">IST vs. Plan - {selectedCategory}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => isCurrencyCat ? `${((v ?? 0)/1000).toFixed(0)}K` : `${v ?? 0}%`} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => fmt(v)} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Geplant" fill="#1a9a8a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="IST" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Forecast-Trend - {selectedCategory}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => isCurrencyCat ? `${((v ?? 0)/1000).toFixed(0)}K` : `${v ?? 0}%`} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => fmt(v)} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Line dataKey="Geplant" stroke="#1a9a8a" strokeWidth={2} dot={{ r: 3 }} />
                <Line dataKey="IST" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line dataKey="Forecast" stroke="#f59e42" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Forecast table */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Forecast-IST Vergleich - {selectedCategory}</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 px-2">Monat</th>
              <th className="text-right py-1.5 px-2">Geplant</th>
              <th className="text-right py-1.5 px-2">IST</th>
              <th className="text-right py-1.5 px-2">Forecast</th>
              <th className="text-right py-1.5 px-2">Abweichung</th>
            </tr>
          </thead>
          <tbody>
            {(planData ?? []).map((p: any) => {
              const diff = (p?.actual ?? 0) > 0 ? ((p?.actual - p?.planned) / Math.max(Math.abs(p?.planned ?? 1), 1)) * 100 : null;
              return (
                <tr key={p?.month} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-1.5 px-2 font-medium">{getMonthShort(p?.month ?? 0)}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{fmt(p?.planned)}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{(p?.actual ?? 0) > 0 ? fmt(p?.actual) : '—'}</td>
                  <td className="text-right py-1.5 px-2 font-mono text-muted-foreground">{fmt(p?.forecast)}</td>
                  <td className={`text-right py-1.5 px-2 font-mono ${diff !== null ? (diff >= 0 ? 'text-emerald-600' : 'text-red-500') : ''}`}>
                    {diff !== null ? `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
