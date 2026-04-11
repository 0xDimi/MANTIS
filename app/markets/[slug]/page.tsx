import { AlphaShell } from '@/components/alpha-shell';
import { loadMarketDetail } from '@/lib/alpha-read-model';

export default async function MarketDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { market, state, error } = await loadMarketDetail(slug);

  return (
    <AlphaShell
      title={`Market detail · ${slug}`}
      eyebrow="Server-backed contract page with quote/trade foundation now wired."
    >
      <section className="heroGrid">
        <article className="card">
          <p className="eyebrow">Contract snapshot</p>
          {error ? <p className="subtle">Waiting on data wiring: {error}</p> : null}
          <div className="statusList">
            <div className="statusRow">
              <span>question</span>
              <span className="badgeNeutral">{market?.question ?? 'pending'}</span>
            </div>
            <div className="statusRow">
              <span>status</span>
              <span className="badgeNeutral">{market?.status ?? 'pending'}</span>
            </div>
            <div className="statusRow">
              <span>YES / NO</span>
              <span className="badgeNeutral">
                {state ? `${Math.round(state.yesPrice * 100)}% / ${Math.round(state.noPrice * 100)}%` : 'pending'}
              </span>
            </div>
            <div className="statusRow">
              <span>quote endpoint</span>
              <span className="badgeYes">/api/quotes/preview</span>
            </div>
            <div className="statusRow">
              <span>execution endpoint</span>
              <span className="badgeYes">/api/trades/execute</span>
            </div>
          </div>
        </article>
        <article className="card">
          <p className="eyebrow">Rules + source</p>
          <p>{market?.void_rule ?? 'Void rule pending env wiring.'}</p>
          <div className="codeBlock">{market?.source_primary ?? 'Primary source pending'}</div>
        </article>
      </section>
    </AlphaShell>
  );
}
