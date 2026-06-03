import Link from 'next/link';
import { ProbabilityRail } from '@/components/probability-rail';
import { marketHref, marketBoardTone, statusTone } from '@/components/market-card-shared';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeClose, formatRelativeTime } from '@/lib/format';
import { localizedCategory, localizedMarketStatus } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketCardProps = {
  market: BoardMarket;
  lang: UiLang;
};

export function MarketCard({ market, lang }: MarketCardProps) {
  const yesProb = market.state?.yesPrice ?? 0.5;
  const noProb = market.state?.noPrice ?? 1 - yesProb;
  const href = marketHref(market.slug, lang);
  const isMuted = market.status !== 'open';
  const volume = market.state?.volumeTotal ?? 0;

  return (
    <article className={`card marketListCard marketCardPoly standardMarketCard${isMuted ? ' marketCardMuted' : ''}`}>
      <Link className="marketCardHitArea" href={href} aria-label={market.question} />

      <div className="marketCardContent">
        <div className="marketMetaRow marketMetaRowTight">
          <span className="marketCategory">{localizedCategory(market.category, lang)}</span>
          <span className={statusTone(market.status)}>{localizedMarketStatus(market.status, lang)}</span>
          <span className="standardMarketState">{marketBoardTone(market.status, lang)}</span>
        </div>

        <h3 className={`marketQuestion standardMarketQuestion${lang === 'el' ? ' marketTitleGreek' : ''}`}>
          <Link className="marketTitleLink" href={href}>{market.question}</Link>
        </h3>

        <div className="standardMarketSignal">
          <div className="probabilityPrimary mantis-number">{formatPercent(yesProb)}</div>
          <div className="marketPricePair" aria-label={tr(lang, 'Market pricing', 'Τιμολόγηση αγοράς')}>
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

        <ProbabilityRail
          yesProbability={yesProb}
          volume={volume}
          status={market.status}
          showTicks
          size="sm"
          locale={lang}
          className="marketCardRail"
        />

        <div className="marketMiniMeta standardMarketMeta">
          {volume > 0 ? <span className="marketMiniMetaStrong">{tr(lang, 'Vol', 'Όγκος')} €{formatCompact(volume, lang)}</span> : null}
          <span>{tr(lang, 'Close', 'Λήξη')} {formatRelativeClose(market.closeTime, { lang })}</span>
          {market.state?.lastTradeAt ? <span>{tr(lang, 'Last trade', 'Τελευταία συναλλαγή')} {formatRelativeTime(market.state.lastTradeAt, lang)}</span> : null}
        </div>

        <div className="standardMarketFoot">
          <span>{tr(lang, 'Open market', 'Άνοιγμα αγοράς')}</span>
        </div>
      </div>
    </article>
  );
}
