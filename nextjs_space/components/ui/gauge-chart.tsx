'use client';

import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  maxValue?: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

export function GaugeChart({ value, maxValue = 100, label, sublabel, color = '#3b82f6', size = 120 }: GaugeChartProps) {
  const pct = Math.min((value ?? 0) / (maxValue || 100) * 100, 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference * 0.75; // 270 degree arc

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }} className="relative">
        <svg viewBox="0 0 100 100" className="-rotate-[135deg]">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`} />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset} className="gauge-animate" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-mono">{(value ?? 0).toFixed(1)}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold mt-1 text-center">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
