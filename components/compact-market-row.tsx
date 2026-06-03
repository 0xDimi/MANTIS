import Link from 'next/link';
import { ProbabilityRail } from '@/components/probability-rail';
import { marketHref, marketBoardTone, statusTone } from '@/components/market-card-shared';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeClose, formatRelativeTime } from '@/lib/format';
import { localizedCategory, localizedMarketStatus } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type CompactMarketRowProps = {
  market: BoardMarket;
  lang: UiLang;
};

export function CompactMarketRow({ market, lang }: CompactMarketRowProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const noProb = market.state?.noPrice ?? 1 - yesProb;
  const volume = market.state?.volumeTotal ?? 0;
  const href = marketHref(market.slug, lang);

  return (
    <article className="card compactMarketRow">
      <Link className="marketCardHitArea" href={href} aria-label={market.question} />

      <div className="compactMarketPrimary">
        <div className="marketMetaRow marketMetaRowTight compactMarketMetaRow">
          <span className="marketCategory">{localizedCategory(market.category, lang)}</span>
          <span className={statusTone(market.status)}>{localizedMarketStatus(market.status, lang)}</span>
          <span className="compactMarketState">{marketBoardTone(market.status, lang)}</span>
        </div>

        <h3 className={`marketQuestion compactMarketQuestion${lang === 'el' ? ' marketTitleGreek' : ''}`}>
          <Link className="marketTitleLink" href={href}>
            {market.question}
          </Link>
        </h3>

        <div className="compactMarketMeta">
          {volume > 0 ? <span>{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume, lang)}</span> : null}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(market.closeTime, { lang })}</span>
          {market.state?.lastTradeAt ? <span>{tr(lang, 'Last trade', 'Τελευταία συναλλαγή')} {formatRelativeTime(market.state.lastTradeAt, lang)}</span> : null}
        </div>
      </div>

      <div className="compactMarketSignal">
        <div className="compactMarketProbability">
          <span className="compactMarketProbabilityLabel">{tr(lang, 'YES', 'ΝΑΙ')}</span>
          <strong className="mantis-number">{formatPercent(yesProb)}</strong>
        </div>

        <ProbabilityRail
          yesProbability={yesProb}
          volume={volume}
          status={market.status}
          showTicks
          size="sm"
          locale={lang}
          className="compactMarketRail"
        />
      </div>

      <div className="compactMarketPricing">
        <div className="marketPricePair compactMarketPricePair" aria-label={tr(lang, 'Market pricing', 'Τιμολόγηση αγοράς')}>
          <span className="marketPriceChip marketPriceChipYes">
            <em>{tr(lang, 'YES', 'ΝΑΙ')}</em>
            <strong className="mantis-number">{Math.round(yesProb * 100)}¢</strong>
          </span>
          <span className="marketPriceChip marketPriceChipNo">
            <em>{tr(lang, 'NO', 'ΟΧΙ')}</em>
            <strong className="mantis-number">{Math.round(noProb * 100)}¢</strong>
          </span>
        </div>

        <span className="compactMarketOpenLink">
          {tr(lang, 'Open market', 'Άνοιγμα αγοράς')}
        </span>
      </div>
    </article>
  );
}
