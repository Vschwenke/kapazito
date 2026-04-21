'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Users, KeyRound } from 'lucide-react';

const ITEMS = [
  { href: '/settings/organization', label: 'Organisation', icon: Building2 },
  { href: '/settings/team',         label: 'Team',          icon: Users },
  // { href: '/settings/api-keys',  label: 'API-Keys',      icon: KeyRound },  // kommt in E9
];

export function SettingsNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-1 text-sm">
      {ITEMS.map((it) => {
        const active = path?.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href} href={it.href}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition
              ${active ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Icon className="w-4 h-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
