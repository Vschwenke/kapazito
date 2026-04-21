'use client';

// Rechnungs-Cockpit — Liste, Filter, Schnellaktionen.
// Eigentliche Mutation geht ueber die API-Routen unter /api/rechnungen.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileText, Search, Plus, Download, Mail, AlertTriangle,
  CheckCircle2, Clock, XCircle, Euro, Bot
} from 'lucide-react';

type InvoiceListItem = {
  id: string;
  invoiceNo: string;
  status: 'DRAFT' | 'OPEN' | 'SENT' | 'VIEWED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issueDate: string;
  dueDate: string;
  netAmount: string;
  vatAmount: string;
  grossAmount: string;
  paidAmount: string;
  currency: string;
  customer: { id: string; name: string; shortName: string | null };
};

const STATUS_LABELS: Record<InvoiceListItem['status'], { label: string; color: string; icon: any }> = {
  DRAFT:    { label: 'Entwurf',     color: 'bg-slate-100 text-slate-700',    icon: FileText },
  OPEN:     { label: 'Offen',       color: 'bg-amber-100 text-amber-700',    icon: Clock },
  SENT:     { label: 'Versendet',   color: 'bg-sky-100 text-sky-700',        icon: Mail },
  VIEWED:   { label: 'Angesehen',   color: 'bg-violet-100 text-violet-700',  icon: CheckCircle2 },
  PARTIAL:  { label: 'Teilbezahlt', color: 'bg-yellow-100 text-yellow-700',  icon: Euro },
  PAID:     { label: 'Bezahlt',     color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  OVERDUE:  { label: 'Ueberfaellig', color: 'bg-rose-100 text-rose-700',     icon: AlertTriangle },
  CANCELLED:{ label: 'Storniert',   color: 'bg-slate-100 text-slate-500',    icon: XCircle },
};

export function RechnungenClient() {
  const [items, setItems] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/rechnungen?limit=200');
      const data = await r.json();
      setItems(data.items ?? []);
    } catch (e) {
      toast.error('Rechnungen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((i) => {
      if (filter !== 'all' && i.status !== filter) return false;
      if (!q) return true;
      return (
        i.invoiceNo.toLowerCase().includes(q) ||
        i.customer.name.toLowerCase().includes(q)
      );
    });
  }, [items, search, filter]);

  const totals = useMemo(() => {
    const open  = items.filter((i) => ['OPEN','SENT','VIEWED','PARTIAL','OVERDUE'].includes(i.status)).reduce((s, i) => s + Number(i.grossAmount) - Number(i.paidAmount), 0);
    const paid  = items.filter((i) => i.status === 'PAID').reduce((s, i) => s + Number(i.grossAmount), 0);
    const overdue = items.filter((i) => i.status === 'OVERDUE').reduce((s, i) => s + Number(i.grossAmount) - Number(i.paidAmount), 0);
    return { open, paid, overdue, count: items.length };
  }, [items]);

  async function runReminders() {
    try {
      const r = await fetch('/api/rechnungen/reminders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ dryRun: false }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message ?? 'Fehler');
      toast.success(`${data.sent} Mahnungen erzeugt`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function downloadDatev() {
    const year = new Date().getFullYear();
    const from = `${year}-01-01`;
    const to = new Date().toISOString().slice(0, 10);
    window.open(`/api/rechnungen/datev?from=${from}&to=${to}`, '_blank');
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard label="Rechnungen gesamt" value={String(totals.count)} />
        <KpiCard label="Offen" value={fmt(totals.open)} intent="warning" />
        <KpiCard label="Ueberfaellig" value={fmt(totals.overdue)} intent="danger" />
        <KpiCard label="Bezahlt (YTD)" value={fmt(totals.paid)} intent="success" />
      </div>

      {/* Aktionen */}
      <div className="flex flex-wrap gap-2">
        <Link href="/rechnungen/abrechnen" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-medium shadow-sm transition">
          <Bot className="w-4 h-4" /> Abrechnen mit Kapi
        </Link>
        <Link href="/rechnungen/neu" className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm font-medium shadow-sm transition">
          <Plus className="w-4 h-4" /> Neue Rechnung
        </Link>
        <button onClick={runReminders} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm font-medium shadow-sm transition">
          <AlertTriangle className="w-4 h-4 text-amber-600" /> Mahnwesen starten
        </button>
        <button onClick={downloadDatev} className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm font-medium shadow-sm transition">
          <Download className="w-4 h-4" /> DATEV-Export
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechnungsnummer oder Kunde suchen..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'DRAFT', 'OPEN', 'SENT', 'OVERDUE', 'PAID'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${filter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {s === 'all' ? 'Alle' : STATUS_LABELS[s as InvoiceListItem['status']]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabelle */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nummer</th>
              <th className="text-left px-4 py-3 font-medium">Kunde</th>
              <th className="text-left px-4 py-3 font-medium">Datum</th>
              <th className="text-left px-4 py-3 font-medium">Faellig</th>
              <th className="text-right px-4 py-3 font-medium">Betrag</th>
              <th className="text-right px-4 py-3 font-medium">Offen</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">Lade Rechnungen...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-slate-500">
                Noch keine Rechnungen. Starte mit <Link href="/rechnungen/abrechnen" className="text-teal-600 font-medium">Kapis Abrechnungs-Assistent</Link>.
              </td></tr>
            ) : filtered.map((inv) => {
              const st = STATUS_LABELS[inv.status];
              const Icon = st.icon;
              const open = Number(inv.grossAmount) - Number(inv.paidAmount);
              return (
                <tr key={inv.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/rechnungen/${inv.id}`} className="text-teal-700 hover:underline">{inv.invoiceNo}</Link>
                  </td>
                  <td className="px-4 py-3">{inv.customer.name}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(inv.issueDate).toLocaleDateString('de-DE')}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(inv.dueDate).toLocaleDateString('de-DE')}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(Number(inv.grossAmount))}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{open > 0 ? fmt(open) : '–'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${st.color}`}>
                      <Icon className="w-3 h-3" /> {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <a href={`/api/rechnungen/${inv.id}/pdf`} target="_blank" rel="noopener" className="text-slate-600 hover:text-slate-900" title="PDF">
                      <FileText className="w-4 h-4 inline" />
                    </a>
                    <a href={`/api/rechnungen/${inv.id}/xml`} target="_blank" rel="noopener" className="text-slate-600 hover:text-slate-900" title="XRechnung XML">
                      <Download className="w-4 h-4 inline" />
                    </a>
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

function KpiCard({ label, value, intent }: { label: string; value: string; intent?: 'warning' | 'danger' | 'success' }) {
  const color =
    intent === 'danger'  ? 'text-rose-600' :
    intent === 'warning' ? 'text-amber-600' :
    intent === 'success' ? 'text-emerald-600' :
    'text-slate-900';
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-2xl font-semibold tabular-nums mt-2 ${color}`}>{value}</div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
