'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import posthog from 'posthog-js';
import * as Sentry from '@sentry/nextjs';
import { cleanEnv } from '@/lib/env-clean';
import { identifyUser } from '@/lib/client-telemetry';

let posthogBooted = false;

export function TelemetryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (posthogBooted) return;

    const key = cleanEnv(process.env.NEXT_PUBLIC_POSTHOG_KEY);
    const host = cleanEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST);
    if (!key || !host) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage+cookie'
    });

    posthogBooted = true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncUserContext() {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' });
        if (!response.ok) return;

        const payload = (await response.json()) as {
          user?: {
            id?: string;
            email?: string | null;
            profile?: {
              role?: string;
              locale?: string | null;
            } | null;
          } | null;
        };

        const user = payload.user;
        if (cancelled || !user?.id) return;

        identifyUser(user.id, {
          role: user.profile?.role ?? null,
          locale: user.profile?.locale ?? null
        });

        Sentry.setUser({ id: user.id });
      } catch {
        // no-op
      }
    }

    void syncUserContext();

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
