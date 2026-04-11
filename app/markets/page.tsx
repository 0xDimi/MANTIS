import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { loadMarketsBoard } from '@/lib/alpha-read-model';

export default async function MarketsPage() {
  const { markets, error } = await loadMarketsBoard();

  return (
    <AlphaShell title="Markets build lane" eyebrow="Week 2 turns the board and market detail into real DB-backed views.">
      <section className="card">
        <p className="eyebrow">Live market board wiring</p>
        {error ? (
          <p className="subtle">Waiting on data wiring: {error}</p>
        ) : null}
        <div className="statusList">
          {markets.map((market) => (
            <div className="statusRow" key={market.id}>
              <div>
                <strong>
                  <Link href={`/markets/${market.slug}`}>{market.question}</Link>
                </strong>
                <p>
                  {market.category} · YES {Math.round((market.state?.yesPrice ?? 0) * 100)}% · NO{' '}
                  {Math.round((market.state?.noPrice ?? 0) * 100)}%
                </p>
              </div>
              <span className="badgeNeutral">depth {market.depth}</span>
            </div>
          ))}
          {!error && markets.length === 0 ? <p className="subtle">No markets returned yet.</p> : null}
        </div>
      </section>
    </AlphaShell>
  );
}
