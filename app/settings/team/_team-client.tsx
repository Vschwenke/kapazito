'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserPlus, Trash2, Mail, Loader2, X } from 'lucide-react';

const ROLES = ['OWNER', 'ADMIN', 'FINANCE', 'MANAGER', 'MEMBER', 'GUEST'] as const;
type Role = typeof ROLES[number];

export function TeamSettingsClient() {
  const [data, setData] = useState<{ memberships: any[]; invitations: any[] } | null>(null);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('MEMBER');

  async function load() {
    const r = await fetch('/api/settings/team');
    setData(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const r = await fetch('/api/settings/team/invitations', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const resp = await r.json();
      if (!r.ok) throw new Error(resp.error?.message ?? 'Fehler');
      toast.success(`Einladung an ${inviteEmail} verschickt.`);
      setInviteEmail('');
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInviting(false);
    }
  }

  async function changeRole(id: string, role: Role) {
    try {
      const r = await fetch(`/api/settings/team/memberships/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const resp = await r.json();
      if (!r.ok) throw new Error(resp.error?.message ?? 'Fehler');
      toast.success('Rolle aktualisiert.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function removeMember(id: string) {
    if (!confirm('Mitglied wirklich entfernen?')) return;
    try {
      const r = await fetch(`/api/settings/team/memberships/${id}`, { method: 'DELETE' });
      const resp = await r.json();
      if (!r.ok) throw new Error(resp.error?.message ?? 'Fehler');
      toast.success('Entfernt.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  async function cancelInvite(id: string) {
    try {
      const r = await fetch(`/api/settings/team/invitations/${id}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Fehler');
      toast.success('Einladung zurueckgezogen.');
      load();
    } catch (e: any) { toast.error(e.message); }
  }

  if (!data) return <div className="text-slate-500">Lade...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <form onSubmit={sendInvite} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 font-semibold"><UserPlus className="w-4 h-4" /> Neue Einladung</div>
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="kollege@firma.de" required
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <select
            value={inviteRole} onChange={(e) => setInviteRole(e.target.value as Role)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
          >
            {ROLES.filter((r) => r !== 'OWNER').map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button disabled={inviting} className="rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-4 py-2 text-sm font-medium inline-flex items-center gap-2">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Einladen
          </button>
        </div>
        <p className="text-xs text-slate-500">Eingeladene Nutzer erhalten einen Link per E-Mail (7 Tage gueltig).</p>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 font-semibold">Mitglieder ({data.memberships.length})</div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
            <tr>
              <th className="text-left px-4 py-2">Name / E-Mail</th>
              <th className="text-left px-4 py-2">Rolle</th>
              <th className="text-left px-4 py-2">Seit</th>
              <th className="text-right px-4 py-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {data.memberships.map((m) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <div className="font-medium">{m.user.name ?? '—'}</div>
                  <div className="text-xs text-slate-500">{m.user.email}</div>
                </td>
                <td className="px-4 py-2">
                  <select value={m.role} onChange={(e) => changeRole(m.id, e.target.value as Role)}
                          className="px-2 py-1 rounded-lg border border-slate-200 text-xs">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-2 text-slate-600">{new Date(m.createdAt).toLocaleDateString('de-DE')}</td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => removeMember(m.id)} className="text-rose-600 hover:text-rose-700">
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.invitations.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm">
          <div className="px-5 py-3 border-b border-amber-200 font-semibold text-amber-900">
            Offene Einladungen ({data.invitations.length})
          </div>
          <table className="w-full text-sm">
            <tbody>
              {data.invitations.map((i) => (
                <tr key={i.id} className="border-t border-amber-100">
                  <td className="px-4 py-2">{i.email}</td>
                  <td className="px-4 py-2 text-xs">{i.role}</td>
                  <td className="px-4 py-2 text-xs text-slate-600">laeuft {new Date(i.expiresAt).toLocaleDateString('de-DE')} aus</td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => cancelInvite(i.id)} className="text-slate-600 hover:text-rose-600">
                      <X className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
