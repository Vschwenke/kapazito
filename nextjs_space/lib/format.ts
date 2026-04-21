export function formatCurrency(value: number | null | undefined, decimals: number = 0): string {
  const v = value ?? 0;
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(2)}M€`;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(decimals > 0 ? decimals : 1)}K€`;
  return `${v.toFixed(decimals)}€`;
}

export function formatPercent(value: number | null | undefined, decimals: number = 2): string {
  return `${(value ?? 0).toFixed(decimals)}%`;
}

export function formatNumber(value: number | null | undefined, decimals: number = 0): string {
  return (value ?? 0).toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function getMonthName(month: number): string {
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return months?.[month - 1] ?? '';
}

export function getMonthShort(month: number): string {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return months?.[month - 1] ?? '';
}

export function getDeltaColor(delta: number | null | undefined): string {
  const d = delta ?? 0;
  if (d > 0) return 'text-emerald-600';
  if (d < 0) return 'text-red-500';
  return 'text-muted-foreground';
}

export function getDeltaIcon(delta: number | null | undefined): string {
  const d = delta ?? 0;
  if (d > 0) return '▲';
  if (d < 0) return '▼';
  return '—';
}
