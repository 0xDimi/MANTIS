export function cleanEnv(value: string | null | undefined) {
  return (value ?? '').replace(/\\n/g, '').replace(/\n/g, '').trim();
}

export function cleanUrl(value: string | null | undefined) {
  const cleaned = cleanEnv(value).replace(/\/$/, '');
  return cleaned.length > 0 ? cleaned : null;
}

export function parseUiLang(value: string | null | undefined) {
  return value === 'el' || value === 'en' ? value : null;
}

export function resolvePublicAppUrl(fallbackOrigin?: string | null) {
  const configured = cleanUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (configured) {
    return configured;
  }

  const fallback = cleanUrl(fallbackOrigin);
  if (fallback) {
    try {
      const host = new URL(fallback).hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        return fallback;
      }
    } catch {
      // ignore malformed fallback
    }
  }

  return 'https://xyz-labs-demo.vercel.app';
}
