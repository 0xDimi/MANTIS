import { cookies } from 'next/headers';
import { parseUiLang } from '@/lib/env-clean';
import { normalizeLang, type UiLang } from '@/lib/ui-lang';

export async function resolveServerLang({
  searchParam,
  profileLocale
}: {
  searchParam?: string | null;
  profileLocale?: string | null;
}): Promise<UiLang> {
  const fromQuery = parseUiLang(searchParam);
  if (fromQuery) return fromQuery;

  const cookieStore = await cookies();
  const fromCookie = parseUiLang(cookieStore.get('mantis_lang')?.value);
  if (fromCookie) return fromCookie;

  return normalizeLang(profileLocale);
}
