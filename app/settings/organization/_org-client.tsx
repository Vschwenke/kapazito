'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Save, Building2, Landmark, Receipt, Globe } from 'lucide-react';

export function OrgSettingsClient() {
  const [t, setT] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch('/api/settings/organization');
    setT(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch('/api/settings/organization', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: t.name, legalName: t.legalName, vatId: t.vatId, taxId: t.taxId,
          addressStreet: t.addressStreet, addressZip: t.addressZip, addressCity: t.addressCity,
          addressCountry: t.addressCountry, iban: t.iban, bic: t.bic, bankName: t.bankName,
          datevClientNo: t.datevClientNo,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message ?? 'Fehler');
      toast.success('Gespeichert.');
      setT(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!t) return <div className="text-slate-500">Lade...</div>;
  const setField = (k: string) => (e: any) => setT({ ...t, [k]: e.target.value });

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <Section title="Allgemein" icon={<Building2 className="w-4 h-4" />}>
        <Row label="Firmenname (Anzeige)"><input value={t.name ?? ''} onChange={setField('name')} className={input} required /></Row>
        <Row label="Rechtlicher Name"><input value={t.legalName ?? ''} onChange={setField('legalName')} className={input} /></Row>
        <div className="grid grid-cols-2 gap-3">
          <Row label="Slug (nicht aenderbar)"><input value={t.slug ?? ''} disabled className={inputDisabled} /></Row>
          <Row label="Plan"><input value={t.plan ?? ''} disabled className={inputDisabled} /></Row>
        </div>
      </Section>

      <Section title="Adresse & Steuer" icon={<Receipt className="w-4 h-4" />}>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><Row label="Strasse + Nr"><input value={t.addressStreet ?? ''} onChange={setField('addressStreet')} className={input} /></Row></div>
          <Row label="PLZ"><input value={t.addressZip ?? ''} onChange={setField('addressZip')} className={input} /></Row>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><Row label="Ort"><input value={t.addressCity ?? ''} onChange={setField('addressCity')} className={input} /></Row></div>
          <Row label="Land"><input value={t.addressCountry ?? ''} onChange={setField('addressCountry')} className={input} maxLength={2} /></Row>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Row label="USt-ID"><input value={t.vatId ?? ''} onChange={setField('vatId')} className={input} placeholder="DE123456789" /></Row>
          <Row label="Steuernummer"><input value={t.taxId ?? ''} onChange={setField('taxId')} className={input} /></Row>
        </div>
      </Section>

      <Section title="Bankverbindung (fuer Rechnungen)" icon={<Landmark className="w-4 h-4" />}>
        <Row label="IBAN"><input value={t.iban ?? ''} onChange={setField('iban')} className={input} placeholder="DE89 3704 ..." /></Row>
        <div className="grid grid-cols-2 gap-3">
          <Row label="BIC"><input value={t.bic ?? ''} onChange={setField('bic')} className={input} /></Row>
          <Row label="Bankname"><input value={t.bankName ?? ''} onChange={setField('bankName')} className={input} /></Row>
        </div>
      </Section>

      <Section title="DATEV-Integration" icon={<Globe className="w-4 h-4" />}>
        <Row label="DATEV-Mandantennummer"><input value={t.datevClientNo ?? ''} onChange={setField('datevClientNo')} className={input} /></Row>
      </Section>

      <div className="flex justify-end">
        <button disabled={saving} className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-5 py-2.5 text-sm font-medium shadow-sm inline-flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Speichern
        </button>
      </div>
    </form>
  );
}

const input = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';
const inputDisabled = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500';

function Section({ title, icon, children }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4 font-semibold text-slate-900">{icon}{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Row({ label, children }: any) {
  return <label className="block"><span className="text-xs text-slate-600 mb-1 block">{label}</span>{children}</label>;
}
