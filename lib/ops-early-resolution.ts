export type EarlyResolutionOutcome = 'yes' | 'no' | 'void';

export type EarlyResolutionMarket = {
  slug: string;
  question?: string | null;
};

export type EarlyResolutionDecision = {
  outcome: EarlyResolutionOutcome;
  evidenceSummary: string;
  evidenceUrl: string;
  detector: string;
};

type FetchLike = typeof fetch;

type ClubSource = {
  club: 'Olympiacos' | 'Panathinaikos';
  homepages: string[];
  teamPattern: RegExp;
};

type AnchorCandidate = {
  href: string;
  text: string;
};

const supportedDetectors = new Set(['gre-sports-euroleague-final4', 'gre-sports-euroleague-final']);

const finalFourPattern = /final\s*(four|4)/i;
const euroleaguePattern = /(euroleague|ευρωλιγκ)/i;
const finalPattern = /(\bfinal\b(?!\s*(four|4))|τελικ)/i;
const qualificationPatterns = [
  /προκρι/,
  /εξασφαλι/,
  /qualif/,
  /book(?:ed|s)?\s+(?:its\s+)?(?:a\s+)?ticket/,
  /clinch/,
  /secure/,
  /seal(?:ed|s)?/,
  /berth/,
  /spot\s+(?:in|at)\s+the\s+final\s*(?:four|4)/,
  /final\s*(?:four|4)\s+appearance/
];

const finalQualificationPatterns = [
  /\bfinal\b(?!\s*(four|4))/i,
  /championship game/i,
  /title game/i,
  /τελικ/
];

const clubSources: ClubSource[] = [
  {
    club: 'Olympiacos',
    homepages: ['https://www.olympiacosbc.gr/el/', 'https://www.olympiacosbc.gr/en/'],
    teamPattern: /(olympiacos|ολυμπιακ)/i
  },
  {
    club: 'Panathinaikos',
    homepages: ['https://www.paobc.gr/', 'https://www.paobc.gr/en/'],
    teamPattern: /(panathinaikos|παναθηναικ)/i
  }
];

export function hasEarlyResolutionDetector(slug: string) {
  return supportedDetectors.has(slug);
}

export function normalizeForMatch(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));
}

export function stripHtml(text: string) {
  return decodeHtmlEntities(text.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function extractAnchorCandidates(html: string, baseUrl: string) {
  const anchors: AnchorCandidate[] = [];
  const seen = new Set<string>();
  const anchorRegex = /<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null = null;

  while ((match = anchorRegex.exec(html))) {
    const rawHref = match[2]?.trim();
    const rawText = stripHtml(match[3] ?? '');

    if (!rawHref || !rawText) {
      continue;
    }

    let href: string;

    try {
      href = new URL(rawHref, baseUrl).toString();
    } catch {
      continue;
    }

    if (seen.has(href)) {
      continue;
    }

    seen.add(href);
    anchors.push({ href, text: rawText });
  }

  return anchors;
}

export function pickFinalFourArticleCandidates(html: string, baseUrl: string) {
  return extractAnchorCandidates(html, baseUrl).filter((anchor) => finalFourPattern.test(anchor.text)).slice(0, 8);
}

export function pickFinalArticleCandidates(html: string, baseUrl: string) {
  return extractAnchorCandidates(html, baseUrl).filter((anchor) => finalPattern.test(anchor.text)).slice(0, 8);
}

export function articleConfirmsQualification(text: string, teamPattern: RegExp) {
  const normalized = normalizeForMatch(text);

  return finalFourPattern.test(normalized) && teamPattern.test(normalized) && qualificationPatterns.some((pattern) => pattern.test(normalized));
}

export function articleConfirmsFinalQualification(text: string, teamPattern: RegExp) {
  const normalized = normalizeForMatch(text);

  return (
    euroleaguePattern.test(normalized) &&
    teamPattern.test(normalized) &&
    qualificationPatterns.some((pattern) => pattern.test(normalized)) &&
    finalQualificationPatterns.some((pattern) => pattern.test(normalized))
  );
}

async function fetchHtml(url: string, fetcher: FetchLike) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetcher(url, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; xyz-labs-ops/1.0; +https://xyz-labs-demo.vercel.app)',
        'accept-language': 'en-US,en;q=0.9,el;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`fetch failed for ${url}: ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function detectGreekTeamEuroleagueFinalFour(fetcher: FetchLike): Promise<EarlyResolutionDecision | null> {
  for (const source of clubSources) {
    for (const homepage of source.homepages) {
      const homepageHtml = await fetchHtml(homepage, fetcher);
      const candidates = pickFinalFourArticleCandidates(homepageHtml, homepage);

      for (const candidate of candidates) {
        const articleHtml = await fetchHtml(candidate.href, fetcher);
        const articleText = stripHtml(articleHtml);

        if (!articleConfirmsQualification(articleText, source.teamPattern)) {
          continue;
        }

        return {
          outcome: 'yes',
          evidenceSummary: `${source.club} BC official report confirms ${source.club} reached the EuroLeague Final Four, so a Greek team qualified.`,
          evidenceUrl: candidate.href,
          detector: 'club-official-final-four-qualification'
        };
      }
    }
  }

  return null;
}

async function detectGreekTeamEuroleagueFinal(fetcher: FetchLike): Promise<EarlyResolutionDecision | null> {
  for (const source of clubSources) {
    for (const homepage of source.homepages) {
      const homepageHtml = await fetchHtml(homepage, fetcher);
      const candidates = pickFinalArticleCandidates(homepageHtml, homepage);

      for (const candidate of candidates) {
        const articleHtml = await fetchHtml(candidate.href, fetcher);
        const articleText = stripHtml(articleHtml);

        if (!articleConfirmsFinalQualification(articleText, source.teamPattern)) {
          continue;
        }

        return {
          outcome: 'yes',
          evidenceSummary: `${source.club} BC official report confirms ${source.club} reached the EuroLeague Final, so a Greek team qualified for the title game.`,
          evidenceUrl: candidate.href,
          detector: 'club-official-final-qualification'
        };
      }
    }
  }

  return null;
}

export async function detectEarlyResolutionDecision(
  market: EarlyResolutionMarket,
  fetcher: FetchLike = fetch
): Promise<EarlyResolutionDecision | null> {
  if (!hasEarlyResolutionDetector(market.slug)) {
    return null;
  }

  switch (market.slug) {
    case 'gre-sports-euroleague-final4':
      return detectGreekTeamEuroleagueFinalFour(fetcher);
    case 'gre-sports-euroleague-final':
      return detectGreekTeamEuroleagueFinal(fetcher);
    default:
      return null;
  }
}
