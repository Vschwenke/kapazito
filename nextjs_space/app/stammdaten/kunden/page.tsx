'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, X, Search, Building2 } from 'lucide-react';
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

export default function KundenPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', shortName: '', industry: '', isActive: true });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/stammdaten/kunden');
      const data = await res.json();
      setCustomers(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/stammdaten/kunden/${editing.id}` : '/api/stammdaten/kunden';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false); setEditing(null); setForm({ name: '', shortName: '', industry: '', isActive: true });
    fetchData();
  };

  const handleEdit = (c: any) => {
    setEditing(c); setForm({ name: c.name, shortName: c.shortName || '', industry: c.industry || '', isActive: c.isActive });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Kunde wirklich deaktivieren?')) return;
    await fetch(`/api/stammdaten/kunden/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.shortName?.toLowerCase().includes(search.toLowerCase()) ||
    c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <StammdatenTabs />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', shortName: '', industry: '', isActive: true }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Neuer Kunde
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? 'Kunde bearbeiten' : 'Neuer Kunde'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Firmenname" /></div>
              <div><Label>Kürzel</Label><Input value={form.shortName} onChange={e => setForm({ ...form, shortName: e.target.value })} placeholder="z.B. ACM" /></div>
              <div><Label>Branche</Label><Input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="z.B. IT-Consulting" /></div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Aktiv</label>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={!form.name}>Speichern</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Laden...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Keine Kunden gefunden</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">KUNDE</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">KÜRZEL</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">BRANCHE</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground">PROJEKTE</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground">STATUS</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground">AKTIONEN</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="font-medium text-sm">{c.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">{c.shortName || '–'}</td>
                      <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{c.industry || '–'}</td>
                      <td className="p-3 text-center text-sm">{c.projects?.length || 0}</td>
                      <td className="p-3 text-center">
                        <Badge variant={c.isActive ? 'default' : 'secondary'} className={c.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                          {c.isActive ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-8 w-8 text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
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
