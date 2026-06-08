export type MarketCardIconInput = {
  slug?: string | null;
  question?: string | null;
  title?: string | null;
  subtitle?: string | null;
  category?: string | null;
};

type SingleMarketCardIconAsset = {
  kind?: 'single';
  src: string;
  position?: string;
  fit?: 'cover' | 'contain';
  padding?: number;
  background?: string;
};

type PairMarketCardIconAsset = {
  kind: 'pair';
  leftSrc: string;
  rightSrc: string;
  leftPosition?: string;
  rightPosition?: string;
  fit?: 'cover' | 'contain';
  padding?: number;
  background?: string;
};

export type MarketCardIconAsset = SingleMarketCardIconAsset | PairMarketCardIconAsset;

type MarketCardAssetPathCarrier = {
  src?: string;
  leftSrc?: string;
  rightSrc?: string;
};

const CATEGORY_IMAGES = {
  economy: { src: '/market-card-images/economy-chart.jpg', position: 'center' },
  politics: { src: '/market-card-images/politics-parliament.jpg', position: 'center 42%' },
  weather: { src: '/market-card-images/weather-storm.jpg', position: 'center' },
  sports: { src: '/market-card-images/sports-field.jpg', position: 'center' },
  global: { src: '/market-card-images/global-globe.jpg', position: 'center' },
  tech: { src: '/market-card-images/tech-datacenter.jpg', position: 'center' },
  social: { src: '/market-card-images/social-protest.jpg', position: 'center' },
  energy: { src: '/market-card-images/energy-gas-station.jpg', position: 'center 58%' },
  iran: { src: '/market-card-images/geopolitics-iran.jpg', position: 'center' }
} as const satisfies Record<string, MarketCardIconAsset>;

const ENTITY_ICONS = {
  usIran: {
    kind: 'pair',
    leftSrc: '/market-card-icons/flag-us.svg',
    rightSrc: '/market-card-icons/flag-iran.svg',
    leftPosition: 'center',
    rightPosition: 'center',
    background: 'linear-gradient(180deg, rgba(12, 20, 34, 0.96), rgba(10, 16, 28, 0.98))'
  },
  iran: {
    src: '/market-card-icons/flag-iran.svg',
    fit: 'cover',
    position: 'center',
    background: 'linear-gradient(180deg, rgba(15, 20, 32, 0.96), rgba(10, 16, 28, 0.98))'
  },
  albania: {
    src: '/market-card-icons/flag-albania.png',
    fit: 'cover',
    position: 'center',
    background: 'linear-gradient(180deg, rgba(15, 20, 32, 0.96), rgba(10, 16, 28, 0.98))'
  },
  peru: {
    src: '/market-card-icons/flag-peru.png',
    fit: 'cover',
    position: 'center',
    background: 'linear-gradient(180deg, rgba(15, 20, 32, 0.96), rgba(10, 16, 28, 0.98))'
  },
  bitcoin: {
    src: '/market-card-icons/logo-bitcoin.png',
    fit: 'contain',
    padding: 6,
    background: 'radial-gradient(circle at 30% 30%, rgba(249, 115, 22, 0.28), rgba(15, 23, 42, 0.98) 72%)'
  },
  spacex: {
    src: '/market-card-icons/logo-spacex.svg',
    fit: 'contain',
    padding: 8,
    background: 'linear-gradient(180deg, rgba(12, 20, 34, 0.96), rgba(10, 16, 28, 0.98))'
  },
  olympiacos: {
    src: '/market-card-icons/team-olympiacos.png',
    fit: 'contain',
    padding: 5,
    background: 'radial-gradient(circle at 30% 30%, rgba(185, 28, 28, 0.22), rgba(15, 23, 42, 0.98) 72%)'
  },
  panathinaikos: {
    src: '/market-card-icons/team-panathinaikos.png',
    fit: 'contain',
    padding: 5,
    background: 'radial-gradient(circle at 30% 30%, rgba(22, 163, 74, 0.24), rgba(15, 23, 42, 0.98) 72%)'
  },
  paok: {
    src: '/market-card-icons/team-paok.png',
    fit: 'contain',
    padding: 5,
    background: 'linear-gradient(180deg, rgba(22, 28, 38, 0.96), rgba(10, 16, 28, 0.98))'
  },
  aek: {
    src: '/market-card-icons/team-aek.png',
    fit: 'contain',
    padding: 5,
    background: 'radial-gradient(circle at 30% 30%, rgba(234, 179, 8, 0.22), rgba(15, 23, 42, 0.98) 72%)'
  }
} as const satisfies Record<string, MarketCardIconAsset>;

const SLUG_ICON_OVERRIDES = {
  'gre-economy-cpi-above-5-may2026': CATEGORY_IMAGES.economy,
  'gre-gas-unleaded-above-206-jun11-2026': CATEGORY_IMAGES.energy,
  'gre-markets-athex-general-index-2415-jun12-2026': CATEGORY_IMAGES.economy,
  'gre-weather-athens-33c-by-jun15-2026': CATEGORY_IMAGES.weather,
  'gre-social-heraklion-airport-protest-jun24-2026': CATEGORY_IMAGES.social,
  'gre-sports-zambidis-mayweather-win-jun27-2026': CATEGORY_IMAGES.sports,
  'gre-politics-samaras-new-party-before-jun30-2026': CATEGORY_IMAGES.politics,
  'global-us-invade-iran-by-jun30': ENTITY_ICONS.usIran,
  'gre-economy-unemployment-below-95-may2026': CATEGORY_IMAGES.economy,
  'gre-politics-election-before-2027': CATEGORY_IMAGES.politics,
  'global-albania-rama-ceases-pm-before-2027': ENTITY_ICONS.albania,
  'global-us-iran-final-agreement-checkpoints-2026': ENTITY_ICONS.usIran,
  'gre-football-greek-clubs-uefa-league-phase-2026-27': CATEGORY_IMAGES.sports
} as const satisfies Record<string, MarketCardIconAsset>;

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function includesAny(haystack: string, needles: readonly string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

function normalizedWords(value: string) {
  return ` ${value.replace(/[^a-z0-9]+/g, ' ').trim()} `;
}

function normalizePhrase(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, ' ').trim();
}

function includesPhrase(haystack: string, needles: readonly string[]) {
  return needles.some((needle) => {
    const normalizedNeedle = normalizePhrase(needle);
    return normalizedNeedle.length > 0 && haystack.includes(` ${normalizedNeedle} `);
  });
}

function collectAssetPaths(asset: MarketCardAssetPathCarrier) {
  const paths: string[] = [];

  if (asset.src) paths.push(asset.src);
  if (asset.leftSrc) paths.push(asset.leftSrc);
  if (asset.rightSrc) paths.push(asset.rightSrc);

  return paths;
}

export function listMarketCardIconAssetPaths() {
  const uniquePaths = new Set<string>();

  for (const asset of [...Object.values(CATEGORY_IMAGES), ...Object.values(ENTITY_ICONS)]) {
    for (const assetPath of collectAssetPaths(asset)) {
      uniquePaths.add(assetPath);
    }
  }

  return Array.from(uniquePaths).sort();
}

export function resolveMarketCardIcon(input: MarketCardIconInput): MarketCardIconAsset {
  const slug = normalize(input.slug);
  const category = normalize(input.category);
  const text = [input.question, input.title, input.subtitle, input.category].map(normalize).join(' ');
  const haystack = `${slug} ${text}`;
  const wordHaystack = normalizedWords(haystack);

  if (slug && slug in SLUG_ICON_OVERRIDES) {
    return SLUG_ICON_OVERRIDES[slug as keyof typeof SLUG_ICON_OVERRIDES];
  }

  if (
    includesPhrase(wordHaystack, ['iran']) &&
    includesPhrase(wordHaystack, ['us', 'usa', 'united states', 'america'])
  ) {
    return ENTITY_ICONS.usIran;
  }

  if (includesPhrase(wordHaystack, ['bitcoin', 'btc'])) return ENTITY_ICONS.bitcoin;
  if (includesPhrase(wordHaystack, ['spacex'])) return ENTITY_ICONS.spacex;
  if (includesPhrase(wordHaystack, ['olympiacos'])) return ENTITY_ICONS.olympiacos;
  if (includesPhrase(wordHaystack, ['panathinaikos'])) return ENTITY_ICONS.panathinaikos;
  if (includesPhrase(wordHaystack, ['paok'])) return ENTITY_ICONS.paok;
  if (includesPhrase(wordHaystack, ['aek'])) return ENTITY_ICONS.aek;
  if (includesPhrase(wordHaystack, ['albania', 'rama'])) return ENTITY_ICONS.albania;
  if (includesPhrase(wordHaystack, ['peru'])) return ENTITY_ICONS.peru;
  if (includesPhrase(wordHaystack, ['iran'])) return ENTITY_ICONS.iran;

  if (includesPhrase(wordHaystack, ['nato', 'ukraine', 'russia', 'ceasefire', 'invade', 'geopolitics', 'international', 'global'])) {
    return CATEGORY_IMAGES.global;
  }

  if (includesPhrase(wordHaystack, ['protest', 'strike', 'streaming', 'posts', 'social'])) return CATEGORY_IMAGES.social;
  if (includesPhrase(wordHaystack, ['gas', 'unleaded', 'fuel', 'petrol', 'energy'])) return CATEGORY_IMAGES.energy;
  if (includesPhrase(wordHaystack, ['weather', 'heatwave', 'rain', 'storm', 'temperature', 'hurricane'])) return CATEGORY_IMAGES.weather;
  if (includesPhrase(wordHaystack, ['uefa', 'superleague', 'football', 'soccer', 'euroleague', 'basket', 'final4', 'olympiacos', 'panathinaikos', 'paok', 'aek', 'zambidis'])) {
    return CATEGORY_IMAGES.sports;
  }

  if (includesPhrase(wordHaystack, ['bitcoin', 'btc', 'crypto', 'athex', 'index', 'stocks', 'banks', 'deposit', 'tourism', 'inflation', 'cpi', 'unemployment', 'economy'])) {
    return CATEGORY_IMAGES.economy;
  }

  if (includesPhrase(wordHaystack, ['ai', 'startup', 'tech', 'technology', 'spacex', 'rocket', 'satellite'])) return CATEGORY_IMAGES.tech;

  if (includesPhrase(wordHaystack, ['cabinet', 'tsipras', 'samaras', 'minister', 'politics', 'election', 'parliament'])) {
    return CATEGORY_IMAGES.politics;
  }

  switch (category) {
    case 'politics':
      return CATEGORY_IMAGES.politics;
    case 'economy':
    case 'markets':
    case 'crypto':
      return CATEGORY_IMAGES.economy;
    case 'weather':
      return CATEGORY_IMAGES.weather;
    case 'culture':
    case 'global':
      return CATEGORY_IMAGES.global;
    case 'social':
    case 'health':
      return CATEGORY_IMAGES.social;
    case 'sports':
      return CATEGORY_IMAGES.sports;
    case 'tech':
    case 'technology':
      return CATEGORY_IMAGES.tech;
    case 'energy':
    case 'gas':
      return CATEGORY_IMAGES.energy;
    default:
      return CATEGORY_IMAGES.global;
  }
}
