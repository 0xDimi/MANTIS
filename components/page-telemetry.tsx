'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureEvent } from '@/lib/client-telemetry';

function marketSlugFromPath(pathname: string) {
  const match = pathname.match(/^\/markets\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export function PageTelemetry() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    captureEvent('page viewed', {
      pathname,
      url
    });

    const marketSlug = marketSlugFromPath(pathname);
    if (marketSlug) {
      captureEvent('market opened', { marketSlug });
    }

    if (pathname === '/portfolio') {
      captureEvent('portfolio opened');
    }
  }, [pathname, searchParams]);

  return null;
}
