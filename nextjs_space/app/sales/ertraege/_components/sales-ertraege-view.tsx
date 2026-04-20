'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/format';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1a9a8a', '#7c5cfc', '#f59e42', '#e8577a', '#38bdf8', '#34d399'];

export function SalesErtraegeView() {
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

  const customerData = (data?.revenueByCustomer ?? []).map((c: any) => ({
    name: c?.name ?? '',
    Umsatz: c?.revenue ?? 0,
    Stunden: c?.hours ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Ertr\u00e4ge nach Kunden</h3>
        <div className="h-80">
          {customerData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={50} />
                <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Umsatz" fill="#1a9a8a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Ertr\u00e4ge Detail</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border">
            <th className="text-left py-1.5 px-2">Kunde</th>
            <th className="text-right py-1.5 px-2">Umsatz</th>
            <th className="text-right py-1.5 px-2">Stunden</th>
            <th className="text-right py-1.5 px-2">\u00d8 Stundensatz</th>
            <th className="text-right py-1.5 px-2">Anteil</th>
          </tr></thead>
          <tbody>
            {customerData.map((c: any, i: number) => {
              const total = customerData.reduce((s: number, x: any) => s + (x?.Umsatz ?? 0), 0);
              return (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-1.5 px-2 font-medium">{c?.name}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(c?.Umsatz)}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{(c?.Stunden ?? 0).toLocaleString('de-DE')}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{c?.Stunden > 0 ? `${(c?.Umsatz / c?.Stunden).toFixed(0)}\u20ac` : '\u2014'}</td>
                  <td className="text-right py-1.5 px-2 font-mono">{total > 0 ? `${((c?.Umsatz / total) * 100).toFixed(1)}%` : '\u2014'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
