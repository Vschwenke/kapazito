'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Activity, Shield, Zap, Brain, Sparkles, Building2, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useSession() || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState(params?.get('tenant') ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-violet-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }
  if (status === 'authenticated') return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        tenantSlug: tenantSlug.trim() || undefined,
        redirect: false,
      });
      if (result?.error) {
        setError(
          tenantSlug
            ? 'Ungueltige Anmeldedaten oder Organisation nicht gefunden.'
            : 'Ungueltige Anmeldedaten. Falls du mehreren Organisationen angehoerst, gib den Slug an.'
        );
        return;
      }
      toast.success('Willkommen zurueck.');
      const redirect = params?.get('callbackUrl') ?? '/dashboard';
      router.replace(redirect);
    } catch {
      setError('Ein Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Linke Hero-Seite */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-violet-800" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-2xl tracking-tight block">Kapazito</span>
              <span className="text-teal-200/80 text-xs font-medium tracking-wide">
                DAS AGENTISCHE COCKPIT
              </span>
            </div>
          </div>
          <p className="text-teal-100 text-lg mt-4 max-w-md leading-relaxed">
            Auslastung, Finanzen, Rechnungen und ein KI-Agent, der handelt — nicht nur antwortet.
          </p>
        </div>

        <div className="relative space-y-6">
          {[
            { icon: Sparkles, title: 'Abrechnungs-Assistent', desc: 'Aus Stunden wird eine Rechnung in 30 Sekunden' },
            { icon: Brain, title: 'Kapi — dein agentischer Assistent', desc: 'Mahnen, versenden, Staffing vorschlagen — per Dialog' },
            { icon: Shield, title: 'DACH-konform', desc: 'XRechnung, ZUGFeRD, DATEV, GoBD, ArbZG-ready' },
            { icon: Zap, title: 'Dein Server, deine Daten', desc: 'Self-Hosted-fähig, EU-only, DSGVO-konform' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-teal-200/70 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative text-teal-300/40 text-xs">© 2026 Kapazito — Kapazitäten klar im Blick</p>
      </div>

      {/* Rechte Login-Seite */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Kapazito</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Willkommen zurueck</h1>
          <p className="text-slate-500 mb-8">Melde dich mit deinen Zugangsdaten an.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="E-Mail" icon={<Mail className="w-4 h-4" />}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="flex-1 bg-transparent outline-none" autoComplete="email"
              />
            </Field>
            <Field label="Passwort" icon={<Lock className="w-4 h-4" />}>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="flex-1 bg-transparent outline-none" autoComplete="current-password"
              />
            </Field>
            <Field label="Organisation / Slug (nur wenn mehrere)" icon={<Building2 className="w-4 h-4" />}>
              <input
                type="text" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)}
                placeholder="z.B. demo" className="flex-1 bg-transparent outline-none"
              />
            </Field>

            {error ? (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
            ) : null}

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Anmelden
            </button>
          </form>

          <div className="mt-6 text-center space-y-1">
            <p className="text-sm text-slate-600">
              Neu hier? <Link href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">14-Tage-Trial starten</Link>
            </p>
            <p className="text-xs text-slate-400">
              Passwort vergessen? <Link href="/forgot-password" className="underline hover:text-slate-600">Zuruecksetzen</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-500 transition-all shadow-sm">
        {icon ? <span className="text-slate-400">{icon}</span> : null}
        {children}
      </div>
    </label>
  );
}
