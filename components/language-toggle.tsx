'use client';

import { useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { captureEvent } from '@/lib/client-telemetry';

function hrefWithLang(pathname: string, params: URLSearchParams, lang: 'en' | 'el') {
  const next = new URLSearchParams(params.toString());
  next.set('lang', lang);

  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = params.get('lang') === 'el' ? 'el' : 'en';

  async function switchLanguage(nextLang: 'en' | 'el') {
    if (nextLang === current) return;

    const targetHref = hrefWithLang(pathname, params, nextLang);

    try {
      await fetch('/api/preferences/lang', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang: nextLang })
      });
    } catch {
      // no-op, still navigate
    }

    captureEvent('language switched', {
      from: current,
      to: nextLang,
      pathname
    });

    startTransition(() => {
      router.push(targetHref);
      router.refresh();
    });
  }

  return (
    <div className="langToggle" role="group" aria-label={current === 'el' ? 'Γλώσσα' : 'Language'}>
      <button
        className={current === 'en' ? 'langToggleItem langToggleItemActive' : 'langToggleItem'}
        type="button"
        onClick={() => void switchLanguage('en')}
        disabled={isPending}
        aria-pressed={current === 'en'}
      >
        EN
      </button>
      <button
        className={current === 'el' ? 'langToggleItem langToggleItemActive' : 'langToggleItem'}
        type="button"
        onClick={() => void switchLanguage('el')}
        disabled={isPending}
        aria-pressed={current === 'el'}
      >
        ΕΛ
      </button>
    </div>
  );
}
