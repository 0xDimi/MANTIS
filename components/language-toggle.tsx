'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

function hrefWithLang(pathname: string, params: URLSearchParams, lang: 'en' | 'el') {
  const next = new URLSearchParams(params.toString());

  if (lang === 'en') {
    next.delete('lang');
  } else {
    next.set('lang', 'el');
  }

  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function LanguageToggle() {
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get('lang') === 'el' ? 'el' : 'en';

  return (
    <div className="langToggle" role="group" aria-label={current === 'el' ? 'Γλώσσα' : 'Language'}>
      <Link className={current === 'en' ? 'langToggleItem langToggleItemActive' : 'langToggleItem'} href={hrefWithLang(pathname, params, 'en')}>
        EN
      </Link>
      <Link className={current === 'el' ? 'langToggleItem langToggleItemActive' : 'langToggleItem'} href={hrefWithLang(pathname, params, 'el')}>
        ΕΛ
      </Link>
    </div>
  );
}
