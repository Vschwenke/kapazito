'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/ui/kpi-card';
import { formatCurrency, getMonthShort } from '@/lib/format';
import { Loader2, FolderKanban, TrendingUp, DollarSign, AlertTriangle, Clock, Users, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '@/lib/utils';

export function ProjektControllingClient() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/projekte/controlling');
      setData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const { projects = [], summary = {} } = data ?? {};

  const exportCSV = () => {
    const header = 'Projekt;Kunde;Stundensatz;Budget Std;Verbraucht Std;Budget %;Umsatz;Kosten;Profit;Marge %\n';
    const rows = projects.map((p: any) =>
      `${p.name};${p.customer};${p.rate};${p.budgetHours};${p.totalHours.toFixed(1)};${p.budgetUsedPercent.toFixed(1)};${p.revenue.toFixed(2)};${p.costs.toFixed(2)};${p.profit.toFixed(2)};${p.profitMargin.toFixed(1)}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `projekt_controlling_${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const getBudgetColor = (pct: number) => {
    if (pct >= 100) return 'bg-red-500';
    if (pct >= 80) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div />
        <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-3.5 h-3.5 mr-1.5" />CSV Export</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Projekte" value={summary.projectCount ?? 0} icon={FolderKanban} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard title="Gesamtumsatz" value={summary.totalRevenue ?? 0} format="currency" icon={DollarSign} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="Personalkosten" value={summary.totalCosts ?? 0} format="currency" icon={DollarSign} iconColor="bg-red-50 text-red-600" />
        <KpiCard title="Profit" value={summary.totalProfit ?? 0} format="currency" icon={TrendingUp} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard title="\u00d8 Marge" value={`${(summary.avgMargin ?? 0).toFixed(1)}%`} icon={TrendingUp} iconColor="bg-purple-50 text-purple-600" />
        <KpiCard title="Budget-Warnung" value={summary.overBudgetCount ?? 0} icon={AlertTriangle} iconColor="bg-orange-50 text-orange-600" />
      </div>

      {/* Warnings */}
      {projects.filter((p: any) => p.budgetHours > 0 && p.budgetUsedPercent >= 80).length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-sm">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
          <span>
            <strong>Budget-Warnung:</strong>{' '}
            {projects.filter((p: any) => p.budgetHours > 0 && p.budgetUsedPercent >= 80).map((p: any) => (
              <span key={p.id}>{p.name} ({p.budgetUsedPercent.toFixed(0)}%){' '}</span>
            ))}
          </span>
        </div>
      )}

      {/* Project Cards */}
      <div className="space-y-3">
        {projects.map((p: any) => (
          <Card key={p.id} className={cn('transition-all', expanded === p.id && 'ring-1 ring-blue-500/30')}>
            <CardContent className="p-4">
              {/* Header Row */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-teal-600/10 flex items-center justify-center shrink-0">
                    <FolderKanban className="w-5 h-5 text-teal-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.customer} \u2022 {p.rate > 0 ? `${p.rate}\u20ac/Std` : 'Kein Satz'}</p>
                  </div>
                </div>

                {/* Budget Bar */}
                <div className="flex-1 max-w-xs">
                  {p.budgetHours > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-mono font-semibold">{p.totalHours.toFixed(0)} / {p.budgetHours} Std</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', getBudgetColor(p.budgetUsedPercent))}
                          style={{ width: `${Math.min(p.budgetUsedPercent, 100)}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-0.5">
                        <span className={cn(p.budgetUsedPercent >= 90 ? 'text-red-500 font-semibold' : 'text-muted-foreground')}>
                          {p.budgetUsedPercent.toFixed(0)}% verbraucht
                        </span>
                        {p.monthsUntilBudgetEmpty != null && p.budgetRemaining > 0 && (
                          <span className="text-muted-foreground">~{p.monthsUntilBudgetEmpty.toFixed(1)} Monate Rest</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Kein Budget definiert</span>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">Umsatz</p>
                    <p className="font-semibold font-mono">{formatCurrency(p.revenue)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Kosten</p>
                    <p className="font-semibold font-mono text-red-500">{formatCurrency(p.costs)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Marge</p>
                    <p className={cn('font-semibold font-mono', p.profitMargin >= 30 ? 'text-emerald-500' : p.profitMargin >= 10 ? 'text-orange-500' : 'text-red-500')}>
                      {p.profitMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Team</p>
                    <p className="font-semibold">{p.team?.length ?? 0}</p>
                  </div>
                </div>

                <Button variant="ghost" size="icon" onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="shrink-0">
                  {expanded === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {/* Expanded Detail */}
              {expanded === p.id && (
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Monthly Chart */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Monatliche Stunden</h4>
                    <div className="h-48">
                      {p.monthlyHours?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={p.monthlyHours.map((m: any) => ({ ...m, month: getMonthShort(m.month) }))}>
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} tickLine={false} />
                            <Tooltip contentStyle={{ fontSize: 11 }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Bar dataKey="hours" name="Gesamt" fill="#1a9a8a" radius={[4,4,0,0]} />
                            <Bar dataKey="billable" name="Abrechenbar" fill="#34d399" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-xs text-muted-foreground text-center pt-16">Keine Daten</p>}
                    </div>
                  </div>

                  {/* Team */}
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Team-Mitglieder</h4>
                    <div className="space-y-1.5">
                      {(p.team ?? []).map((t: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-teal-600/10 flex items-center justify-center text-[10px] font-bold text-teal-500">
                              {t.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="text-xs font-medium">{t.name}</span>
                          </div>
                          <span className="text-xs font-mono">{t.hours.toFixed(1)} Std</span>
                        </div>
                      ))}
                      {(p.team ?? []).length === 0 && <p className="text-xs text-muted-foreground">Keine Zeiteintr\u00e4ge</p>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
