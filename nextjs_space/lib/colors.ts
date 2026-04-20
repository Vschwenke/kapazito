/**
 * Kapazito Design System – Chart & Brand Colors
 * 
 * Primary: Teal (#1a9a8a) – Kapazität, Wachstum, Effizienz
 * Accent: Violet (#7c5cfc) – KI, Innovation, Premium
 * Warm: Amber (#f59e42) – Warnungen, Aufmerksamkeit
 * Rose: (#e8577a) – Kosten, Negativwerte
 * Sky: (#38bdf8) – Neutral-positiv, Vergleichswerte
 * Mint: (#34d399) – Erfolg, Gewinn
 */

// Chart-Farb-Palette (für Recharts fill/stroke)
export const CHART_COLORS = [
  '#1a9a8a', // Teal (Primary)
  '#7c5cfc', // Violet (Accent)
  '#f59e42', // Amber
  '#e8577a', // Rose
  '#38bdf8', // Sky
  '#34d399', // Mint
  '#818cf8', // Indigo
  '#fb923c', // Orange
] as const;

// Semantische Farben
export const CHART = {
  primary: '#1a9a8a',
  accent: '#7c5cfc',
  success: '#34d399',
  warning: '#f59e42',
  danger: '#e8577a',
  info: '#38bdf8',
  muted: '#94a3b8',
  // Chart-spezifisch
  revenue: '#1a9a8a',
  costs: '#e8577a',
  profit: '#34d399',
  cashIn: '#34d399',
  cashOut: '#e8577a',
  planned: '#7c5cfc',
  forecast: '#f59e42',
  actual: '#1a9a8a',
  billable: '#1a9a8a',
  sick: '#e8577a',
  vacation: '#f59e42',
} as const;

// Status-Farben für Rechnungen
export const STATUS_COLORS: Record<string, string> = {
  paid: '#34d399',
  partial: '#f59e42',
  open: '#38bdf8',
  overdue: '#e8577a',
};

export const STATUS_LABELS: Record<string, string> = {
  paid: 'Bezahlt',
  partial: 'Teilbezahlt',
  open: 'Offen',
  overdue: 'Überfällig',
};
