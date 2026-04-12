'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatRelativeHours } from '@/lib/format';

type ResolutionOutcome = 'yes' | 'no' | 'void';

type ResolutionQueueRecord = {
  id: string;
  slug: string;
  question: string;
  status: 'draft' | 'open' | 'paused' | 'closed' | 'resolved' | 'settled' | 'void';
  closeTime: string;
  resolutionTime: string | null;
  resolution: {
    id: string;
    outcome: ResolutionOutcome;
    evidenceSummary: string;
    evidenceUrl: string | null;
    createdAt: string;
  } | null;
  settlement: {
    id: string;
    outcome: ResolutionOutcome;
    affectedAccounts: number;
    totalPayout: number;
    totalRefund: number;
    totalRealizedPnl: number;
    createdAt: string;
  } | null;
};

type DraftState = {
  outcome: ResolutionOutcome;
  evidenceSummary: string;
  evidenceUrl: string;
};

function statusClass(status: ResolutionQueueRecord['status']) {
  switch (status) {
    case 'resolved':
    case 'settled':
      return 'badgeYes';
    case 'void':
      return 'badgeNo';
    default:
      return 'badgeNeutral';
  }
}

function outcomeBadge(outcome: ResolutionOutcome) {
  return outcome === 'yes' ? 'badgeYes' : outcome === 'no' || outcome === 'void' ? 'badgeNo' : 'badgeNeutral';
}

function fmtMoney(value: number) {
  return `€${value.toFixed(2)}`;
}

export function AdminResolutionPanel({ markets }: { markets: ResolutionQueueRecord[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    return markets.reduce(
      (acc, market) => {
        acc.total += 1;
        if (market.status === 'closed' && !market.resolution) acc.pendingResolution += 1;
        if (market.resolution && !market.settlement) acc.pendingSettlement += 1;
        if (market.settlement) acc.settled += 1;
        if (market.resolution?.outcome === 'yes') acc.yes += 1;
        if (market.resolution?.outcome === 'no') acc.no += 1;
        if (market.resolution?.outcome === 'void') acc.void += 1;
        return acc;
      },
      { total: 0, pendingResolution: 0, pendingSettlement: 0, settled: 0, yes: 0, no: 0, void: 0 }
    );
  }, [markets]);

  function readDraft(marketId: string): DraftState {
    return drafts[marketId] ?? {
      outcome: 'yes',
      evidenceSummary: '',
      evidenceUrl: ''
    };
  }

  function patchDraft(marketId: string, patch: Partial<DraftState>) {
    setDrafts((current) => {
      const base: DraftState = current[marketId] ?? {
        outcome: 'yes',
        evidenceSummary: '',
        evidenceUrl: ''
      };

      return {
        ...current,
        [marketId]: {
          ...base,
          ...patch
        }
      };
    });
  }

  async function handleResolutionSubmit(market: ResolutionQueueRecord) {
    const draft = readDraft(market.id);
    setPendingKey(`resolve:${market.id}`);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/resolution', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          marketId: market.id,
          outcome: draft.outcome,
          evidenceSummary: draft.evidenceSummary,
          evidenceUrl: draft.evidenceUrl
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to record resolution');
      }

      setMessage(`${payload.resolution?.question ?? market.question} resolved as ${payload.resolution?.outcome ?? draft.outcome}.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record resolution');
    } finally {
      setPendingKey(null);
    }
  }

  async function handleSettlement(market: ResolutionQueueRecord) {
    setPendingKey(`settle:${market.id}`);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/settlement', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ marketId: market.id })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to settle market');
      }

      setMessage(
        `${payload.settlement?.question ?? market.question} settled. Payout ${fmtMoney(Number(payload.settlement?.totalPayout ?? 0))}, refund ${fmtMoney(Number(payload.settlement?.totalRefund ?? 0))}.`
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to settle market');
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="stackMd">
      <section className="card stackSm">
        <div>
          <p className="eyebrow">Resolution queue</p>
          <h3>YES / NO / VOID plus settlement closeout</h3>
          <p className="subtle">Closed markets resolve here first, then resolved or void markets move through a one-shot settlement pass with payout or refund totals.</p>
        </div>
        <div className="metricGridCompact">
          <div className="metricTile">
            <div className="metricTileLabel">Queue size</div>
            <div className="metricTileValue">{summary.total}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">Pending resolution</div>
            <div className="metricTileValue">{summary.pendingResolution}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">Pending settlement</div>
            <div className="metricTileValue">{summary.pendingSettlement}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">Settled</div>
            <div className="metricTileValue">{summary.settled}</div>
          </div>
        </div>
        <div className="metricGridCompact">
          <div className="metricTile">
            <div className="metricTileLabel">YES / NO / VOID</div>
            <div className="metricTileValue metricTileValueSmall">
              {summary.yes} / {summary.no} / {summary.void}
            </div>
          </div>
        </div>
        {message ? <div className="notice noticeSuccess">{message}</div> : null}
        {error ? <div className="notice noticeError">{error}</div> : null}
      </section>

      <section className="marketBoard">
        {markets.map((market) => {
          const draft = readDraft(market.id);
          const resolving = pendingKey === `resolve:${market.id}`;
          const settling = pendingKey === `settle:${market.id}`;

          return (
            <article className="card marketCard" key={market.id}>
              <div className="marketCardHeader">
                <div>
                  <p className="eyebrow">{market.slug}</p>
                  <h3 className="marketQuestion">{market.question}</h3>
                </div>
                <span className={statusClass(market.status)}>{market.status}</span>
              </div>

              <div className="statusList">
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
                <div className="statusRow">
                  <span>Resolution state</span>
                  <span className={market.resolution ? outcomeBadge(market.resolution.outcome) : 'badgeNeutral'}>
                    {market.resolution ? market.resolution.outcome : 'pending'}
                  </span>
                </div>
                <div className="statusRow">
                  <span>Settlement state</span>
                  <span className={market.settlement ? 'badgeYes' : 'badgeNeutral'}>{market.settlement ? 'settled' : 'pending'}</span>
                </div>
              </div>

              {market.resolution ? (
                <div className="stackSm">
                  <div className="panelBlock">
                    <div className="splitSectionLabel">Evidence summary</div>
                    <p className="panelText">{market.resolution.evidenceSummary}</p>
                  </div>
                  <div className="statusList">
                    <div className="statusRow">
                      <span>Recorded at</span>
                      <span className="badgeNeutral">{formatDateTime(market.resolution.createdAt)}</span>
                    </div>
                    <div className="statusRow">
                      <span>Source URL</span>
                      <span className="badgeNeutral">{market.resolution.evidenceUrl ?? 'not provided'}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {market.settlement ? (
                <div className="stackSm">
                  <div className="panelBlock">
                    <div className="splitSectionLabel">Settlement summary</div>
                    <p className="panelText">
                      {market.settlement.outcome.toUpperCase()} closeout across {market.settlement.affectedAccounts} account
                      {market.settlement.affectedAccounts === 1 ? '' : 's'}.
                    </p>
                  </div>
                  <div className="metricGridCompact">
                    <div className="metricTile">
                      <div className="metricTileLabel">Payout</div>
                      <div className="metricTileValue metricTileValueSmall">{fmtMoney(market.settlement.totalPayout)}</div>
                    </div>
                    <div className="metricTile">
                      <div className="metricTileLabel">Refund</div>
                      <div className="metricTileValue metricTileValueSmall">{fmtMoney(market.settlement.totalRefund)}</div>
                    </div>
                    <div className="metricTile">
                      <div className="metricTileLabel">Realized PnL</div>
                      <div className="metricTileValue metricTileValueSmall">{fmtMoney(market.settlement.totalRealizedPnl)}</div>
                    </div>
                    <div className="metricTile">
                      <div className="metricTileLabel">Settled at</div>
                      <div className="metricTileValue metricTileValueSmall">{formatDateTime(market.settlement.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {!market.resolution && market.status === 'closed' ? (
                <form
                  className="stackSm"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleResolutionSubmit(market);
                  }}
                >
                  <div className="stackXs">
                    <label className="fieldLabel" htmlFor={`outcome-${market.id}`}>
                      Outcome
                    </label>
                    <select
                      id={`outcome-${market.id}`}
                      className="select"
                      value={draft.outcome}
                      onChange={(event) => patchDraft(market.id, { outcome: event.target.value as ResolutionOutcome })}
                    >
                      <option value="yes">YES</option>
                      <option value="no">NO</option>
                      <option value="void">VOID</option>
                    </select>
                  </div>

                  <div className="stackXs">
                    <label className="fieldLabel" htmlFor={`summary-${market.id}`}>
                      Evidence summary
                    </label>
                    <textarea
                      id={`summary-${market.id}`}
                      className="textarea"
                      placeholder="Summarize the resolution source and why this outcome is correct."
                      value={draft.evidenceSummary}
                      onChange={(event) => patchDraft(market.id, { evidenceSummary: event.target.value })}
                      required
                    />
                  </div>

                  <div className="stackXs">
                    <label className="fieldLabel" htmlFor={`url-${market.id}`}>
                      Evidence URL (optional)
                    </label>
                    <input
                      id={`url-${market.id}`}
                      className="input"
                      inputMode="url"
                      placeholder="https://source.example/result"
                      value={draft.evidenceUrl}
                      onChange={(event) => patchDraft(market.id, { evidenceUrl: event.target.value })}
                    />
                  </div>

                  <div className="buttonRow">
                    <button className="button buttonPrimary" disabled={pendingKey !== null} type="submit">
                      {resolving ? 'Recording…' : 'Record resolution'}
                    </button>
                  </div>
                </form>
              ) : null}

              {market.resolution && !market.settlement && (market.status === 'resolved' || market.status === 'void') ? (
                <div className="stackSm">
                  <div className="notice noticeWarn">
                    Resolution is recorded. Run settlement to write wallet credits or void refunds, zero remaining position basis, and move the market into <code>settled</code>.
                  </div>
                  <div className="buttonRow">
                    <button className="button buttonPrimary" disabled={pendingKey !== null} type="button" onClick={() => handleSettlement(market)}>
                      {settling ? 'Settling…' : 'Run settlement'}
                    </button>
                  </div>
                </div>
              ) : null}

              {!market.resolution && market.status !== 'closed' ? (
                <div className="notice noticeWarn">
                  Resolution form only opens once the market is in <code>closed</code>. Current status stays read-only here.
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
