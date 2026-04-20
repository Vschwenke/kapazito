'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, X, Search, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Kunden', href: '/stammdaten/kunden' },
  { label: 'Mitarbeiter', href: '/stammdaten/mitarbeiter' },
  { label: 'Projekte', href: '/stammdaten/projekte' },
];

function StammdatenTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
      {tabs.map(t => (
        <Link key={t.href} href={t.href}
          className={cn('px-4 py-2 rounded-md text-sm font-medium transition-colors',
            pathname === t.href ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}
        >{t.label}</Link>
      ))}
    </div>
  );
}

const levels = ['Junior', 'Mid', 'Senior', 'Lead'];
const contracts = ['Remote', 'Hybrid', 'Office'];

export default function MitarbeiterPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', contractType: 'Hybrid',
    experienceLevel: 'Mid', monthlyIncome: '', startDate: '', weeklyHours: '40', isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/stammdaten/mitarbeiter');
      setEmployees(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/stammdaten/mitarbeiter/${editing.id}` : '/api/stammdaten/mitarbeiter';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false); setEditing(null);
    setForm({ firstName: '', lastName: '', email: '', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: '', startDate: '', weeklyHours: '40', isActive: true });
    fetchData();
  };

  const handleEdit = (e: any) => {
    setEditing(e);
    setForm({
      firstName: e.firstName, lastName: e.lastName, email: e.email || '',
      contractType: e.contractType || 'Hybrid', experienceLevel: e.experienceLevel || 'Mid',
      monthlyIncome: e.monthlyIncome?.toString() || '', startDate: e.startDate ? e.startDate.split('T')[0] : '',
      weeklyHours: e.weeklyHours?.toString() || '40', isActive: e.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Mitarbeiter wirklich deaktivieren?')) return;
    await fetch(`/api/stammdaten/mitarbeiter/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filtered = employees.filter(e => {
    const name = `${e.firstName} ${e.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || e.email?.toLowerCase().includes(search.toLowerCase());
  });

  const fmt = (v: number | null) => v != null ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) : '–';

  return (
    <>
      <StammdatenTabs />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setForm({ firstName: '', lastName: '', email: '', contractType: 'Hybrid', experienceLevel: 'Mid', monthlyIncome: '', startDate: '', weeklyHours: '40', isActive: true }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Neuer Mitarbeiter
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-emerald-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><Label>Vorname *</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
              <div><Label>Nachname *</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
              <div><Label>E-Mail</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Monatsgehalt (€)</Label><Input type="number" value={form.monthlyIncome} onChange={e => setForm({ ...form, monthlyIncome: e.target.value })} /></div>
              <div>
                <Label>Erfahrungslevel</Label>
                <select value={form.experienceLevel} onChange={e => setForm({ ...form, experienceLevel: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <Label>Arbeitsmodell</Label>
                <select value={form.contractType} onChange={e => setForm({ ...form, contractType: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {contracts.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>Wochenstunden</Label><Input type="number" value={form.weeklyHours} onChange={e => setForm({ ...form, weeklyHours: e.target.value })} /></div>
              <div><Label>Startdatum</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Aktiv</label>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={!form.firstName || !form.lastName}>Speichern</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Laden...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Keine Mitarbeiter gefunden</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">NAME</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">E-MAIL</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">LEVEL</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">MODELL</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">GEHALT</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground">STATUS</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground">AKTIONEN</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center text-xs font-bold text-emerald-500">
                            {e.firstName?.[0]}{e.lastName?.[0]}
                          </div>
                          <span className="font-medium text-sm">{e.firstName} {e.lastName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{e.email || '–'}</td>
                      <td className="p-3 text-center hidden sm:table-cell">
                        <Badge variant="outline" className="text-xs">{e.experienceLevel || '–'}</Badge>
                      </td>
                      <td className="p-3 text-center text-sm text-muted-foreground hidden lg:table-cell">{e.contractType || '–'}</td>
                      <td className="p-3 text-right text-sm hidden sm:table-cell">{fmt(e.monthlyIncome)}</td>
                      <td className="p-3 text-center">
                        <Badge variant={e.isActive ? 'default' : 'secondary'} className={e.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                          {e.isActive ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(e)} className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)} className="h-8 w-8 text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
