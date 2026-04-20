'use client';

import { useState } from 'react';

interface FilterBarProps {
  years?: number[];
  selectedYear: number;
  selectedQuarter: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter: number) => void;
  onMonthChange: (month: number) => void;
}

const quarters = [0, 1, 2, 3, 4];
const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const monthLabels = ['Alle', 'Jan', 'Feb', 'M\u00e4r', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const quarterLabels = ['Alle', 'Q1', 'Q2', 'Q3', 'Q4'];

export function FilterBar({ years = [2024, 2025, 2026], selectedYear, selectedQuarter, selectedMonth, onYearChange, onQuarterChange, onMonthChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border/40 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Jahr</span>
        <div className="flex gap-1">
          {(years ?? []).map((y: number) => (
            <button key={y} onClick={() => onYearChange?.(y)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${selectedYear === y ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>
      <div className="w-px h-5 bg-border/50" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quartal</span>
        <div className="flex gap-1">
          {quarters.map((q: number) => (
            <button key={q} onClick={() => onQuarterChange?.(q)}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${selectedQuarter === q ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
              {quarterLabels?.[q] ?? ''}
            </button>
          ))}
        </div>
      </div>
      <div className="w-px h-5 bg-border/50" />
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Monat</span>
        <div className="flex gap-1 flex-wrap">
          {months.map((m: number) => (
            <button key={m} onClick={() => onMonthChange?.(m)}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-all ${selectedMonth === m ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
              {monthLabels?.[m] ?? ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
