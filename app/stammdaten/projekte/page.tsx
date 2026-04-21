'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, X, Search, FolderKanban } from 'lucide-react';
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

export default function ProjektePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '', customerId: '', purchaseOrder: '', hourlyRate: '', budgetHours: '',
    startDate: '', endDate: '', isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/stammdaten/projekte'),
        fetch('/api/stammdaten/kunden'),
      ]);
      setProjects(await pRes.json());
      setCustomers(await cRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/stammdaten/projekte/${editing.id}` : '/api/stammdaten/projekte';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false); setEditing(null);
    setForm({ name: '', customerId: '', purchaseOrder: '', hourlyRate: '', budgetHours: '', startDate: '', endDate: '', isActive: true });
    fetchData();
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name, customerId: p.customerId, purchaseOrder: p.purchaseOrder || '',
      hourlyRate: p.hourlyRate?.toString() || '', budgetHours: p.budgetHours?.toString() || '',
      startDate: p.startDate ? p.startDate.split('T')[0] : '', endDate: p.endDate ? p.endDate.split('T')[0] : '',
      isActive: p.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Projekt wirklich deaktivieren?')) return;
    await fetch(`/api/stammdaten/projekte/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filtered = projects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.purchaseOrder?.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (v: number | null) => v != null ? `${v.toLocaleString('de-DE')} €` : '–';

  return (
    <>
      <StammdatenTabs />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: '', customerId: '', purchaseOrder: '', hourlyRate: '', budgetHours: '', startDate: '', endDate: '', isActive: true }); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Neues Projekt
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-orange-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? 'Projekt bearbeiten' : 'Neues Projekt'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div><Label>Projektname *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Kunde *</Label>
                <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Bitte wählen...</option>
                  {customers.filter((c: any) => c.isActive).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div><Label>Bestellnummer</Label><Input value={form.purchaseOrder} onChange={e => setForm({ ...form, purchaseOrder: e.target.value })} /></div>
              <div><Label>Stundensatz (€)</Label><Input type="number" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} /></div>
              <div><Label>Budget (Std.)</Label><Input type="number" value={form.budgetHours} onChange={e => setForm({ ...form, budgetHours: e.target.value })} /></div>
              <div><Label>Startdatum</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div><Label>Enddatum</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Aktiv</label>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={!form.name || !form.customerId}>Speichern</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Laden...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Keine Projekte gefunden</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">PROJEKT</th>
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">KUNDE</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">STUNDENSATZ</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">BUDGET</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">EINTRÄGE</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground">STATUS</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground">AKTIONEN</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-600/10 flex items-center justify-center">
                            <FolderKanban className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <span className="font-medium text-sm block">{p.name}</span>
                            {p.purchaseOrder && <span className="text-xs text-muted-foreground">{p.purchaseOrder}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{p.customer?.name || '–'}</td>
                      <td className="p-3 text-right text-sm hidden sm:table-cell">{fmt(p.hourlyRate)}</td>
                      <td className="p-3 text-right text-sm hidden md:table-cell">{p.budgetHours ? `${p.budgetHours} Std.` : '–'}</td>
                      <td className="p-3 text-center text-sm hidden lg:table-cell">{p._count?.timeEntries || 0}</td>
                      <td className="p-3 text-center">
                        <Badge variant={p.isActive ? 'default' : 'secondary'} className={p.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                          {p.isActive ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8"><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-red-500 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
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
