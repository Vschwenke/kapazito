'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { formatCurrency, formatPercent, getDeltaColor, getDeltaIcon } from '@/lib/format';

interface KpiCardProps {
  title: string;
  value: string | number;
  format?: 'currency' | 'percent' | 'number' | 'text';
  delta?: number | null;
  deltaLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function KpiCard({ title, value, format = 'text', delta, deltaLabel, icon: Icon, iconColor, className }: KpiCardProps) {
  const displayValue = typeof value === 'number'
    ? format === 'currency' ? formatCurrency(value)
      : format === 'percent' ? formatPercent(value)
      : (value ?? 0).toLocaleString('de-DE')
    : value ?? '—';

  return (
    <div className={cn(
      'bg-card rounded-2xl p-4 shadow-sm border border-border/40 hover:shadow-md transition-all duration-200 hover:border-border/60',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold font-display mt-1.5 tracking-tight">{displayValue}</p>
          {delta !== undefined && delta !== null && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-md', getDeltaColor(delta), delta > 0 ? 'bg-emerald-50' : delta < 0 ? 'bg-red-50' : 'bg-muted')}>
                {getDeltaIcon(delta)} {Math.abs(delta ?? 0).toFixed(1)}%
              </span>
              {deltaLabel && <span className="text-[11px] text-muted-foreground">{deltaLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl', iconColor ?? 'bg-teal-50 text-teal-600')}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
