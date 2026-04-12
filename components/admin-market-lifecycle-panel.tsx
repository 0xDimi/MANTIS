'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllowedLifecycleTransitions } from '@/lib/admin-market-ops';
import { formatDateTime, formatRelativeHours } from '@/lib/format';

type AdminMarketRecord = {
  id: string;
  slug: string;
  question: string;
  category: string;
  status: 'draft' | 'open' | 'paused' | 'closed' | 'resolved' | 'settled' | 'void';
  closeTime: string;
  resolutionTime: string | null;
};

function statusClass(status: AdminMarketRecord['status']) {
  switch (status) {
    case 'open':
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

export function AdminMarketLifecyclePanel({ markets }: { markets: AdminMarketRecord[] }) {
  const router = useRouter();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    return markets.reduce(
      (acc, market) => {
        acc.total += 1;
        acc[market.status] += 1;
        return acc;
      },
      {
        total: 0,
        draft: 0,
        open: 0,
        paused: 0,
        closed: 0,
        resolved: 0,
        settled: 0,
        void: 0
      }
    );
  }, [markets]);

  async function handleTransition(marketId: string, targetStatus: string) {
    setPendingKey(`${marketId}:${targetStatus}`);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/markets/${marketId}/status`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ targetStatus })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to update market status');
      }

      setMessage(`${payload.market?.question ?? 'Market'} moved to ${payload.market?.status ?? targetStatus}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update market status');
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="stackMd">
      <section className="card stackSm">
        <div>
          <p className="eyebrow">Lifecycle snapshot</p>
          <h3>Live status controls on rebuilt routes</h3>
          <p className="subtle">Only draft, open, paused, and closed transitions are enabled here. Resolution remains on the dedicated queue.</p>
        </div>
        <div className="metricGridCompact">
          <div className="metricTile">
            <div className="metricTileLabel">Total markets</div>
            <div className="metricTileValue">{summary.total}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">Open</div>
            <div className="metricTileValue">{summary.open}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">Paused</div>
            <div className="metricTileValue">{summary.paused}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">Closed pending resolution</div>
            <div className="metricTileValue">{summary.closed}</div>
          </div>
        </div>
        {message ? <div className="notice noticeSuccess">{message}</div> : null}
        {error ? <div className="notice noticeError">{error}</div> : null}
      </section>

      <section className="marketBoard">
        {markets.map((market) => {
          const allowedTransitions = getAllowedLifecycleTransitions({
            status: market.status,
            closeTime: market.closeTime
          });

          return (
            <article className="card marketCard" key={market.id}>
              <div className="marketCardHeader">
                <div>
                  <p className="eyebrow">{labelize(market.category)}</p>
                  <h3 className="marketQuestion">{market.question}</h3>
                </div>
                <span className={statusClass(market.status)}>{market.status}</span>
              </div>

              <div className="statusList">
                <div className="statusRow">
                  <span>Slug</span>
                  <span className="badgeNeutral">{market.slug}</span>
                </div>
                <div className="statusRow">
                  <span>Close time</span>
                  <span className="badgeNeutral">{formatDateTime(market.closeTime)}</span>
                </div>
                <div className="statusRow">
                  <span>Window</span>
                  <span className="badgeNeutral">{formatRelativeHours(market.closeTime)}</span>
                </div>
                <div className="statusRow">
                  <span>Target resolve</span>
                  <span className="badgeNeutral">{formatDateTime(market.resolutionTime)}</span>
                </div>
              </div>

              <div className="stackSm">
                <div className="splitSectionLabel">Lifecycle controls</div>
                {allowedTransitions.length ? (
                  <div className="buttonRow">
                    {allowedTransitions.map((targetStatus) => {
                      const key = `${market.id}:${targetStatus}`;
                      const pending = pendingKey === key;

                      return (
                        <button
                          key={targetStatus}
                          className={`button ${targetStatus === 'closed' ? 'buttonGhost' : 'buttonPrimary'}`}
                          disabled={pendingKey !== null}
                          type="button"
                          onClick={() => handleTransition(market.id, targetStatus)}
                        >
                          {pending ? 'Saving…' : `Set ${targetStatus}`}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="notice noticeWarn">No lifecycle transition is exposed here for {market.status}. Use resolution or later settlement flow.</div>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
