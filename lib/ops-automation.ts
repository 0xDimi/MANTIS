export function parseBoolean(value: string | null | undefined, fallback = false) {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  if (['1', 'true', 'yes', 'on', 'enabled'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off', 'disabled'].includes(normalized)) return false;
  return fallback;
}

export function getAthensNowParts(now = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  const parts = formatter.formatToParts(now);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  const year = Number(map.year ?? '0');
  const month = Number(map.month ?? '0');
  const day = Number(map.day ?? '0');
  const hour = Number(map.hour ?? '0');
  const minute = Number(map.minute ?? '0');
  const second = Number(map.second ?? '0');

  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayKey: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
}

export function getAthensOffsetMs(now = new Date()) {
  const athensClock = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Athens' }));
  return athensClock.getTime() - now.getTime();
}

export function getAthensDayStartIso(now = new Date()) {
  const offsetMs = getAthensOffsetMs(now);
  const athensNowMs = now.getTime() + offsetMs;
  const dayStartMsAthensClock = Math.floor(athensNowMs / 86_400_000) * 86_400_000;
  const utcMs = dayStartMsAthensClock - offsetMs;

  return new Date(utcMs).toISOString();
}

export function getBearerToken(request: Request) {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(/\s+/, 2);
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== 'bearer') return null;

  return token.trim();
}

export function isOpsAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim() ?? '';
  const opsKey = process.env.OPS_RUN_KEY?.trim() ?? '';
  const token = getBearerToken(request);
  const queryKey = new URL(request.url).searchParams.get('key')?.trim() ?? '';
  const headerKey = request.headers.get('x-ops-key')?.trim() ?? '';

  const secureMatch =
    (cronSecret && token === cronSecret) ||
    (opsKey && (token === opsKey || queryKey === opsKey || headerKey === opsKey));

  if (secureMatch) {
    return { ok: true, mode: cronSecret && token === cronSecret ? 'cron_secret' : 'ops_key' } as const;
  }

  if (process.env.NODE_ENV !== 'production') {
    return { ok: true, mode: 'dev_bypass' } as const;
  }

  const hasAnySecret = Boolean(cronSecret || opsKey);

  if (!hasAnySecret) {
    return { ok: true, mode: 'no_secret_configured' } as const;
  }

  return { ok: false, mode: 'unauthorized' } as const;
}
