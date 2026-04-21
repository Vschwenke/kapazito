'use client';

// Onboarding-Wizard — 5 Schritte von ganz leer zu "erste Zeit erfasst".
// Jeder Schritt ist skippbar. Der Wizard merkt sich den Stand in localStorage,
// sodass ein Refresh/Abschluss spaeter weiterfuehrt.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Loader2, Rocket, Building2, UserPlus, Users, Briefcase, Timer, ChevronRight, Check, SkipForward, Sparkles,
} from 'lucide-react';

type Step = 0 | 1 | 2 | 3 | 4;
const STORAGE = 'kapazito.onboarding.step';

const STEPS = [
  { key: 0, title: 'Willkommen',       icon: Rocket,    help: 'Kurzer Rundgang — 5 Minuten, du bist produktiv.' },
  { key: 1, title: 'Firmendaten',      icon: Building2, help: 'IBAN + USt-ID stehen auf jeder Rechnung. Jetzt setzen.' },
  { key: 2, title: 'Mitarbeiter',      icon: UserPlus,  help: 'Lege dich oder den ersten Mitarbeiter an.' },
  { key: 3, title: 'Erster Kunde',     icon: Users,     help: 'Wem stellst du Rechnungen?' },
  { key: 4, title: 'Erstes Projekt',   icon: Briefcase, help: 'Dein erster Auftrag — mit Stundensatz.' },
] as const;

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);

  // Firmendaten (Step 1)
  const [org, setOrg] = useState<any>(null);

  // Mitarbeiter (Step 2)
  const [empFirst, setEmpFirst] = useState('');
  const [empLast, setEmpLast] = useState('');
  const [empLevel, setEmpLevel] = useState('Mid');

  // Kunde (Step 3)
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custCity, setCustCity] = useState('');

  // Projekt (Step 4)
  const [projName, setProjName] = useState('');
  const [projRate, setProjRate] = useState('120');
  const [custId, setCustId] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE) : null;
    if (saved) setStep(Number(saved) as Step);
    fetch('/api/settings/organization').then((r) => r.json()).then(setOrg);
    fetch('/api/stammdaten/kunden').then((r) => r.json()).then((d) => setCustomers(d.items ?? d ?? []));
  }, []);

  useEffect(() => { localStorage.setItem(STORAGE, String(step)); }, [step]);

  const progress = useMemo(() => Math.round((step / (STEPS.length - 1)) * 100), [step]);

  async function saveOrg() {
    setLoading(true);
    try {
      const r = await fetch('/api/settings/organization', {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(org),
      });
      if (!r.ok) throw new Error('Fehler beim Speichern');
      toast.success('Firmendaten gespeichert.');
      next();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  async function saveEmployee() {
    if (!empFirst || !empLast) return toast.error('Vor- und Nachname Pflicht.');
    setLoading(true);
    try {
      const r = await fetch('/api/stammdaten/mitarbeiter', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ firstName: empFirst, lastName: empLast, experienceLevel: empLevel, weeklyHours: 40 }),
      });
      if (!r.ok) throw new Error('Mitarbeiter konnte nicht angelegt werden.');
      toast.success('Mitarbeiter angelegt.');
      next();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  async function saveCustomer() {
    if (!custName) return toast.error('Kundenname Pflicht.');
    setLoading(true);
    try {
      const r = await fetch('/api/stammdaten/kunden', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: custName, contactEmail: custEmail || undefined, addressCity: custCity || undefined, paymentTerms: 14 }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error('Kunde konnte nicht angelegt werden.');
      setCustId(data.id);
      setCustomers([data, ...customers]);
      toast.success('Kunde angelegt.');
      next();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  async function saveProject() {
    const cid = custId || customers[0]?.id;
    if (!cid) return toast.error('Kein Kunde vorhanden — bitte Schritt 3 nicht ueberspringen.');
    if (!projName) return toast.error('Projektname Pflicht.');
    setLoading(true);
    try {
      const r = await fetch('/api/stammdaten/projekte', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: projName, customerId: cid, hourlyRate: Number(projRate), billingMode: 'TIME_AND_MATERIAL' }),
      });
      if (!r.ok) throw new Error('Projekt konnte nicht angelegt werden.');
      toast.success('Projekt angelegt.');
      finishOnboarding();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }

  function next() { setStep((s) => Math.min(4, (s + 1)) as Step); }
  function prev() { setStep((s) => Math.max(0, (s - 1)) as Step); }
  function skip() { next(); }
  function finishOnboarding() {
    localStorage.removeItem(STORAGE);
    toast.success('Onboarding abgeschlossen — willkommen!');
    router.push('/dashboard');
  }

  const CurrentIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-4 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-medium">Schritt {step + 1} von {STEPS.length}</span>
            <button onClick={() => finishOnboarding()} className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
              <SkipForward className="w-3 h-3" /> Onboarding abbrechen
            </button>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Steps Nav */}
        <div className="hidden md:flex gap-1 mb-6">
          {STEPS.map((s, i) => (
            <div key={s.key} className={`flex-1 rounded-xl border p-3 text-xs ${i === step ? 'bg-teal-50 border-teal-200 text-teal-900' : i < step ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
              <div className="flex items-center gap-2">
                {i < step ? <Check className="w-3 h-3 text-emerald-600" /> : <s.icon className="w-3 h-3" />}
                <span className="font-medium">{s.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 grid place-items-center"><CurrentIcon className="w-5 h-5" /></div>
            <div>
              <h1 className="text-xl font-semibold">{STEPS[step].title}</h1>
              <p className="text-sm text-slate-600">{STEPS[step].help}</p>
            </div>
          </div>

          {step === 0 && (
            <div className="space-y-4 text-slate-700">
              <p className="leading-relaxed">
                Kapazito ist dein Cockpit aus Zeiten, Projekten, Rechnungen und Controlling — mit Kapi als handelndem
                KI-Assistenten. In den naechsten 4 kurzen Schritten haben wir alles zusammen, was du fuer deine erste
                Rechnung brauchst.
              </p>
              <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 text-sm">
                <div className="font-semibold text-violet-900 mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Kapi, dein Copilot</div>
                <p className="text-violet-900/80">
                  Unten rechts findest du das Chat-Widget — frag Kapi jederzeit "Wie rechne ich April ab?" oder
                  "Zeig mir ueberfaellige Rechnungen". Er handelt fuer dich.
                </p>
              </div>
              <NavButtons onNext={next} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <Row label="Firmenname"><input value={org?.name ?? ''} onChange={(e) => setOrg({ ...org, name: e.target.value })} className={input} /></Row>
              <Row label="Rechtlicher Name"><input value={org?.legalName ?? ''} onChange={(e) => setOrg({ ...org, legalName: e.target.value })} className={input} /></Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="USt-ID"><input value={org?.vatId ?? ''} onChange={(e) => setOrg({ ...org, vatId: e.target.value })} className={input} placeholder="DE123456789" /></Row>
                <Row label="Steuernummer"><input value={org?.taxId ?? ''} onChange={(e) => setOrg({ ...org, taxId: e.target.value })} className={input} /></Row>
              </div>
              <Row label="IBAN"><input value={org?.iban ?? ''} onChange={(e) => setOrg({ ...org, iban: e.target.value })} className={input} placeholder="DE89 3704 …" /></Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="BIC"><input value={org?.bic ?? ''} onChange={(e) => setOrg({ ...org, bic: e.target.value })} className={input} /></Row>
                <Row label="Bankname"><input value={org?.bankName ?? ''} onChange={(e) => setOrg({ ...org, bankName: e.target.value })} className={input} /></Row>
              </div>
              <NavButtons onPrev={prev} onSkip={skip} onNext={saveOrg} loading={loading} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Row label="Vorname"><input value={empFirst} onChange={(e) => setEmpFirst(e.target.value)} className={input} /></Row>
                <Row label="Nachname"><input value={empLast} onChange={(e) => setEmpLast(e.target.value)} className={input} /></Row>
              </div>
              <Row label="Level">
                <select value={empLevel} onChange={(e) => setEmpLevel(e.target.value)} className={input}>
                  {['Junior', 'Mid', 'Senior', 'Lead'].map((l) => <option key={l}>{l}</option>)}
                </select>
              </Row>
              <NavButtons onPrev={prev} onSkip={skip} onNext={saveEmployee} loading={loading} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Row label="Kundenname"><input value={custName} onChange={(e) => setCustName(e.target.value)} className={input} placeholder="Musterbank AG" /></Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Kontakt-E-Mail"><input value={custEmail} onChange={(e) => setCustEmail(e.target.value)} className={input} placeholder="kontakt@…"/></Row>
                <Row label="Stadt"><input value={custCity} onChange={(e) => setCustCity(e.target.value)} className={input} /></Row>
              </div>
              <NavButtons onPrev={prev} onSkip={skip} onNext={saveCustomer} loading={loading} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <Row label="Projektname"><input value={projName} onChange={(e) => setProjName(e.target.value)} className={input} placeholder="Core-Banking-Modernisierung" /></Row>
              <div className="grid grid-cols-2 gap-3">
                <Row label="Kunde">
                  <select value={custId || customers[0]?.id || ''} onChange={(e) => setCustId(e.target.value)} className={input}>
                    {customers.length === 0 ? <option value="">Keine Kunden — Schritt 3!</option> : null}
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Row>
                <Row label="Stundensatz (EUR)"><input type="number" value={projRate} onChange={(e) => setProjRate(e.target.value)} className={input} /></Row>
              </div>
              <NavButtons onPrev={prev} onNext={saveProject} loading={loading} submitLabel="Fertig, ab ins Dashboard" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const input = 'w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500';

function Row({ label, children }: any) {
  return <label className="block"><span className="text-xs font-medium text-slate-600 mb-1 block">{label}</span>{children}</label>;
}

function NavButtons({ onPrev, onNext, onSkip, loading, submitLabel }: { onPrev?: () => void; onNext: () => void; onSkip?: () => void; loading?: boolean; submitLabel?: string }) {
  return (
    <div className="flex justify-between items-center pt-4">
      <div>
        {onPrev && (
          <button onClick={onPrev} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2">
            Zurueck
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {onSkip && (
          <button onClick={onSkip} className="text-sm text-slate-500 hover:text-slate-900 px-3 py-2 inline-flex items-center gap-1">
            <SkipForward className="w-3 h-3" /> Ueberspringen
          </button>
        )}
        <button
          disabled={loading}
          onClick={onNext}
          className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-4 py-2 text-sm font-medium inline-flex items-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitLabel ?? 'Weiter'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
