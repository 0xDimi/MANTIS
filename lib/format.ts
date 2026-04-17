import type { UiLang } from '@/lib/ui-lang';

type FormatLang = UiLang;

function localeFromLang(lang: FormatLang = 'en') {
  return lang === 'el' ? 'el-GR' : 'en-GB';
}

export function formatEur(value: number | null | undefined, lang: FormatLang = 'en') {
  if (value == null || Number.isNaN(value)) return '—';

  return new Intl.NumberFormat(localeFromLang(lang), {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';

  return `${Math.round(value * 100)}%`;
}

export function formatCompact(value: number | null | undefined, lang: FormatLang = 'en') {
  if (value == null || Number.isNaN(value)) return '—';

  return new Intl.NumberFormat(localeFromLang(lang), {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

export function formatDateTime(value: string | null | undefined, lang: FormatLang = 'en') {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat(localeFromLang(lang), {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

export function formatRelativeClose(
  value: string | null | undefined,
  options?: {
    calendarAfterDays?: number;
    lang?: FormatLang;
  }
) {
  if (!value) return '—';

  const target = new Date(value).getTime();

  if (Number.isNaN(target)) return '—';

  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  const lang = options?.lang ?? 'en';

  if (diffMinutes <= 0) return lang === 'el' ? 'έκλεισε' : 'closed';

  const calendarAfterDays = options?.calendarAfterDays ?? 7;
  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = Math.max(diffMinutes - hours * 60, 0);

    if (hours <= 0) return lang === 'el' ? `σε ${Math.max(minutes, 1)}λ` : `in ${Math.max(minutes, 1)}m`;
    if (minutes >= 15) return lang === 'el' ? `σε ${hours}ω ${minutes}λ` : `in ${hours}h ${minutes}m`;

    return lang === 'el' ? `σε ${hours}ω` : `in ${hours}h`;
  }

  const diffDays = Math.ceil(diffHours / 24);

  if (diffDays < calendarAfterDays) {
    return lang === 'el' ? `σε ${diffDays}η` : `in ${diffDays}d`;
  }

  return new Intl.DateTimeFormat(localeFromLang(lang), {
    month: 'short',
    day: 'numeric'
  }).format(new Date(target));
}

export function formatRelativeTime(value: string | null | undefined, lang: FormatLang = 'en') {
  if (!value) return '—';

  const target = new Date(value).getTime();

  if (Number.isNaN(target)) return '—';

  const diffMinutes = Math.round((target - Date.now()) / (1000 * 60));
  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffMinutes) < 1) return lang === 'el' ? 'τώρα' : 'now';

  if (Math.abs(diffHours) < 1) {
    return diffMinutes > 0
      ? lang === 'el'
        ? `σε ${Math.abs(diffMinutes)}λ`
        : `in ${Math.abs(diffMinutes)}m`
      : lang === 'el'
        ? `πριν ${Math.abs(diffMinutes)}λ`
        : `${Math.abs(diffMinutes)}m ago`;
  }

  if (diffHours > 0) return lang === 'el' ? `σε ${diffHours}ω` : `in ${diffHours}h`;

  return lang === 'el' ? `πριν ${Math.abs(diffHours)}ω` : `${Math.abs(diffHours)}h ago`;
}

export function formatRelativeHours(value: string | null | undefined, lang: FormatLang = 'en') {
  return formatRelativeTime(value, lang);
}
