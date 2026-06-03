import { tr, type UiLang } from '@/lib/ui-lang';

export function statusTone(status: string) {
  if (status === 'open') return 'badgeYes';
  if (status === 'resolved' || status === 'settled') return 'badgeNeutral';
  return 'badgeNo';
}

export function marketHref(slug: string, lang: UiLang, side?: 'yes' | 'no') {
  const params = new URLSearchParams();
  if (lang === 'el') params.set('lang', 'el');
  if (side) params.set('side', side);

  const query = params.toString();
  return `/markets/${slug}${query ? `?${query}` : ''}`;
}

export function marketBoardTone(status: string, lang: UiLang) {
  if (status === 'paused') {
    return tr(lang, 'Watch only', 'Μόνο παρακολούθηση');
  }

  if (status === 'open') {
    return tr(lang, 'Open now', 'Ανοιχτή τώρα');
  }

  if (status === 'draft') {
    return tr(lang, 'Not live yet', 'Δεν είναι ακόμη live');
  }

  return tr(lang, 'Closed state', 'Κλειστή κατάσταση');
}
