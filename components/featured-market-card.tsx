'use client';

import Link from 'next/link';
import { ProbabilityRail } from '@/components/probability-rail';
import { marketHref, marketBoardTone, statusTone } from '@/components/market-card-shared';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeClose, formatRelativeTime } from '@/lib/format';
import { localizedCategory, localizedMarketStatus } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type FeaturedMarketCardProps = {
  market: BoardMarket;
  lang: UiLang;
  lead?: boolean;
};

export function FeaturedMarketCard({ market, lang, lead = false }: FeaturedMarketCardProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const noProb = market.state?.noPrice ?? 1 - yesProb;
  const href = marketHref(market.slug, lang);
  const volume = market.state?.volumeTotal ?? 0;

  return (
    <article className={`card featuredDistinctCard${lead ? ' featuredDistinctLead' : ' featuredDistinctFollow'}`}>
      <Link className="marketCardHitArea" href={href} aria-label={market.question} />

      <div className="featuredDistinctShell">
        <div className="featuredDistinctTop">
          <span className="marketCategory">{localizedCategory(market.category, lang)}</span>
          <span className={statusTone(market.status)}>{localizedMarketStatus(market.status, lang)}</span>
        </div>

        <div className="featuredDistinctBody">
          <h2 className={`featuredDistinctTitle${lang === 'el' ? ' marketTitleGreek' : ''}`}>
            <Link className="marketTitleLink" href={href}>{market.question}</Link>
          </h2>
          <div className="featuredDistinctContextRow">
            <span>{marketBoardTone(market.status, lang)}</span>
            <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(market.closeTime, { lang })}</span>
            {market.state?.lastTradeAt ? <span>{tr(lang, 'Trade', 'Συναλλαγή')} {formatRelativeTime(market.state.lastTradeAt, lang)}</span> : null}
          </div>
        </div>

        <div className="featuredDistinctSignal">
          <div className="featuredDistinctForecast">
            <span className="featuredDistinctForecastLabel">{tr(lang, 'Forecast', 'Πρόβλεψη')}</span>
            <strong className="featuredDistinctForecastValue mantis-number">{formatPercent(yesProb)}</strong>
          </div>
          <ProbabilityRail
            yesProbability={yesProb}
            volume={volume}
            status={market.status}
            showTicks
            size="lg"
            locale={lang}
            className="featuredDistinctRail"
          />
          <div className="marketPricePair featuredDistinctPricePair" aria-label={tr(lang, 'Market pricing', 'Τιμολόγηση αγοράς')}>
            <span className="marketPriceChip marketPriceChipYes">
              <em>{tr(lang, 'YES', 'ΝΑΙ')}</em>
              <strong className="mantis-number">{Math.round(yesProb * 100)}¢</strong>
            </span>
            <span className="marketPriceChip marketPriceChipNo">
              <em>{tr(lang, 'NO', 'ΟΧΙ')}</em>
              <strong className="mantis-number">{Math.round(noProb * 100)}¢</strong>
            </span>
          </div>
        </div>

        <div className="featuredDistinctMeta">
          {volume > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume, lang)}</span> : null}
          <span>{tr(lang, 'Liquidity', 'Ρευστότητα')} €{formatCompact(market.liquidity, lang)}</span>
        </div>

        <div className="featuredDistinctFoot">
          <Link className="featuredOpenLink" href={href}>{tr(lang, 'Open market', 'Άνοιγμα αγοράς')}</Link>
        </div>
      </div>

      <span className="featuredMantisMark" aria-hidden="true">MANTIS · CURATED</span>
    </article>
  );
}
