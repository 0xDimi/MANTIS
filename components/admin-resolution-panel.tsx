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

export function AdminResolutionPanel({ markets }: { markets: ResolutionQueueRecord[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});
  const [pendingMarketId, setPendingMarketId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    return markets.reduce(
      (acc, market) => {
        acc.total += 1;
        if (market.status === 'closed' && !market.resolution) acc.pending += 1;
        if (market.resolution?.outcome === 'yes') acc.yes += 1;
        if (market.resolution?.outcome === 'no') acc.no += 1;
        if (market.resolution?.outcome === 'void') acc.void += 1;
        return acc;
      },
      { total: 0, pending: 0, yes: 0, no: 0, void: 0 }
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

  async function handleSubmit(market: ResolutionQueueRecord) {
    const draft = readDraft(market.id);
    setPendingMarketId(market.id);
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
      setPendingMarketId(null);
    }
  }

  return (
    <div className="stackMd">
      <section className="card stackSm">
        <div>
          <p className="eyebrow">Resolution queue</p>
          <h3>YES / NO / VOID operator flow</h3>
          <p className="subtle">Closed markets can now be resolved from rebuilt routes with evidence summary and optional source URL. Settlement remains a later Week 5 step.</p>
        </div>
        <div className="metricGridCompact">
          <div className="metricTile">
            <div className="metricTileLabel">Queue size</div>
            <div className="metricTileValue">{summary.total}</div>
          </div>
          <div className="metricTile">
            <div className="metricTileLabel">Pending closeouts</div>
            <div className="metricTileValue">{summary.pending}</div>
          </div>
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
          const pending = pendingMarketId === market.id;
          const resolutionRecorded = Boolean(market.resolution);

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
              ) : market.status === 'closed' ? (
                <form
                  className="stackSm"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmit(market);
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
                    <button className="button buttonPrimary" disabled={pendingMarketId !== null} type="submit">
                      {pending ? 'Recording…' : 'Record resolution'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="notice noticeWarn">
                  Resolution form only opens once the market is in <code>closed</code>. Current status stays read-only here.
                </div>
              )}

              {!resolutionRecorded && market.status !== 'closed' ? (
                <p className="subtle">Use the lifecycle screen first if this market still needs to move into a closable state.</p>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
