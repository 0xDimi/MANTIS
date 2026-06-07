export type MarketCardIconInput = {
  slug?: string | null;
  question?: string | null;
  title?: string | null;
  subtitle?: string | null;
  category?: string | null;
};

export type MarketCardIconAsset = {
  src: string;
  position?: string;
};

const ASSETS = {
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

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

function includesAny(haystack: string, needles: readonly string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

export function resolveMarketCardIcon(input: MarketCardIconInput): MarketCardIconAsset {
  const slug = normalize(input.slug);
  const category = normalize(input.category);
  const text = [input.question, input.title, input.subtitle, input.category].map(normalize).join(' ');
  const haystack = `${slug} ${text}`;

  if (includesAny(haystack, ['iran'])) return ASSETS.iran;

  if (includesAny(haystack, ['nato', 'ukraine', 'russia', 'ceasefire', 'invade', 'geopolitics', 'international', 'global'])) {
    return ASSETS.global;
  }

  if (includesAny(haystack, ['protest', 'strike', 'streaming', 'posts', 'social'])) return ASSETS.social;
  if (includesAny(haystack, ['gas', 'unleaded', 'fuel', 'petrol', 'energy'])) return ASSETS.energy;
  if (includesAny(haystack, ['weather', 'heatwave', 'rain', 'storm', 'temperature', 'hurricane'])) return ASSETS.weather;
  if (includesAny(haystack, ['uefa', 'superleague', 'football', 'soccer', 'euroleague', 'basket', 'final4', 'olympiacos', 'panathinaikos', 'paok', 'aek', 'zambidis'])) {
    return ASSETS.sports;
  }

  if (includesAny(haystack, ['bitcoin', 'btc', 'crypto', 'athex', 'index', 'stocks', 'market', 'banks', 'deposit', 'tourism', 'inflation', 'cpi', 'unemployment', 'economy'])) {
    return ASSETS.economy;
  }

  if (includesAny(haystack, ['ai', 'startup', 'tech', 'technology', 'spacex', 'rocket', 'satellite'])) return ASSETS.tech;

  if (includesAny(haystack, ['cabinet', 'tsipras', 'samaras', 'minister', 'politics', 'election', 'parliament'])) {
    return ASSETS.politics;
  }

  switch (category) {
    case 'politics':
      return ASSETS.politics;
    case 'economy':
    case 'markets':
    case 'crypto':
      return ASSETS.economy;
    case 'weather':
      return ASSETS.weather;
    case 'culture':
    case 'global':
      return ASSETS.global;
    case 'social':
    case 'health':
      return ASSETS.social;
    case 'sports':
      return ASSETS.sports;
    case 'tech':
    case 'technology':
      return ASSETS.tech;
    case 'energy':
    case 'gas':
      return ASSETS.energy;
    default:
      return ASSETS.global;
  }
}
