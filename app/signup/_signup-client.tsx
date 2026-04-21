'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Loader2, Building2, User, Mail, Lock, ChevronRight } from 'lucide-react';

type Step = 1 | 2;

export function SignupClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vatId, setVatId] = useState('');
  const [city, setCity] = useState('');

  function next() {
    if (!email || !password || !name) return toast.error('Bitte alle Felder ausfuellen.');
    if (password.length < 10) return toast.error('Passwort min. 10 Zeichen.');
    setStep(2);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return toast.error('Firmenname ist Pflicht.');
    setLoading(true);
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email, password, name, companyName,
          vatId: vatId || undefined,
          addressCity: city || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? 'Fehler');

      // Direkt einloggen
      const signin = await signIn('credentials', {
        redirect: false,
        email, password, tenantSlug: data.tenantSlug,
      });
      if (signin?.error) {
        toast.error('Account angelegt, Login fehlgeschlagen. Bitte manuell einloggen.');
        router.push('/login');
        return;
      }
      toast.success('Willkommen bei Kapazito!');
      router.push('/onboarding');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-teal-700">
            <span className="w-8 h-8 rounded-xl bg-teal-600 text-white grid place-items-center">K</span>
            Kapazito
          </div>
          <p className="text-sm text-slate-600 mt-2">
            14 Tage kostenlos · keine Kreditkarte · monatlich kuendbar
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <span className={step === 1 ? 'font-semibold text-teal-700' : ''}>1. Dein Account</span>
            <ChevronRight className="w-3 h-3" />
            <span className={step === 2 ? 'font-semibold text-teal-700' : ''}>2. Deine Firma</span>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <Field label="Dein Name" icon={<User className="w-4 h-4" />}>
                <input
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Max Mustermann"
                  className="flex-1 bg-transparent outline-none" autoComplete="name"
                />
              </Field>
              <Field label="E-Mail" icon={<Mail className="w-4 h-4" />}>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@deinefirma.de"
                  className="flex-1 bg-transparent outline-none" autoComplete="email"
                />
              </Field>
              <Field label="Passwort (min. 10 Zeichen)" icon={<Lock className="w-4 h-4" />}>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="flex-1 bg-transparent outline-none" autoComplete="new-password"
                />
              </Field>
              <button
                onClick={next}
                className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-sm font-medium shadow-sm inline-flex items-center justify-center gap-2"
              >
                Weiter <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field label="Firmenname" icon={<Building2 className="w-4 h-4" />}>
                <input
                  value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Deine Beratung GmbH" required
                  className="flex-1 bg-transparent outline-none"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="USt-ID (optional)">
                  <input
                    value={vatId} onChange={(e) => setVatId(e.target.value)}
                    placeholder="DE123456789"
                    className="flex-1 bg-transparent outline-none"
                  />
                </Field>
                <Field label="Stadt (optional)">
                  <input
                    value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="Berlin"
                    className="flex-1 bg-transparent outline-none"
                  />
                </Field>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)}
                        className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-sm font-medium">
                  Zurueck
                </button>
                <button
                  disabled={loading} type="submit"
                  className="flex-1 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white py-2.5 text-sm font-medium shadow-sm inline-flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Account anlegen
                </button>
              </div>
              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                Mit dem Anlegen akzeptierst du unsere AGB und bestaetigst, die Datenschutzerklaerung gelesen zu haben.
                Der Trial-Zeitraum laeuft 14 Tage, kein automatisches Abo.
              </p>
            </form>
          )}
        </div>

        <div className="text-center mt-4 text-sm text-slate-600">
          Bereits registriert? <Link href="/login" className="text-teal-700 font-medium">Anmelden</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600 mb-1 block">{label}</span>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent">
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        {children}
      </div>
    </label>
  );
}
