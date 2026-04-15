import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { ProbabilitySplit } from '@/components/probability-split';
import { loadMarketsBoard } from '@/lib/alpha-read-model';
import { formatCompact, formatPercent, formatRelativeHours } from '@/lib/format';

function labelize(value: string) {
  return value.replace(/[-_]/g, ' ');
}

export default async function HomePage() {
  const { markets, error } = await loadMarketsBoard();
  const openMarkets = markets.filter((market) => market.status === 'open');
  const featured = [...openMarkets]
    .sort((a, b) => (b.state?.volumeTotal ?? 0) - (a.state?.volumeTotal ?? 0))
    .slice(0, 2);

  const categories = ['Trending', ...Array.from(new Set(openMarkets.map((market) => labelize(market.category))))];

  return (
    <AlphaShell title="Home" eyebrow="Simple, fast, and mobile-first">
      {error ? <div className="notice noticeError">Live board unavailable: {error}</div> : null}

      <section className="categoryStrip" aria-label="Categories">
        {categories.map((category, index) => (
          <span key={category} className={index === 0 ? 'categoryPill categoryPillActive' : 'categoryPill'}>
            {category}
          </span>
        ))}
      </section>

      <section className="featuredSwipe" aria-label="Featured markets">
        {featured.map((market) => (
          <article className="card featuredCard" key={market.id}>
            <div className="featuredTopRow">
              <div>
                <p className="eyebrow">{labelize(market.category)}</p>
                <h2 className="marketQuestion">{market.question}</h2>
              </div>
              <div className="featuredChance">{formatPercent(market.state?.yesPrice ?? 0.5)}</div>
            </div>

            <ProbabilitySplit
              yesValue={market.state?.yesPrice ?? 0.5}
              noValue={market.state?.noPrice ?? 0.5}
              yesLabel="Yes"
              noLabel="No"
              formatValue={formatPercent}
            />

            <div className="buttonRow">
              <Link className="button buttonYes" href={`/markets/${market.slug}`}>
                Yes
              </Link>
              <Link className="button buttonNo" href={`/markets/${market.slug}`}>
                No
              </Link>
            </div>

            <p className="subtle">
              Vol {formatCompact(market.state?.volumeTotal ?? 0)} · closes {formatRelativeHours(market.closeTime)}
            </p>
          </article>
        ))}
      </section>

      <section className="card stackSm">
        <div className="statusRow statusRowStart">
          <div>
            <p className="eyebrow">Live markets</p>
            <h3>All open contracts</h3>
          </div>
          <span className="badgeNeutral">{openMarkets.length}</span>
        </div>

        <div className="stackSm">
          {openMarkets.map((market) => (
            <Link key={market.id} className="panelBlock" href={`/markets/${market.slug}`}>
              <div className="statusRow statusRowStart">
                <strong>{market.question}</strong>
                <span className="mutedText">{formatPercent(market.state?.yesPrice ?? 0.5)}</span>
              </div>
              <p className="subtle">
                {labelize(market.category)} · Vol {formatCompact(market.state?.volumeTotal ?? 0)} · closes{' '}
                {formatRelativeHours(market.closeTime)}
              </p>
            </Link>
          ))}

          {openMarkets.length === 0 ? <p className="subtle">No open markets right now.</p> : null}
        </div>
      </section>
    </AlphaShell>
  );
}
