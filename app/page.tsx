import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';
import { alphaPlan } from '@/lib/alpha-plan';

const weekStatus: Record<string, 'complete' | 'active' | 'queued'> = {
  'Week 0': 'complete',
  'Week 1': 'active',
  'Week 2': 'queued',
  'Week 3': 'queued',
  'Week 4': 'queued',
  'Weeks 5-6': 'queued'
};

const statusLabel: Record<(typeof weekStatus)[keyof typeof weekStatus], string> = {
  complete: 'done',
  active: 'active now',
  queued: 'queued'
};

export default function HomePage() {
  return (
    <AlphaShell
      title="Alpha rebuild control room"
      eyebrow="Following the original 6-week plan in sequence. Legacy demo is frozen as UX reference only."
    >
      <section className="heroGrid">
        <article className="card stackSm">
          <p className="eyebrow">Current execution rule</p>
          <h2>Finish Week 1 before touching Week 2+</h2>
          <p className="subtle">
            The polished static demo is no longer the live app surface. It stays untouched under <code>/public/legacy</code>{' '}
            as visual reference while the Next app becomes the real product shell.
          </p>
          <div className="buttonRow">
            <Link className="button buttonPrimary" href="/profile">
              Finish access foundation
            </Link>
            <Link className="button buttonGhost" href="/markets">
              Inspect build lanes
            </Link>
          </div>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">Locked product constraints</p>
          <div className="statusList">
            <div className="statusRow">
              <span>AMM source of truth</span>
              <span className="badgeYes">xyz_amm_package_v0</span>
            </div>
            <div className="statusRow">
              <span>Access mode</span>
              <span className="badgeNeutral">email invite + auth</span>
            </div>
            <div className="statusRow">
              <span>Starting balance</span>
              <span className="badgeNeutral">€1,000 paper</span>
            </div>
            <div className="statusRow">
              <span>Legacy surface</span>
              <span className="badgeNeutral">reference only</span>
            </div>
          </div>
        </article>
      </section>

      <section className="routeGrid">
        {alphaPlan.map((week) => {
          const status = weekStatus[week.stage] ?? 'queued';

          return (
            <article className="card stackSm" key={week.stage}>
              <div className="statusRow statusRowStart">
                <div>
                  <p className="eyebrow">{week.stage}</p>
                  <h3>{week.title}</h3>
                </div>
                <span className={status === 'complete' ? 'badgeYes' : status === 'active' ? 'badgeNeutral' : 'badgeNo'}>
                  {statusLabel[status]}
                </span>
              </div>
              <ul>
                {week.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </AlphaShell>
  );
}
