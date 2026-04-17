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

export function formatRelativeClose(
  value: string | null | undefined,
  options?: {
    calendarAfterDays?: number;
  }
) {
  if (!value) return '—';

  const target = new Date(value).getTime();

  if (Number.isNaN(target)) return '—';

  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes <= 0) return 'closed';

  const calendarAfterDays = options?.calendarAfterDays ?? 7;
  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.max(diffMinutes - hours * 60, 0);

    if (hours <= 0) return `in ${Math.max(minutes, 1)}m`;
    if (minutes >= 15) return `in ${hours}h ${minutes}m`;

    return `in ${hours}h`;
  }

  const diffDays = Math.ceil(diffHours / 24);

  if (diffDays < calendarAfterDays) {
    return `in ${diffDays}d`;
  }

  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(target));
}

export function formatRelativeTime(value: string | null | undefined) {
  if (!value) return '—';

  const target = new Date(value).getTime();

  if (Number.isNaN(target)) return '—';

  const diffHours = Math.round((target - Date.now()) / (1000 * 60 * 60));

  if (diffHours === 0) return 'now';
  if (diffHours > 0) return `in ${diffHours}h`;

  return `${Math.abs(diffHours)}h ago`;
}

export function formatRelativeHours(value: string | null | undefined) {
  return formatRelativeTime(value);
}
