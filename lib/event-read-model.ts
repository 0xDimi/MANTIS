import type { UiLang } from '@/lib/ui-lang';

export type EventStatus = 'open' | 'closed' | 'under_review' | 'resolved' | 'settled' | 'void';

export type EventChildRead = {
  outcomeId: string;
  marketId: string;
  slug: string;
  closeTime: string;
  outcomeKey: string;
  label: string;
  shortLabel: string | null;
  description: string | null;
  childQuestion: string;
  displayOrder: number;
  status: string;
  yesPrice: number;
  noPrice: number;
  volumeTotal: number;
  openInterest: number;
  participantsCount: number;
  lastTradeAt: string | null;
  userPosition?: {
    yesShares: number;
    noShares: number;
    marketValue: number;
    unrealizedPnl: number;
  };
};

export type EventCardRead = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  status: EventStatus;
  outcomeStructure: 'independent_cluster';
  resolutionMode: 'child_independent';
  closeTime: string;
  determinationTime: string | null;
  childCount: number;
  activeChildCount: number;
  topChildren: Array<Pick<EventChildRead, 'marketId' | 'slug' | 'outcomeKey' | 'label' | 'yesPrice' | 'noPrice' | 'status'>>;
  volumeTotal: number;
  openInterest: number;
  expectedYesCount: number;
  explanation: 'multiple_can_resolve_yes';
};

export type EventDetailRead = {
  event: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    category: string;
    tags: string[];
    status: EventStatus;
    eventType: 'grouped_binary';
    outcomeStructure: 'independent_cluster';
    resolutionMode: 'child_independent';
    closeTime: string;
    determinationTime: string | null;
    sourcePrimary: string;
    sourceFallback: string | null;
    resolutionRule: string;
    voidRule: string;
    educationCopy: string;
    userEducationKey: 'multiple_can_resolve_yes';
  };
  children: EventChildRead[];
  aggregate: {
    childCount: number;
    activeChildCount: number;
    expectedYesCount: number;
    volumeTotal: number;
    openInterest: number;
    userEventExposure?: number;
  };
  serverTime: string;
};

export function eventEducationCopy(lang: UiLang) {
  return lang === 'el'
    ? 'Περισσότερες από μία αγορές μπορούν να κλείσουν στο ΝΑΙ. Κάθε γραμμή είναι ξεχωριστή αγορά ΝΑΙ/ΟΧΙ με δική της τιμή.'
    : 'Multiple markets can resolve YES. Each row is a separate YES/NO market with its own price.';
}

export function normalizeEventStatus(status: string): EventStatus {
  if (status === 'closed' || status === 'under_review' || status === 'resolved' || status === 'settled' || status === 'void') {
    return status;
  }

  return 'open';
}

export function roundMetric(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}
