'use client';

import { useState, useEffect, useCallback } from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency } from '@/lib/format';
import { Loader2, Receipt, Users, Clock, Calendar } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = { paid: '#34d399', partial: '#f59e42', open: '#38bdf8', overdue: '#e8577a' };
const STATUS_LABELS: Record<string, string> = { paid: 'Bezahlt', partial: 'Teilweise', open: 'Offen', overdue: 'Überfällig' };

export function RechnungenDetailsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(0);

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

  const monthNames = ['Alle', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  
  const filteredBilling = selectedMonth > 0
    ? (data?.employeeBilling ?? []).filter((eb: any) => (eb?.byMonth?.[selectedMonth] ?? 0) > 0)
    : (data?.employeeBilling ?? []);

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
        <div className="w-px h-5 bg-border mx-1" />
        <span className="text-xs font-semibold text-muted-foreground">Monat:</span>
        {[0, 1, 2, 3].map((m: number) => (
          <button key={m} onClick={() => setSelectedMonth(m)}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${selectedMonth === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {monthNames[m]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Mitarbeiter" value={filteredBilling?.length ?? 0} icon={Users} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard title="Gesamt Stunden" value={Math.round(filteredBilling.reduce((s: number, e: any) => s + (e?.totalHours ?? 0), 0)).toLocaleString('de-DE')} icon={Clock} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Abrechenbare Std." value={Math.round(filteredBilling.reduce((s: number, e: any) => s + (e?.billableHours ?? 0), 0)).toLocaleString('de-DE')} icon={Receipt} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Rechnungen" value={data?.invoices?.length ?? 0} icon={Calendar} iconColor="bg-orange-50 text-orange-600" />
      </div>

      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-sm overflow-x-auto">
        <h3 className="text-sm font-semibold mb-3">Stundenerfassung Detail</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b border-border">
            <th className="text-left py-1.5 px-2">Mitarbeiter</th>
            <th className="text-left py-1.5 px-2">Kunde</th>
            <th className="text-right py-1.5 px-2">Gesamt Std.</th>
            <th className="text-right py-1.5 px-2">Abrechenbar</th>
            <th className="text-right py-1.5 px-2">Quote %</th>
            <th className="text-right py-1.5 px-2">Jan</th>
            <th className="text-right py-1.5 px-2">Feb</th>
            <th className="text-right py-1.5 px-2">Mär</th>
          </tr></thead>
          <tbody>
            {(filteredBilling ?? []).map((eb: any, i: number) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                <td className="py-1.5 px-2 font-medium">{eb?.name}</td>
                <td className="py-1.5 px-2">{eb?.customer}</td>
                <td className="text-right py-1.5 px-2 font-mono">{Math.round(eb?.totalHours ?? 0)}</td>
                <td className="text-right py-1.5 px-2 font-mono">{Math.round(eb?.billableHours ?? 0)}</td>
                <td className="text-right py-1.5 px-2 font-mono text-emerald-600">
                  {(eb?.totalHours ?? 0) > 0 ? `${((eb?.billableHours / eb?.totalHours) * 100).toFixed(1)}%` : '—'}
                </td>
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
