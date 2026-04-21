'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Loader2, Activity, User, Lock, CheckCircle2 } from 'lucide-react';

export function AcceptInviteClient({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  async function accept(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return toast.error('Kein Einladungstoken in URL.');
    setLoading(true);
    try {
      const r = await fetch('/api/invite/accept', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, name: name || undefined, password: password || undefined }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error?.message ?? 'Fehler');

      // Direkt einloggen
      const si = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password,
        tenantSlug: data.tenantSlug,
      });
      if (si?.error) {
        toast.success('Einladung angenommen — bitte einloggen.');
        router.push(`/login?tenant=${data.tenantSlug}`);
      } else {
        toast.success('Willkommen an Bord.');
        router.push('/onboarding');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-rose-600">Kein gueltiger Einladungslink.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-teal-700">
            <span className="w-8 h-8 rounded-xl bg-teal-600 text-white grid place-items-center">K</span>
            Kapazito
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="text-center mb-5">
            <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-3" />
            <h1 className="text-xl font-semibold">Du wurdest eingeladen</h1>
            <p className="text-sm text-slate-600 mt-1">
              Falls du schon einen Kapazito-Account hast, lass die Felder leer — wir verknuepfen dich direkt.
              Ansonsten bitte Name + Passwort setzen.
            </p>
          </div>

          <form onSubmit={accept} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600 mb-1 block">Name (fuer neuen Account)</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                <User className="w-4 h-4 text-slate-400" />
                <input value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="Max Mustermann" />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600 mb-1 block">Passwort (nur wenn neuer Account)</span>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white">
                <Lock className="w-4 h-4 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 bg-transparent outline-none" placeholder="••••••••••" />
              </div>
            </label>
            <button disabled={loading} className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-sm font-medium disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Einladung annehmen
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
