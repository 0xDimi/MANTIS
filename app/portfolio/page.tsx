import { AlphaShell } from '@/components/alpha-shell';
import { loadPortfolioOverview } from '@/lib/alpha-read-model';

export default async function PortfolioPage() {
  const portfolio = await loadPortfolioOverview();

  return (
    <AlphaShell title="Portfolio lane" eyebrow="Portfolio API wiring is in, with live auth-dependent reads.">
      <section className="heroGrid">
        <article className="card">
          <p className="eyebrow">Live summary</p>
          {portfolio.error ? <p className="subtle">Waiting on data wiring: {portfolio.error}</p> : null}
          {!portfolio.auth ? <p className="subtle">Sign in required to load wallet and positions.</p> : null}
          <ul>
            <li>
              wallet: {portfolio.wallet ? `${portfolio.wallet.available_balance} ${portfolio.wallet.currency}` : 'pending'}
            </li>
            <li>open positions: {portfolio.positionsCount}</li>
            <li>trade history count: {portfolio.tradesCount}</li>
            <li>starting balance policy: €1,000</li>
          </ul>
        </article>
        <article className="card">
          <p className="eyebrow">Wiring status</p>
          <div className="statusList">
            <div className="statusRow"><span>ledger model</span><span className="badgeYes">wired</span></div>
            <div className="statusRow"><span>portfolio summary API</span><span className="badgeYes">/api/portfolio/summary</span></div>
            <div className="statusRow"><span>trade history API</span><span className="badgeYes">/api/trades/history</span></div>
          </div>
        </article>
      </section>
    </AlphaShell>
  );
}
