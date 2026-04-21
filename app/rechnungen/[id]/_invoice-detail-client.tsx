'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FileText, Download, Mail, CheckCircle2, Euro, AlertTriangle, ArrowLeft, Send,
} from 'lucide-react';

export function InvoiceDetailClient({ id }: { id: string }) {
  const [inv, setInv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/rechnungen/${id}`);
    if (r.ok) setInv(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, [id]);

  async function finalize() {
    const r = await fetch(`/api/rechnungen/${id}/finalize`, { method: 'POST' });
    if (r.ok) { toast.success('Rechnung finalisiert'); load(); }
    else toast.error('Fehler beim Finalisieren');
  }

  async function sendEmail() {
    const to = prompt('E-Mail-Empfaenger?', inv?.customer?.contactEmail ?? '');
    if (!to) return;
    const r = await fetch(`/api/rechnungen/${id}/send`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ to, includeXml: true }),
    });
    const data = await r.json();
    if (r.ok) { toast.success(data.sent ? 'Versendet' : 'Im Dev-Modus — check Logs'); load(); }
    else toast.error(data.error?.message ?? 'Fehler');
  }

  async function registerPayment() {
    const raw = prompt('Zahlbetrag in EUR');
    if (!raw) return;
    const amount = Number(raw.replace(',', '.'));
    if (!amount || amount <= 0) return toast.error('Ungueltig');
    const r = await fetch(`/api/rechnungen/${id}/payments`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (r.ok) { toast.success('Zahlung erfasst'); load(); }
    else toast.error('Fehler');
  }

  if (loading || !inv) return <div className="p-8 text-center text-slate-500">Lade...</div>;

  const open = Number(inv.grossAmount) - Number(inv.paidAmount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/rechnungen" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Zurueck
        </Link>
        <div className="flex gap-2">
          {inv.status === 'DRAFT' && (
            <button onClick={finalize} className="px-3 py-1.5 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Finalisieren
            </button>
          )}
          {['OPEN','SENT','VIEWED','PARTIAL','OVERDUE'].includes(inv.status) && (
            <button onClick={sendEmail} className="px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1">
              <Send className="w-4 h-4" /> Versenden
            </button>
          )}
          <a href={`/api/rechnungen/${id}/pdf`} target="_blank" rel="noopener" className="px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1">
            <FileText className="w-4 h-4" /> PDF
          </a>
          <a href={`/api/rechnungen/${id}/xml`} target="_blank" rel="noopener" className="px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1">
            <Download className="w-4 h-4" /> XRechnung
          </a>
          {['OPEN','SENT','VIEWED','PARTIAL','OVERDUE'].includes(inv.status) && (
            <button onClick={registerPayment} className="px-3 py-1.5 text-sm rounded-lg bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1">
              <Euro className="w-4 h-4" /> Zahlung erfassen
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard label="Rechnungsnummer" value={inv.invoiceNo} />
        <InfoCard label="Status" value={inv.status} />
        <InfoCard label="Offen" value={fmt(open)} highlight={open > 0} />
        <InfoCard label="Kunde" value={inv.customer.name} />
        <InfoCard label="Rechnungsdatum" value={new Date(inv.issueDate).toLocaleDateString('de-DE')} />
        <InfoCard label="Faellig bis" value={new Date(inv.dueDate).toLocaleDateString('de-DE')} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 font-medium">Positionen</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Pos</th>
              <th className="text-left px-4 py-2">Leistung</th>
              <th className="text-right px-4 py-2">Menge</th>
              <th className="text-right px-4 py-2">Preis</th>
              <th className="text-right px-4 py-2">USt %</th>
              <th className="text-right px-4 py-2">Netto</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it: any) => (
              <tr key={it.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{it.position}</td>
                <td className="px-4 py-2">
                  {it.description}
                  {it.servicePeriodFrom && it.servicePeriodTo && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(it.servicePeriodFrom).toLocaleDateString('de-DE')} – {new Date(it.servicePeriodTo).toLocaleDateString('de-DE')}
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-right tabular-nums">{Number(it.quantity)} {it.unit}</td>
                <td className="px-4 py-2 text-right tabular-nums">{fmt(Number(it.unitPrice))}</td>
                <td className="px-4 py-2 text-right">{Number(it.vatRate)}</td>
                <td className="px-4 py-2 text-right tabular-nums">{fmt(Number(it.netAmount))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50">
            <tr><td colSpan={5} className="text-right px-4 py-2 text-slate-600">Netto</td><td className="text-right px-4 py-2 tabular-nums">{fmt(Number(inv.netAmount))}</td></tr>
            <tr><td colSpan={5} className="text-right px-4 py-2 text-slate-600">Umsatzsteuer</td><td className="text-right px-4 py-2 tabular-nums">{fmt(Number(inv.vatAmount))}</td></tr>
            <tr><td colSpan={5} className="text-right px-4 py-2 font-semibold">Gesamt</td><td className="text-right px-4 py-2 font-semibold tabular-nums">{fmt(Number(inv.grossAmount))}</td></tr>
          </tfoot>
        </table>
      </div>

      {inv.payments?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-3 border-b border-slate-100 font-medium">Zahlungen</div>
          <table className="w-full text-sm">
            <tbody>
              {inv.payments.map((p: any) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">{new Date(p.receivedAt).toLocaleDateString('de-DE')}</td>
                  <td className="px-4 py-2 text-slate-600">{p.method ?? '–'}</td>
                  <td className="px-4 py-2 text-slate-600">{p.reference ?? '–'}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{fmt(Number(p.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {inv.reminders?.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="px-5 py-3 border-b border-amber-200 font-medium text-amber-800 inline-flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Mahnungen
          </div>
          <table className="w-full text-sm">
            <tbody>
              {inv.reminders.map((r: any) => (
                <tr key={r.id} className="border-t border-amber-100">
                  <td className="px-4 py-2">Stufe {r.level}</td>
                  <td className="px-4 py-2 text-slate-600">{new Date(r.sentAt).toLocaleDateString('de-DE')}</td>
                  <td className="px-4 py-2 text-right">Gebuehr {fmt(Number(r.fee))}</td>
                  <td className="px-4 py-2 text-right">Zinsen {fmt(Number(r.interest))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-semibold mt-1 ${highlight ? 'text-amber-600' : 'text-slate-900'}`}>{value}</div>
    </div>
  );
}

function fmt(n: number): string {
  return n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
