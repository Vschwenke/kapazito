'use client';

// Abrechnungs-Assistent — Zeit → Rechnungs-Entwurf in 30 Sekunden.
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

export function BillingAssistantClient() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [from, setFrom] = useState(firstOfMonth.toISOString().slice(0, 10));
  const [to, setTo] = useState(lastOfMonth.toISOString().slice(0, 10));
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/stammdaten/kunden').then((r) => r.json()).then((d) => setCustomers(d.items ?? d ?? []));
  }, []);

  async function create() {
    if (!selectedCustomer) return toast.error('Kunden auswaehlen');
    setCreating(true);
    try {
      const r = await fetch('/api/rechnungen/draft-from-times', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ customerId: selectedCustomer, from, to }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message ?? 'Fehler');
      toast.success(`Entwurf ${data.invoiceNo} erstellt`);
      router.push(`/rechnungen/${data.id}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-violet-600 p-2 text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Hallo, ich bin Kapi.</div>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Ich erstelle aus den <span className="font-medium">genehmigten Stundenbuchungen</span> im gewaehlten Zeitraum einen
              sauberen Rechnungsentwurf — mit korrekten Leistungszeitraeumen, USt-Saetzen und gruppiert pro Projekt.
              Du pruefst, klickst <span className="font-medium">Finalisieren</span> → ich erzeuge die XRechnung und du kannst sofort versenden.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Kunde</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Bitte Kunden waehlen...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Zeitraum von</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Zeitraum bis</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>

        <button
          disabled={creating}
          onClick={create}
          className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2.5 text-sm font-medium shadow-sm transition inline-flex items-center justify-center gap-2"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Entwurf erzeugen
        </button>
      </div>

      <div className="text-xs text-slate-500 leading-relaxed">
        Tipp: Auch wenn du mehrere Kunden hast, rufst du das hier pro Kunde auf. Ich markiere die verwendeten Stundenbuchungen
        automatisch als <em>abgerechnet</em> — sie tauchen nicht ein zweites Mal auf.
      </div>
    </div>
  );
}
