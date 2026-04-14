'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import posthog from 'posthog-js';

let posthogBooted = false;

export function TelemetryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (posthogBooted) return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: 'history_change',
      capture_pageleave: true,
      persistence: 'localStorage+cookie'
    });

    posthogBooted = true;
  }, []);

  return <>{children}</>;
}
