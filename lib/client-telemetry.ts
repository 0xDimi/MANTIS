'use client';

import posthog from 'posthog-js';

type EventProps = Record<string, string | number | boolean | null | undefined>;

export function captureEvent(event: string, properties?: EventProps) {
  try {
    posthog.capture(event, properties);
  } catch {
    // no-op in local/test where telemetry is absent
  }
}

export function identifyUser(userId: string, traits?: EventProps) {
  try {
    posthog.identify(userId, traits);
  } catch {
    // no-op
  }
}
