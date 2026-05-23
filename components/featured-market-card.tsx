'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeClose, formatRelativeTime } from '@/lib/format';
import { localizedCategory, localizedMarketStatus, localizedOutcomeLabel } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type FeaturedMarketCardProps = {
  market: BoardMarket;
  lang: UiLang;
  lead?: boolean;
};

const contextByCategory: Record<string, { en: string; el: string }> = {
  politics: {
    en: 'Policy shifts can reprice this market fast if narrative momentum flips.',
    el: 'Οι πολιτικές μετατοπίσεις μπορούν να αλλάξουν γρήγορα την τιμολόγηση αν αλλάξει η δυναμική.'
  },
  economy: {
    en: 'Macro prints and policy tone are the main drivers for this contract.',
    el: 'Οι μακροοικονομικές ανακοινώσεις και ο τόνος πολιτικής είναι οι βασικοί οδηγοί.'
  },
  weather: {
    en: 'Official station updates can move implied odds quickly near the deadline.',
    el: 'Οι επίσημες μετεωρολογικές ενημερώσεις μετακινούν γρήγορα τις πιθανότητες κοντά στη λήξη.'
  },
  technology: {
    en: 'Company guidance and product timing updates are the key catalysts.',
    el: 'Οι ενημερώσεις για καθοδήγηση εταιρειών και χρονοδιάγραμμα προϊόντων είναι οι βασικοί καταλύτες.'
  }
};

function statusTone(status: string) {
  if (status === 'open') return 'badgeYes';
  if (status === 'resolved' || status === 'settled') return 'badgeNeutral';
  return 'badgeNo';
}

function marketHref(slug: string, lang: UiLang, side?: 'yes' | 'no') {
  const params = new URLSearchParams();
  if (lang === 'el') params.set('lang', 'el');
  if (side) params.set('side', side);

  const query = params.toString();
  return `/markets/${slug}${query ? `?${query}` : ''}`;
}

export function FeaturedMarketCard({ market, lang, lead = false }: FeaturedMarketCardProps) {
  const [newsOpen, setNewsOpen] = useState(false);
  const yesProb = market.state?.yesPrice ?? 0.5;
  const noProb = market.state?.noPrice ?? 1 - yesProb;
  const yesCents = Math.round(yesProb * 100);
  const noCents = Math.round(noProb * 100);
  const href = marketHref(market.slug, lang);
  const volume = market.state?.volumeTotal ?? 0;
  const yesLabel = localizedOutcomeLabel('yes', 'yes', lang);
  const noLabel = localizedOutcomeLabel('no', 'no', lang);
  const context = contextByCategory[market.category.toLowerCase()] ?? {
    en: 'Watch for new verified updates, this market can reprice quickly close to deadline.',
    el: 'Παρακολούθησε τις νέες επιβεβαιωμένες ενημερώσεις, αυτή η αγορά μπορεί να ανατιμολογηθεί γρήγορα κοντά στη λήξη.'
  };
  const featuredNews = market.featuredNews ?? null;

  useEffect(() => {
    if (!newsOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setNewsOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [newsOpen]);

  return (
    <article className={`card featuredDistinctCard${lead ? ' featuredDistinctLead' : ' featuredDistinctFollow'}`}>
      <Link className="marketCardHitArea" href={href} aria-label={market.question} />

      <div className="featuredDistinctShell">
        <div className="featuredDistinctTop">
          <span className="marketCategory">{localizedCategory(market.category, lang)}</span>
          <span className={statusTone(market.status)}>{localizedMarketStatus(market.status, lang)}</span>
        </div>

        <div className="featuredDistinctBody">
          <h2 className="featuredDistinctTitle">
            <Link className="marketTitleLink" href={href}>{market.question}</Link>
          </h2>
          <p className="featuredDistinctContext">{lang === 'el' ? context.el : context.en}</p>
        </div>

        <div className="featuredDistinctSignal">
          <div className="featuredDistinctForecast">
            <span className="featuredDistinctForecastLabel">{tr(lang, 'Forecast', 'Πρόβλεψη')}</span>
            <strong className="featuredDistinctForecastValue">{formatPercent(yesProb)}</strong>
          </div>
          <div className="featuredDistinctTrack" aria-hidden="true">
            <span style={{ width: `${Math.round(yesProb * 100)}%` }} />
          </div>
        </div>

        <div className="featuredDistinctMeta">
          {volume > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume, lang)}</span> : null}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(market.closeTime, { lang })}</span>
          {market.state?.lastTradeAt ? <span>{tr(lang, 'Trade', 'Συναλλαγή')} {formatRelativeTime(market.state.lastTradeAt, lang)}</span> : null}
        </div>

        {featuredNews ? (
          <button
            className="featuredNewsRow"
            type="button"
            onClick={() => setNewsOpen(true)}
            aria-haspopup="dialog"
            aria-label={`${tr(lang, 'Open news context', 'Άνοιγμα επικαιρότητας')}: ${featuredNews.headline}`}
          >
            <span className="featuredNewsLabel">{tr(lang, 'News', 'Νέα')}</span>
            <span className="featuredNewsHeadline">{featuredNews.headline}</span>
            <span className="featuredNewsTime">{formatRelativeTime(featuredNews.publishedAt, lang)}</span>
          </button>
        ) : null}

        <div className="featuredDistinctActions">
          <Link className="button buttonYes featuredActionBtn" href={marketHref(market.slug, lang, 'yes')}>
            <span>{yesLabel}</span>
            <strong>{yesCents}¢</strong>
          </Link>
          <Link className="button buttonNo featuredActionBtn" href={marketHref(market.slug, lang, 'no')}>
            <span>{noLabel}</span>
            <strong>{noCents}¢</strong>
          </Link>
        </div>
      </div>

      <span className="featuredMantisMark" aria-hidden="true">MANTIS · CURATED</span>

      {featuredNews && newsOpen ? (
        <div className="alphaModalOverlay featuredNewsOverlay" role="dialog" aria-modal="true" aria-labelledby={`featured-news-${market.id}`} onClick={() => setNewsOpen(false)}>
          <div className="card alphaModalCard featuredNewsModal" onClick={(event) => event.stopPropagation()}>
            <div className="featuredNewsModalTop">
              <span className="featuredNewsModalEyebrow">{tr(lang, 'Market context', 'Πλαίσιο αγοράς')}</span>
              <button
                className="featuredNewsClose"
                type="button"
                onClick={() => setNewsOpen(false)}
                aria-label={tr(lang, 'Close news context', 'Κλείσιμο επικαιρότητας')}
              >
                ×
              </button>
            </div>
            <h2 id={`featured-news-${market.id}`}>{featuredNews.headline}</h2>
            <p>{featuredNews.summary}</p>
            <span className="featuredNewsModalTime">{formatRelativeTime(featuredNews.publishedAt, lang)}</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}
