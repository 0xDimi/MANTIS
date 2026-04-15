import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { MarketQuotePreviewCard } from '@/components/market-quote-preview-card';
import { ProbabilitySplit } from '@/components/probability-split';
import { loadMarketDetail } from '@/lib/alpha-read-model';
import { formatCompact, formatDateTime, formatPercent, formatRelativeHours } from '@/lib/format';

function statusClass(status: string) {
  switch (status) {
    case 'open':
    case 'resolved':
    case 'settled':
      return 'badgeYes';
    case 'paused':
    case 'closed':
    case 'void':
      return 'badgeNo';
    default:
      return 'badgeNeutral';
  }
}

function labelize(value: string) {
  return value.replace(/[-_]/g, ' ');
}

export default async function MarketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { market, state, error } = await loadMarketDetail(slug);

  return (
    <AlphaShell title={market?.question ?? `Market detail · ${slug}`} eyebrow="Contract detail">
      <div className="buttonRow">
        <Link className="button buttonGhost" href="/markets">
          Back to markets
        </Link>
      </div>

      {error ? <div className="notice noticeError">Contract data unavailable: {error}</div> : null}

      {market ? (
        <>
          <section className="heroGrid">
            <article className="card stackSm">
              <div className="detailTitleRow">
                <div>
                  <p className="eyebrow">Contract snapshot</p>
                  <h2>{market.question}</h2>
                </div>
                <span className={statusClass(market.status)}>{market.status}</span>
              </div>
              <p className="panelText">{market.description ?? 'No market description has been published yet.'}</p>
              <div className="metricGridCompact">
                <div className="metricTile">
                  <div className="metricTileLabel">Category</div>
                  <div className="metricTileValue metricTileValueSmall">{labelize(market.category)}</div>
                </div>
                <div className="metricTile">
                  <div className="metricTileLabel">Liquidity b</div>
                  <div className="metricTileValue">{formatCompact(market.liquidity)}</div>
                </div>
                <div className="metricTile">
                  <div className="metricTileLabel">Close time</div>
                  <div className="metricTileValue metricTileValueSmall">{formatDateTime(market.closeTime)}</div>
                </div>
                <div className="metricTile">
                  <div className="metricTileLabel">Target resolve</div>
                  <div className="metricTileValue metricTileValueSmall">{formatDateTime(market.resolutionTime)}</div>
                </div>
              </div>
            </article>

            <article className="card stackSm">
              <p className="eyebrow">Market contract</p>
              <div className="statusList">
                <div className="statusRow">
                  <span>YES label</span>
                  <span className="badgeYes">{market.yesLabel}</span>
                </div>
                <div className="statusRow">
                  <span>NO label</span>
                  <span className="badgeNo">{market.noLabel}</span>
                </div>
                <div className="statusRow">
                  <span>Trading fee</span>
                  <span className="badgeNeutral">{market.feeBps} bps</span>
                </div>
                <div className="statusRow">
                  <span>Server detail route</span>
                  <span className="badgeNeutral">/api/markets/{market.slug}</span>
                </div>
                <div className="statusRow">
                  <span>Window status</span>
                  <span className="badgeNeutral">closes {formatRelativeHours(market.closeTime)}</span>
                </div>
                {market.resolution ? (
                  <>
                    <div className="statusRow">
                      <span>Resolution outcome</span>
                      <span className={market.resolution.outcome === 'yes' ? 'badgeYes' : 'badgeNo'}>{market.resolution.outcome}</span>
                    </div>
                    <div className="statusRow">
                      <span>Resolution recorded</span>
                      <span className="badgeNeutral">{formatDateTime(market.resolution.createdAt)}</span>
                    </div>
                  </>
                ) : null}
                {market.settlement ? (
                  <>
                    <div className="statusRow">
                      <span>Settlement recorded</span>
                      <span className="badgeNeutral">{formatDateTime(market.settlement.createdAt)}</span>
                    </div>
                    <div className="statusRow">
                      <span>Affected accounts</span>
                      <span className="badgeNeutral">{formatCompact(market.settlement.affectedAccounts)}</span>
                    </div>
                  </>
                ) : null}
              </div>
            </article>
          </section>

          <section className="twoColGrid">
            <article className="card stackMd">
              <div>
                <p className="eyebrow">Live market state</p>
                <h3>Pricing and activity</h3>
                <p className="subtle">Current probability, inventory, and volume.</p>
              </div>

              {state ? (
                <>
                  <div className="stackSm">
                    <div className="splitSectionLabel">Current probability</div>
                    <ProbabilitySplit
                      yesValue={state.yesPrice}
                      noValue={state.noPrice}
                      yesLabel={market.yesLabel}
                      noLabel={market.noLabel}
                      formatValue={formatPercent}
                    />
                  </div>

                  <div className="stackSm">
                    <div className="splitSectionLabel">Inventory depth snapshot</div>
                    <ProbabilitySplit
                      yesValue={state.qYes}
                      noValue={state.qNo}
                      yesLabel="q_yes"
                      noLabel="q_no"
                      formatValue={formatCompact}
                      compact
                    />
                  </div>

                  <div className="metricGridCompact">
                    <div className="metricTile">
                      <div className="metricTileLabel">Volume total</div>
                      <div className="metricTileValue">€{formatCompact(state.volumeTotal)}</div>
                    </div>
                    <div className="metricTile">
                      <div className="metricTileLabel">Open interest</div>
                      <div className="metricTileValue">€{formatCompact(state.openInterest)}</div>
                    </div>
                    <div className="metricTile">
                      <div className="metricTileLabel">Participants</div>
                      <div className="metricTileValue">{formatCompact(state.participantsCount)}</div>
                    </div>
                    <div className="metricTile">
                      <div className="metricTileLabel">Last trade</div>
                      <div className="metricTileValue metricTileValueSmall">{formatRelativeHours(state.lastTradeAt)}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="notice noticeWarn">No live market_state row has been returned yet for this contract.</div>
              )}
            </article>

            <article className="card stackMd">
              <div>
                <p className="eyebrow">Rules + source</p>
                <h3>Resolution rules</h3>
                <p className="subtle">Primary source, fallback source, and void rule.</p>
              </div>

              <div className="stackSm">
                <div className="panelBlock">
                  <div className="splitSectionLabel">Primary source</div>
                  <p className="panelText">{market.sourcePrimary}</p>
                </div>
                <div className="panelBlock">
                  <div className="splitSectionLabel">Fallback source</div>
                  <p className="panelText">{market.sourceFallback ?? 'No fallback source specified.'}</p>
                </div>
                <div className="panelBlock">
                  <div className="splitSectionLabel">Void rule</div>
                  <p className="panelText">{market.voidRule}</p>
                </div>
                {market.resolution ? (
                  <div className="panelBlock">
                    <div className="splitSectionLabel">Resolution evidence</div>
                    <p className="panelText">{market.resolution.evidenceSummary}</p>
                    <p className="panelText">{market.resolution.evidenceUrl ?? 'No evidence URL recorded.'}</p>
                  </div>
                ) : null}
                {market.settlement ? (
                  <div className="panelBlock">
                    <div className="splitSectionLabel">Settlement closeout</div>
                    <p className="panelText">
                      Final payout {`€${formatCompact(market.settlement.totalPayout)}`} · refund {`€${formatCompact(market.settlement.totalRefund)}`} · realized PnL {`€${formatCompact(market.settlement.totalRealizedPnl)}`}.
                    </p>
                    <p className="panelText">Affected accounts: {market.settlement.affectedAccounts}. Settled at {formatDateTime(market.settlement.createdAt)}.</p>
                  </div>
                ) : null}
              </div>
            </article>
          </section>

          <section>
            <MarketQuotePreviewCard
              marketId={market.id}
              marketSlug={market.slug}
              marketStatus={market.status}
              closeTime={market.closeTime}
              yesLabel={market.yesLabel}
              noLabel={market.noLabel}
            />
          </section>
        </>
      ) : (
        <section className="card stackSm">
          <p className="eyebrow">Market detail</p>
          <h2>Contract not found</h2>
          <p className="subtle">The requested market slug did not resolve to a live contract.</p>
        </section>
      )}
    </AlphaShell>
  );
}
