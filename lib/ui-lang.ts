export type UiLang = 'en' | 'el';

export function normalizeLang(value: string | null | undefined): UiLang {
  return value === 'el' ? 'el' : 'en';
}

export function tr(lang: UiLang, en: string, el: string) {
  return lang === 'el' ? el : en;
}
