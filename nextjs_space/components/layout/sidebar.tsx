'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  BarChart3, Users, TrendingUp, Receipt, Database, ChevronLeft, ChevronRight, Menu, X,
  LayoutDashboard, LineChart, PieChart, DollarSign, FileText, Briefcase, UserCheck, Settings,
  Bot, LogOut, Clock, Building2, FolderKanban, Upload, Calendar, Target, Activity
} from 'lucide-react';

const navGroups = [
  {
    label: 'Cockpit',
    icon: LayoutDashboard,
    color: 'text-teal-400',
    items: [
      { label: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Finanzen & Controlling',
    icon: BarChart3,
    color: 'text-violet-400',
    items: [
      { label: 'Finanzübersicht', href: '/finanzen', icon: BarChart3 },
      { label: 'Profitabilität', href: '/finanzen/profitabilitaet', icon: PieChart },
      { label: 'Planung & Forecast', href: '/finanzen/planung', icon: LineChart },
      { label: 'Betriebskosten', href: '/finanzen/betriebskosten', icon: DollarSign },
    ],
  },
  {
    label: 'Team & Leistung',
    icon: Users,
    color: 'text-emerald-400',
    items: [
      { label: 'Team-Übersicht', href: '/hr', icon: Users },
      { label: 'Abwesenheiten', href: '/abwesenheiten', icon: Calendar },
      { label: 'Zeiterfassung', href: '/zeiterfassung', icon: Clock },
      { label: 'Sales & Faktura', href: '/sales', icon: Receipt },
    ],
  },
  {
    label: 'Verwaltung',
    icon: Settings,
    color: 'text-slate-400',
    items: [
      { label: 'Stammdaten', href: '/stammdaten/kunden', icon: Building2 },
      { label: 'Daten-Import', href: '/import', icon: Upload },
      { label: 'System', href: '/base', icon: Database },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession() || {};

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-slate-900 text-white shadow-lg"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300',
          'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-200',
          collapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Activity className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-white">Kapazito</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 mx-auto">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
          )}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block p-1 hover:bg-white/10 rounded-lg transition-colors">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups?.map((group: any) => (
            <div key={group?.label} className="mb-4">
              {!collapsed && (
                <div className={cn('flex items-center gap-2 px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest', group?.color)}>
                  <group.icon className="w-3 h-3" />
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
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 mb-0.5',
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 font-medium shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
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

        {/* User & Logout */}
        <div className="px-3 py-3 border-t border-white/5 space-y-2">
          {session?.user && !collapsed && (
            <div className="px-2 text-xs text-slate-500 truncate">
              {session.user.name || session.user.email}
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Abmelden</span>}
          </button>
          {!collapsed && <p className="text-[10px] text-slate-600 text-center">&copy; 2026 Kapazito</p>}
        </div>
      </aside>
    </>
  );
}
