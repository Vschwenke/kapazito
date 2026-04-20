'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3, Users, TrendingUp, Receipt, Database, ChevronLeft, ChevronRight, Menu, X,
  LayoutDashboard, LineChart, PieChart, DollarSign, FileText, Briefcase, UserCheck, Settings
} from 'lucide-react';

const navGroups = [
  {
    label: 'Finanzreport',
    icon: BarChart3,
    color: 'text-blue-400',
    items: [
      { label: 'Dashboard', href: '/finanzen', icon: LayoutDashboard },
      { label: 'Planung & Forecast', href: '/finanzen/planung', icon: LineChart },
      { label: 'Deckungsbeitrag', href: '/finanzen/deckungsbeitrag', icon: PieChart },
      { label: 'Ertr\u00e4ge', href: '/finanzen/ertraege', icon: TrendingUp },
      { label: 'Betriebskosten', href: '/finanzen/betriebskosten', icon: DollarSign },
    ],
  },
  {
    label: 'HR & Recruiting',
    icon: Users,
    color: 'text-emerald-400',
    items: [
      { label: 'Team', href: '/hr', icon: Users },
      { label: 'Mitarbeiter', href: '/hr/mitarbeiter', icon: UserCheck },
    ],
  },
  {
    label: 'Sales & CRM',
    icon: TrendingUp,
    color: 'text-orange-400',
    items: [
      { label: 'Dashboard', href: '/sales', icon: LayoutDashboard },
      { label: 'Ertr\u00e4ge', href: '/sales/ertraege', icon: TrendingUp },
    ],
  },
  {
    label: 'Rechnungsstellung',
    icon: Receipt,
    color: 'text-purple-400',
    items: [
      { label: 'Kunden\u00fcbersicht', href: '/rechnungen', icon: FileText },
      { label: 'Details', href: '/rechnungen/details', icon: Briefcase },
    ],
  },
  {
    label: 'Base Report',
    icon: Database,
    color: 'text-cyan-400',
    items: [
      { label: 'Datenmodell', href: '/base', icon: Database },
      { label: 'Konfiguration', href: '/base/config', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-slate-800 text-white shadow-lg"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col bg-slate-900 text-slate-200 transition-all duration-300',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">IN</div>
              <span className="font-display font-bold text-sm tracking-tight">INLOGY Reporting</span>
            </div>
          )}
          {collapsed && <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm mx-auto">IN</div>}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 hover:bg-slate-700 rounded">
            <X className="w-4 h-4" />
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block p-1 hover:bg-slate-700 rounded">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups?.map((group: any) => (
            <div key={group?.label} className="mb-4">
              {!collapsed && (
                <div className={cn('flex items-center gap-2 px-2 mb-1 text-xs font-semibold uppercase tracking-wider', group?.color)}>
                  <group.icon className="w-3.5 h-3.5" />
                  <span>{group?.label}</span>
                </div>
              )}
              {collapsed && (
                <div className={cn('flex justify-center mb-1', group?.color)}>
                  <group.icon className="w-4 h-4" />
                </div>
              )}
              {group?.items?.map((item: any) => {
                const isActive = pathname === item?.href || (item?.href !== '/' && pathname?.startsWith?.(item?.href + '/'));
                return (
                  <Link
                    key={item?.href}
                    href={item?.href ?? '#'}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors mb-0.5',
                      isActive ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item?.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-700/50">
          {!collapsed && <p className="text-[10px] text-slate-500 text-center">\u00a9 2026 INLOGY GmbH</p>}
        </div>
      </aside>
    </>
  );
}
