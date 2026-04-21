'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Activity, Shield, Zap, Brain, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession() || {};

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/finanzen');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-violet-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (status === 'authenticated') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Registrierung fehlgeschlagen');
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Ungültige Anmeldedaten');
        setLoading(false);
        return;
      }

      router.replace('/finanzen');
    } catch (err: any) {
      setError('Ein Fehler ist aufgetreten');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-violet-800" />
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full bg-violet-500/10" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-black/10">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-2xl tracking-tight block">Kapazito</span>
              <span className="text-teal-200/80 text-xs font-medium tracking-wide">KAPAZITÄTS-COCKPIT</span>
            </div>
          </div>
          <p className="text-teal-100 text-lg mt-4 max-w-md leading-relaxed">
            Dein intelligentes Cockpit für Auslastung, Finanzen und Team-Performance.
          </p>
        </div>

        <div className="relative space-y-6">
          {[
            { icon: Sparkles, title: 'Echtzeit-Dashboards', desc: 'Finanzen, HR, Sales und Rechnungen – alles auf einen Blick' },
            { icon: Brain, title: 'KI-Assistenten', desc: 'Intelligente Analyse und Handlungsempfehlungen per Chat' },
            { icon: Shield, title: 'Eigene Datenhoheit', desc: 'Ihre Daten gehören Ihnen – keine Abhängigkeiten' },
            { icon: Zap, title: 'Sofort einsatzbereit', desc: 'CSV-Upload, Zeiterfassung und Rechnungen inklusive' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white/15 transition-colors">
                <item.icon className="w-5 h-5 text-teal-200" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-teal-200/70 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="relative text-teal-300/40 text-xs">© 2026 Kapazito – Kapazitäten klar im Blick</p>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-600/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Kapazito</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {isLogin ? 'Willkommen zurück' : 'Account erstellen'}
          </h1>
          <p className="text-slate-500 mb-8">
            {isLogin ? 'Melden Sie sich an, um auf Ihre Dashboards zuzugreifen' : 'Registrieren Sie sich für Kapazito'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all bg-white text-slate-900 shadow-sm"
                  placeholder="Ihr Name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all bg-white text-slate-900 shadow-sm"
                placeholder="name@firma.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all bg-white text-slate-900 shadow-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 hover:shadow-teal-700/25"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Anmelden' : 'Registrieren'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              {isLogin ? 'Noch kein Account? Jetzt registrieren' : 'Bereits registriert? Anmelden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
