import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { MarketQuotePreviewCard } from '@/components/market-quote-preview-card';
import { ProbabilitySplit } from '@/components/probability-split';
import { loadMarketDetail } from '@/lib/alpha-read-model';
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

export default async function MarketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { market, state, error } = await loadMarketDetail(slug);

  return (
    <AlphaShell
      title={market?.question ?? `Market detail · ${slug}`}
      eyebrow="Week 2 rebuild: contract detail now renders from GET /api/markets/[slug] with DB-backed rules, source, and live state panels."
    >
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
              </div>
            </article>
          </section>

          <section className="twoColGrid">
            <article className="card stackMd">
              <div>
                <p className="eyebrow">Live market state</p>
                <h3>Initial chart + state presentation</h3>
                <p className="subtle">This is the first real Week 2 state layer, showing current pricing and inventory directly from live market fields.</p>
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
                <h3>DB-backed trust layer</h3>
                <p className="subtle">Primary source, fallback path, and void rule now render from market records instead of hardcoded demo copy.</p>
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
              </div>
            </article>
          </section>

          <section>
            <MarketQuotePreviewCard
              marketId={market.id}
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
