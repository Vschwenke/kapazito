'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

function getWeekDates(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    dates.push(dd);
  }
  return dates;
}

function formatDate(d: Date) { return d.toISOString().split('T')[0]; }
function formatDateDE(d: Date) { return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }); }
function getKW(d: Date) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThurs = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  return 1 + Math.ceil((firstThurs - target.valueOf()) / 604800000);
}

export function ZeiterfassungClient() {
  const [entries, setEntries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date(); d.setHours(12, 0, 0, 0); return d;
  });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [form, setForm] = useState({
    employeeId: '', customerId: '', projectId: '', date: '', hours: '', description: '',
    isBillable: true, workLocation: 'HomeOffice',
  });

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const weekStart = formatDate(weekDates[0]);
  const weekEnd = formatDate(weekDates[6]);

  const fetchMeta = useCallback(async () => {
    try {
      const [eRes, cRes, pRes] = await Promise.all([
        fetch('/api/stammdaten/mitarbeiter'),
        fetch('/api/stammdaten/kunden'),
        fetch('/api/stammdaten/projekte'),
      ]);
      const emps = await eRes.json();
      setEmployees(emps);
      setCustomers(await cRes.json());
      setProjects(await pRes.json());
      if (emps.length > 0 && !selectedEmployee) setSelectedEmployee(emps[0].id);
    } catch (e) { console.error(e); }
  }, [selectedEmployee]);

  const fetchEntries = useCallback(async () => {
    try {
      const params = new URLSearchParams({ startDate: weekStart, endDate: weekEnd });
      if (selectedEmployee) params.set('employeeId', selectedEmployee);
      const res = await fetch(`/api/zeiterfassung?${params}`);
      setEntries(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [weekStart, weekEnd, selectedEmployee]);

  useEffect(() => { fetchMeta(); }, [fetchMeta]);
  useEffect(() => { if (selectedEmployee) fetchEntries(); }, [fetchEntries, selectedEmployee]);

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/zeiterfassung/${editing.id}` : '/api/zeiterfassung';
    const body = { ...form, employeeId: form.employeeId || selectedEmployee };
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowForm(false); setEditing(null);
    setForm({ employeeId: '', customerId: '', projectId: '', date: '', hours: '', description: '', isBillable: true, workLocation: 'HomeOffice' });
    fetchEntries();
  };

  const handleEdit = (e: any) => {
    setEditing(e);
    setForm({
      employeeId: e.employeeId, customerId: e.customerId || '', projectId: e.projectId || '',
      date: e.date?.split('T')[0] || '', hours: e.hours?.toString() || '', description: e.description || '',
      isBillable: e.isBillable, workLocation: e.workLocation || 'HomeOffice',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eintrag wirklich löschen?')) return;
    await fetch(`/api/zeiterfassung/${id}`, { method: 'DELETE' });
    fetchEntries();
  };

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const goToday = () => { const d = new Date(); d.setHours(12, 0, 0, 0); setCurrentDate(d); };

  const openNew = (date?: Date) => {
    setEditing(null);
    setForm({
      employeeId: selectedEmployee, customerId: '', projectId: '', date: date ? formatDate(date) : formatDate(new Date()),
      hours: '', description: '', isBillable: true, workLocation: 'HomeOffice',
    });
    setShowForm(true);
  };

  // Group entries by date for week view
  const entriesByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    weekDates.forEach(d => { map[formatDate(d)] = []; });
    entries.forEach(e => {
      const key = e.date?.split('T')[0];
      if (map[key]) map[key].push(e);
    });
    return map;
  }, [entries, weekDates]);

  const totalWeekHours = entries.reduce((s, e) => s + (e.hours || 0), 0);
  const totalBillable = entries.reduce((s, e) => s + (e.billableHours || 0), 0);

  const filteredProjects = form.customerId
    ? projects.filter((p: any) => p.customerId === form.customerId && p.isActive)
    : projects.filter((p: any) => p.isActive);

  return (
    <>
      {/* Week Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={goToday} className="text-sm">Heute</Button>
          <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4" /></Button>
          <span className="ml-2 font-semibold text-sm">
            KW {getKW(weekDates[0])} • {weekDates[0].toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - {weekDates[6].toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[180px]">
            <option value="">Alle Mitarbeiter</option>
            {employees.filter((e: any) => e.isActive).map((e: any) => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
            ))}
          </select>
          <Button onClick={() => openNew()}><Plus className="w-4 h-4 mr-2" /> Buchen</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Wochenstunden</p>
          <p className="text-2xl font-bold">{totalWeekHours.toFixed(1)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Abrechenbar</p>
          <p className="text-2xl font-bold text-emerald-500">{totalBillable.toFixed(1)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Nicht abrechenbar</p>
          <p className="text-2xl font-bold text-orange-500">{(totalWeekHours - totalBillable).toFixed(1)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Auslastung</p>
          <p className="text-2xl font-bold">{totalWeekHours > 0 ? ((totalBillable / 40) * 100).toFixed(0) : 0}%</p>
        </CardContent></Card>
      </div>

      {/* Booking Form */}
      {showForm && (
        <Card className="mb-6 border-blue-500/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{editing ? 'Eintrag bearbeiten' : 'Stunden buchen'}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditing(null); }}><X className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label>Mitarbeiter *</Label>
                <select value={form.employeeId || selectedEmployee} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {employees.filter((e: any) => e.isActive).map((e: any) => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Kunde</Label>
                <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value, projectId: '' })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Kein Kunde</option>
                  {customers.filter((c: any) => c.isActive).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Projekt</Label>
                <select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Kein Projekt</option>
                  {filteredProjects.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div><Label>Datum *</Label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><Label>Stunden *</Label><Input type="number" step="0.25" min="0" max="24" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="z.B. 8" /></div>
              <div className="sm:col-span-2 lg:col-span-2">
                <Label>Beschreibung</Label>
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Was wurde gemacht?" />
              </div>
              <div>
                <Label>Arbeitsort</Label>
                <select value={form.workLocation} onChange={e => setForm({ ...form, workLocation: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="HomeOffice">Home Office</option>
                  <option value="InOffice">Büro</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isBillable} onChange={e => setForm({ ...form, isBillable: e.target.checked })} className="rounded" /> Abrechenbar</label>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={!form.date || !form.hours || parseFloat(form.hours) <= 0}>Speichern</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
        {weekDates.map((d, i) => {
          const key = formatDate(d);
          const dayEntries = entriesByDate[key] || [];
          const dayTotal = dayEntries.reduce((s: number, e: any) => s + (e.hours || 0), 0);
          const isToday = formatDate(new Date()) === key;
          const isWeekend = i >= 5;

          return (
            <Card key={key} className={cn(
              'transition-colors',
              isToday && 'border-blue-500/40 bg-blue-500/5',
              isWeekend && !isToday && 'opacity-70'
            )}>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-semibold', isToday ? 'text-teal-500' : 'text-muted-foreground')}>
                    {formatDateDE(d)}
                  </span>
                  <span className="text-xs font-bold">{dayTotal > 0 ? `${dayTotal}h` : ''}</span>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5 min-h-[80px]">
                {dayEntries.map((e: any) => (
                  <div key={e.id} className="group flex items-start gap-1.5 p-1.5 rounded bg-muted/40 hover:bg-muted/80 transition-colors">
                    <Clock className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold">{e.hours}h</span>
                        {e.isBillable && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{e.project?.name || e.customer?.name || e.description || 'Kein Projekt'}</p>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-0.5">
                      <button onClick={() => handleEdit(e)} className="p-0.5 hover:text-teal-500"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => handleDelete(e.id)} className="p-0.5 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => openNew(d)} className="w-full text-center py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded transition-colors">
                  <Plus className="w-3 h-3 inline mr-1" />Hinzufügen
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
