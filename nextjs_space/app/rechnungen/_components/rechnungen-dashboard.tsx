'use client';

import { useState, useEffect, useCallback } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency } from '@/lib/format';
import { Loader2, Receipt, DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#80D8C3', '#A19AD3'];
const STATUS_COLORS: Record<string, string> = { paid: '#10b981', partial: '#f59e0b', open: '#3b82f6', overdue: '#ef4444' };
const STATUS_LABELS: Record<string, string> = { paid: 'Bezahlt', partial: 'Teilweise', open: 'Offen', overdue: '\u00dcberf\u00e4llig' };

export function RechnungenDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rechnungen?year=2026${selectedCustomer ? `&customerId=${selectedCustomer}` : ''}`);
      setData(await res.json());
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedCustomer]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const statusData = Object.entries(data?.byStatus ?? {}).map(([k, v]: [string, any]) => ({
    name: STATUS_LABELS[k] ?? k,
    value: v ?? 0,
    fill: STATUS_COLORS[k] ?? '#999',
  }));

  const customerData = (data?.byCustomer ?? []).map((c: any, i: number) => ({
    name: c?.name ?? '',
    Rechnungsbetrag: c?.invoiced ?? 0,
    Bezahlt: c?.paid ?? 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 bg-card rounded-lg px-4 py-2.5 border border-border/50 shadow-sm">
        <span className="text-xs font-semibold text-muted-foreground">Kunde:</span>
        <button onClick={() => setSelectedCustomer('')}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${!selectedCustomer ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Alle</button>
        {(data?.customers ?? []).map((c: any) => (
          <button key={c?.id} onClick={() => setSelectedCustomer(c?.id ?? '')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${selectedCustomer === c?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {c?.shortName ?? c?.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Rechnungsbetrag" value={data?.totalInvoiced ?? 0} format="currency" icon={Receipt} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Bezahlt" value={data?.totalPaid ?? 0} format="currency" icon={CheckCircle2} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Offen" value={data?.totalOpen ?? 0} format="currency" icon={Clock} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard title="Rechnungen" value={(data?.invoices?.length ?? 0)} icon={Receipt} iconColor="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Rechnungen nach Kunden</h3>
          <div className="h-72">
            {customerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                  <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={50} />
                  <YAxis tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${((v??0)/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: any) => formatCurrency(v ?? 0)} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Rechnungsbetrag" fill="#60B5FF" radius={[4,4,0,0]} />
                  <Bar dataKey="Bezahlt" fill="#80D8C3" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">Status-\u00dcbersicht</h3>
          <div className="h-72">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                    label={({ name, value }: any) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {statusData.map((s: any, i: number) => <Cell key={i} fill={s?.fill ?? COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-muted-foreground text-sm pt-20">Keine Daten</p>}
          </div>
        </div>
      </div>

      {/* Invoice table */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Rechnungen</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border">
            <th className="text-left py-1.5 px-2">Nr.</th>
            <th className="text-left py-1.5 px-2">Kunde</th>
            <th className="text-left py-1.5 px-2">Datum</th>
            <th className="text-right py-1.5 px-2">Betrag</th>
            <th className="text-right py-1.5 px-2">Bezahlt</th>
            <th className="text-center py-1.5 px-2">Status</th>
          </tr></thead>
          <tbody>
            {(data?.invoices ?? []).map((inv: any) => (
              <tr key={inv?.id} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-mono font-medium">{inv?.invoiceNo}</td>
                <td className="py-1.5 px-2">{inv?.customer}</td>
                <td className="py-1.5 px-2">{inv?.issueDate ? new Date(inv.issueDate).toLocaleDateString('de-DE') : ''}</td>
                <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(inv?.totalAmount)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{formatCurrency(inv?.paidAmount)}</td>
                <td className="text-center py-1.5 px-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold text-white`}
                    style={{ backgroundColor: STATUS_COLORS[inv?.status ?? ''] ?? '#999' }}>
                    {STATUS_LABELS[inv?.status ?? ''] ?? inv?.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Employee billing */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Mitarbeiter-Abrechnung</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border">
            <th className="text-left py-1.5 px-2">Mitarbeiter</th>
            <th className="text-left py-1.5 px-2">Kunde</th>
            <th className="text-right py-1.5 px-2">Gesamt Std.</th>
            <th className="text-right py-1.5 px-2">Abrechenbar</th>
            <th className="text-right py-1.5 px-2">Jan</th>
            <th className="text-right py-1.5 px-2">Feb</th>
            <th className="text-right py-1.5 px-2">M\u00e4r</th>
          </tr></thead>
          <tbody>
            {(data?.employeeBilling ?? []).map((eb: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-medium">{eb?.name}</td>
                <td className="py-1.5 px-2">{eb?.customer}</td>
                <td className="text-right py-1.5 px-2 font-mono">{Math.round(eb?.totalHours ?? 0)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{Math.round(eb?.billableHours ?? 0)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{Math.round(eb?.byMonth?.[1] ?? 0)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{Math.round(eb?.byMonth?.[2] ?? 0)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{Math.round(eb?.byMonth?.[3] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
