'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, Shield, Zap, Brain } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
        setError('Ung\u00fcltige Anmeldedaten');
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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white text-xl">PB</div>
            <span className="text-white font-bold text-2xl tracking-tight">PulseBI</span>
          </div>
          <p className="text-blue-200 text-lg mt-1">Business Intelligence f\u00fcr IT-Dienstleister</p>
        </div>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-semibold">Echtzeit-Dashboards</p>
              <p className="text-blue-200 text-sm">Finanzen, HR, Sales und Rechnungen auf einen Blick</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-semibold">KI-Assistenten</p>
              <p className="text-blue-200 text-sm">Intelligente Analyse und Handlungsempfehlungen per Chat</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-semibold">Eigene Datenhoheit</p>
              <p className="text-blue-200 text-sm">Ihre Daten geh\u00f6ren Ihnen \u2013 keine Abh\u00e4ngigkeiten</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white font-semibold">Sofort einsatzbereit</p>
              <p className="text-blue-200 text-sm">CSV-Upload, Zeiterfassung und Rechnungen inklusive</p>
            </div>
          </div>
        </div>

        <p className="text-blue-300/60 text-xs">\u00a9 2026 PulseBI \u2013 Made for IT Service Companies</p>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white">PB</div>
            <span className="font-bold text-xl tracking-tight">PulseBI</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {isLogin ? 'Willkommen zur\u00fcck' : 'Account erstellen'}
          </h1>
          <p className="text-slate-500 mb-8">
            {isLogin ? 'Melden Sie sich an, um auf Ihre Dashboards zuzugreifen' : 'Registrieren Sie sich f\u00fcr PulseBI'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900"
                  placeholder="Ihr Name"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900"
                placeholder="name@firma.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-slate-900"
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Anmelden' : 'Registrieren'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? 'Noch kein Account? Jetzt registrieren' : 'Bereits registriert? Anmelden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
