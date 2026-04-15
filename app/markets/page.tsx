import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { ProbabilitySplit } from '@/components/probability-split';
import { loadMarketsBoard } from '@/lib/alpha-read-model';
import { formatCompact, formatDateTime, formatPercent, formatRelativeHours } from '@/lib/format';

function statusClass(status: string) {
  switch (status) {
    case 'open':
      return 'badgeYes';
    case 'paused':
    case 'closed':
      return 'badgeNo';
    default:
      return 'badgeNeutral';
  }
}

function labelize(value: string) {
  return value.replace(/[-_]/g, ' ');
}

export default async function MarketsPage() {
  const { markets, error } = await loadMarketsBoard();

  const liveMarkets = markets.filter((market) => market.status === 'open').length;
  const totalVolume = markets.reduce((sum, market) => sum + (market.state?.volumeTotal ?? 0), 0);
  const totalParticipants = markets.reduce((sum, market) => sum + (market.state?.participantsCount ?? 0), 0);
  const nextClosing = [...markets]
    .filter((market) => Boolean(market.closeTime))
    .sort((left, right) => new Date(left.closeTime).getTime() - new Date(right.closeTime).getTime())[0];

  return (
    <AlphaShell title="Markets" eyebrow="Live board">
      {error ? <div className="notice noticeError">Board data unavailable: {error}</div> : null}

      <section className="metricsGrid">
        <article className="card stackSm">
          <p className="eyebrow">Board state</p>
          <div className="metricValue">{liveMarkets}</div>
          <p className="subtle">Open contracts right now.</p>
        </article>
        <article className="card stackSm">
          <p className="eyebrow">Volume</p>
          <div className="metricValue">€{formatCompact(totalVolume)}</div>
          <p className="subtle">Total activity across open markets.</p>
        </article>
        <article className="card stackSm">
          <p className="eyebrow">Next close</p>
          <div className="metricValue">{nextClosing ? formatRelativeHours(nextClosing.closeTime) : '—'}</div>
          <p className="subtle">{nextClosing ? `${labelize(nextClosing.category)} · ${formatDateTime(nextClosing.closeTime)}` : 'No closing window returned yet.'}</p>
        </article>
      </section>

      <section className="card stackSm">
        <div className="statusRow statusRowStart">
          <div>
            <p className="eyebrow">Market board</p>
            <h2>Live contracts</h2>
          </div>
          <span className="badgeNeutral">{totalParticipants} tracked participants</span>
        </div>
        <p className="subtle">Browse, open a market, and trade from contract detail.</p>
      </section>

      <section className="marketBoard">
        {markets.map((market) => (
          <article className="card marketCard" key={market.id}>
            <div className="marketCardHeader">
              <div className="marketCardMeta">
                <span className="pill">{labelize(market.category)}</span>
                <span className={statusClass(market.status)}>{market.status}</span>
              </div>
              <span className="mutedText">closes {formatRelativeHours(market.closeTime)}</span>
            </div>

            <div className="stackSm">
              <h2 className="marketQuestion">
                <Link href={`/markets/${market.slug}`}>{market.question}</Link>
              </h2>
              <p className="subtle">Close window {formatDateTime(market.closeTime)}</p>
            </div>

            {market.state ? (
              <>
                <ProbabilitySplit
                  yesValue={market.state.yesPrice}
                  noValue={market.state.noPrice}
                  yesLabel="YES"
                  noLabel="NO"
                  formatValue={formatPercent}
                />
                <div className="metricGridCompact">
                  <div className="metricTile">
                    <div className="metricTileLabel">Volume</div>
                    <div className="metricTileValue">{formatCompact(market.state.volumeTotal)}</div>
                  </div>
                  <div className="metricTile">
                    <div className="metricTileLabel">Participants</div>
                    <div className="metricTileValue">{formatCompact(market.state.participantsCount)}</div>
                  </div>
                  <div className="metricTile">
                    <div className="metricTileLabel">Liquidity b</div>
                    <div className="metricTileValue">{formatCompact(market.liquidity)}</div>
                  </div>
                  <div className="metricTile">
                    <div className="metricTileLabel">Last trade</div>
                    <div className="metricTileValue metricTileValueSmall">{formatRelativeHours(market.state.lastTradeAt)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="notice noticeWarn">Market contract exists, but live state has not been returned yet.</div>
            )}

            <div className="buttonRow">
              <Link className="button buttonPrimary" href={`/markets/${market.slug}`}>
                Open contract
              </Link>
            </div>
          </article>
        ))}
      </section>

      {!error && markets.length === 0 ? (
        <section className="card">
          <p className="subtle">No markets returned yet.</p>
        </section>
      ) : null}
    </AlphaShell>
  );
}
