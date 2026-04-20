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
    <div className={cn('bg-card rounded-xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-shadow', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold font-display mt-1 tracking-tight">{displayValue}</p>
          {delta !== undefined && delta !== null && (
            <div className="flex items-center gap-1 mt-1">
              <span className={cn('text-xs font-semibold', getDeltaColor(delta))}>
                {getDeltaIcon(delta)} {Math.abs(delta ?? 0).toFixed(1)}%
              </span>
              {deltaLabel && <span className="text-xs text-muted-foreground">{deltaLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2 rounded-lg', iconColor ?? 'bg-blue-50 text-blue-600')}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
