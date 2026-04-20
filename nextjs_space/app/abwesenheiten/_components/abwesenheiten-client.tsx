'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/ui/kpi-card';
import { Plus, Pencil, Trash2, X, Calendar, Sun, Thermometer, Clock, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPES = ['Urlaub', 'Krank', 'Feiertag', 'Sonstiges'];
const TYPE_COLORS: Record<string, string> = {
  Urlaub: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Krank: 'bg-red-500/10 text-red-500 border-red-500/20',
  Feiertag: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  Sonstiges: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};
const TYPE_ICONS: Record<string, any> = { Urlaub: Sun, Krank: Thermometer, Feiertag: Calendar, Sonstiges: Clock };

export function AbwesenheitenClient() {
  const [data, setData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [form, setForm] = useState({
    employeeId: '', type: 'Urlaub', startDate: '', endDate: '', days: '', approved: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ year: '2026' });
      if (selectedEmployee) params.set('employeeId', selectedEmployee);
      const [aRes, eRes] = await Promise.all([
        fetch(`/api/abwesenheiten?${params}`),
        fetch('/api/stammdaten/mitarbeiter'),
      ]);
      setData(await aRes.json());
      setEmployees(await eRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [selectedEmployee]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const calcDays = (start: string, end: string) => {
    if (!start || !end) return '';
    const s = new Date(start); const e = new Date(end);
    let days = 0;
    const d = new Date(s);
    while (d <= e) { const dow = d.getDay(); if (dow !== 0 && dow !== 6) days++; d.setDate(d.getDate() + 1); }
    return days.toString();
  };

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/abwesenheiten/${editing.id}` : '/api/abwesenheiten';
    const body = { ...form, days: form.days || calcDays(form.startDate, form.endDate) };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowForm(false); setEditing(null);
    setForm({ employeeId: '', type: 'Urlaub', startDate: '', endDate: '', days: '', approved: true });
    fetchData();
  };

  const handleEdit = (a: any) => {
    setEditing(a);
    setForm({
      employeeId: a.employeeId, type: a.type,
      startDate: a.startDate?.split('T')[0] || '', endDate: a.endDate?.split('T')[0] || '',
      days: a.days?.toString() || '', approved: a.approved,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eintrag wirklich l\u00f6schen?')) return;
    await fetch(`/api/abwesenheiten/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const exportCSV = () => {
    const header = 'Mitarbeiter;Typ;Von;Bis;Tage;Genehmigt\n';
    const rows = (data?.absences ?? []).map((a: any) =>
      `${a.employee?.firstName} ${a.employee?.lastName};${a.type};${a.startDate?.split('T')[0]};${a.endDate?.split('T')[0]};${a.days};${a.approved ? 'Ja' : 'Nein'}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `abwesenheiten_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const summary = data?.summary ?? {};
  const absences = data?.absences ?? [];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Urlaubstage" value={summary.Urlaub?.days ?? 0} icon={Sun} iconColor="bg-blue-50 text-blue-600" />
        <KpiCard title="Krankheitstage" value={summary.Krank?.days ?? 0} icon={Thermometer} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Feiertage" value={summary.Feiertag?.days ?? 0} icon={Calendar} iconColor="bg-amber-50 text-amber-600" />
        <KpiCard title="Gesamt" value={data?.totalDays ?? 0} icon={Clock} iconColor="bg-purple-50 text-purple-600" />
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[200px]">
          <option value="">Alle Mitarbeiter</option>
          {employees.filter((e: any) => e.isActive).map((e: any) => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
          <Button onClick={() => { setEditing(null); setForm({ employeeId: '', type: 'Urlaub', startDate: '', endDate: '', days: '', approved: true }); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Abwesenheit eintragen
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? 'Bearbeiten' : 'Neue Abwesenheit'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Mitarbeiter *</Label>
                <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Bitte w\u00e4hlen...</option>
                  {employees.filter((e: any) => e.isActive).map((e: any) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Typ *</Label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Von *</Label>
                <Input type="date" value={form.startDate} onChange={e => {
                  const newForm = { ...form, startDate: e.target.value };
                  if (newForm.endDate) newForm.days = calcDays(e.target.value, newForm.endDate);
                  setForm(newForm);
                }} />
              </div>
              <div>
                <Label>Bis *</Label>
                <Input type="date" value={form.endDate} onChange={e => {
                  const newForm = { ...form, endDate: e.target.value };
                  if (newForm.startDate) newForm.days = calcDays(newForm.startDate, e.target.value);
                  setForm(newForm);
                }} />
              </div>
              <div>
                <Label>Arbeitstage</Label>
                <Input type="number" value={form.days} onChange={e => setForm({ ...form, days: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.approved} onChange={e => setForm({ ...form, approved: e.target.checked })} className="rounded" /> Genehmigt</label>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={!form.employeeId || !form.startDate || !form.endDate}>Speichern</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Overview */}
      {(data?.employeeSummary ?? []).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">\u00dcbersicht nach Mitarbeiter</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-semibold text-muted-foreground">MITARBEITER</th>
                    <th className="text-center p-3 font-semibold text-muted-foreground">URLAUB</th>
                    <th className="text-center p-3 font-semibold text-muted-foreground">KRANK</th>
                    <th className="text-center p-3 font-semibold text-muted-foreground">SONSTIGE</th>
                    <th className="text-center p-3 font-semibold text-muted-foreground">GESAMT</th>
                  </tr>
                </thead>
                <tbody>
                  {data.employeeSummary.map((e: any, i: number) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-3 font-medium">{e.name}</td>
                      <td className="p-3 text-center"><Badge variant="outline" className={TYPE_COLORS.Urlaub}>{e.urlaub} Tage</Badge></td>
                      <td className="p-3 text-center"><Badge variant="outline" className={TYPE_COLORS.Krank}>{e.krank} Tage</Badge></td>
                      <td className="p-3 text-center">{e.sonstige > 0 ? `${e.sonstige} Tage` : '\u2013'}</td>
                      <td className="p-3 text-center font-semibold">{e.total} Tage</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card>
        <CardHeader><CardTitle className="text-base">Alle Abwesenheiten ({absences.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Laden...</div>
          ) : absences.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Keine Abwesenheiten gefunden</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-semibold text-muted-foreground">MITARBEITER</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">TYP</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground">ZEITRAUM</th>
                    <th className="text-center p-3 font-semibold text-muted-foreground">TAGE</th>
                    <th className="text-center p-3 font-semibold text-muted-foreground">STATUS</th>
                    <th className="text-right p-3 font-semibold text-muted-foreground">AKTIONEN</th>
                  </tr>
                </thead>
                <tbody>
                  {absences.map((a: any) => {
                    const Icon = TYPE_ICONS[a.type] ?? Clock;
                    return (
                      <tr key={a.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-3 font-medium">{a.employee?.firstName} {a.employee?.lastName}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={TYPE_COLORS[a.type] ?? TYPE_COLORS.Sonstiges}>
                            <Icon className="w-3 h-3 mr-1" />{a.type}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {a.startDate?.split('T')[0]} \u2013 {a.endDate?.split('T')[0]}
                        </td>
                        <td className="p-3 text-center font-mono">{a.days}</td>
                        <td className="p-3 text-center">
                          <Badge variant={a.approved ? 'default' : 'secondary'}
                            className={a.approved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                            {a.approved ? 'Genehmigt' : 'Ausstehend'}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(a)} className="h-7 w-7"><Pencil className="w-3 h-3" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="h-7 w-7 text-red-500"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
