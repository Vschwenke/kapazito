'use client';

import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

export function DashboardShell({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen">
        {(title || subtitle) && (
          <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="ml-10 lg:ml-0">
                {title && <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>}
                {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
            </div>
          </header>
        )}
        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  );
}
