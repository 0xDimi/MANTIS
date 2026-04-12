export function formatEur(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';

  return `${Math.round(value * 100)}%`;
}

export function formatCompact(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';

  return new Intl.NumberFormat('en-GB', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function formatRelativeHours(value: string | null | undefined) {
  if (!value) return '—';

  const target = new Date(value).getTime();

  if (Number.isNaN(target)) return '—';

  const diffHours = Math.round((target - Date.now()) / (1000 * 60 * 60));

  if (diffHours === 0) return 'now';
  if (diffHours > 0) return `in ${diffHours}h`;

  return `${Math.abs(diffHours)}h ago`;
}
