'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Bot, Loader2 } from 'lucide-react';

type Action = {
  id: string;
  agent: string;
  toolName: string;
  input: any;
  status: 'PENDING' | 'APPROVED' | 'EXECUTED' | 'REJECTED' | 'FAILED';
  createdAt: string;
};

const TOOL_LABELS: Record<string, string> = {
  createDraftFromTimes: 'Rechnungs-Entwurf aus Zeiten erstellen',
  sendInvoice: 'Rechnung per E-Mail versenden',
  runReminders: 'Mahnwesen-Durchlauf starten',
  exportDatev: 'DATEV-Export erzeugen',
  registerPayment: 'Zahlung registrieren',
};

export function ApprovalQueue() {
  const [actions, setActions] = useState<Action[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const r = await fetch('/api/kapi/actions?status=PENDING');
    const d = await r.json();
    setActions(d.items ?? []);
  }
  useEffect(() => { load(); }, []);

  async function approve(id: string) {
    setBusy(id);
    try {
      const r = await fetch(`/api/kapi/actions/${id}/approve`, { method: 'POST' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message ?? 'Fehler');
      toast.success('Aktion ausgefuehrt');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  }
  async function reject(id: string) {
    setBusy(id);
    try {
      const r = await fetch(`/api/kapi/actions/${id}/reject`, { method: 'POST' });
      if (!r.ok) throw new Error('Fehler');
      toast.success('Abgelehnt');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  }

  if (actions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-violet-700" />
        <h3 className="font-semibold text-slate-900">Kapi wartet auf Freigabe ({actions.length})</h3>
      </div>
      <div className="space-y-2">
        {actions.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 bg-white rounded-xl border border-violet-100 p-3">
            <div className="flex-1">
              <div className="font-medium text-sm">{TOOL_LABELS[a.toolName] ?? a.toolName}</div>
              <div className="text-xs text-slate-600 mt-0.5 font-mono">
                {JSON.stringify(a.input)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{new Date(a.createdAt).toLocaleString('de-DE')}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                disabled={busy === a.id}
                onClick={() => approve(a.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium disabled:opacity-60"
              >
                {busy === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Freigeben
              </button>
              <button
                disabled={busy === a.id}
                onClick={() => reject(a.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-medium disabled:opacity-60"
              >
                <XCircle className="w-3 h-3" /> Ablehnen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
