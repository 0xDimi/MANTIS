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

function includesPhrase(haystack: string, needles: readonly string[]) {
  return needles.some((needle) => haystack.includes(` ${needle} `));
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

  if (
    includesAny(haystack, ['iran']) &&
    includesPhrase(wordHaystack, ['us', 'usa', 'united states', 'america'])
  ) {
    return ENTITY_ICONS.usIran;
  }

  if (includesAny(haystack, ['bitcoin', 'btc'])) return ENTITY_ICONS.bitcoin;
  if (includesAny(haystack, ['spacex'])) return ENTITY_ICONS.spacex;
  if (includesAny(haystack, ['olympiacos'])) return ENTITY_ICONS.olympiacos;
  if (includesAny(haystack, ['panathinaikos'])) return ENTITY_ICONS.panathinaikos;
  if (includesAny(haystack, ['paok'])) return ENTITY_ICONS.paok;
  if (includesAny(haystack, ['aek'])) return ENTITY_ICONS.aek;
  if (includesAny(haystack, ['albania', 'rama'])) return ENTITY_ICONS.albania;
  if (includesAny(haystack, ['peru'])) return ENTITY_ICONS.peru;
  if (includesAny(haystack, ['iran'])) return ENTITY_ICONS.iran;

  if (includesAny(haystack, ['nato', 'ukraine', 'russia', 'ceasefire', 'invade', 'geopolitics', 'international', 'global'])) {
    return CATEGORY_IMAGES.global;
  }

  if (includesAny(haystack, ['protest', 'strike', 'streaming', 'posts', 'social'])) return CATEGORY_IMAGES.social;
  if (includesAny(haystack, ['gas', 'unleaded', 'fuel', 'petrol', 'energy'])) return CATEGORY_IMAGES.energy;
  if (includesAny(haystack, ['weather', 'heatwave', 'rain', 'storm', 'temperature', 'hurricane'])) return CATEGORY_IMAGES.weather;
  if (includesAny(haystack, ['uefa', 'superleague', 'football', 'soccer', 'euroleague', 'basket', 'final4', 'olympiacos', 'panathinaikos', 'paok', 'aek', 'zambidis'])) {
    return CATEGORY_IMAGES.sports;
  }

  if (includesAny(haystack, ['bitcoin', 'btc', 'crypto', 'athex', 'index', 'stocks', 'market', 'banks', 'deposit', 'tourism', 'inflation', 'cpi', 'unemployment', 'economy'])) {
    return CATEGORY_IMAGES.economy;
  }

  if (includesAny(haystack, ['ai', 'startup', 'tech', 'technology', 'spacex', 'rocket', 'satellite'])) return CATEGORY_IMAGES.tech;

  if (includesAny(haystack, ['cabinet', 'tsipras', 'samaras', 'minister', 'politics', 'election', 'parliament'])) {
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
