import Link from 'next/link';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { AlphaShell } from '@/components/alpha-shell';
import { alphaPlan } from '@/lib/alpha-plan';

type WeekStatus = 'complete' | 'active' | 'queued';

const fallbackWeekStatus: Record<string, WeekStatus> = {
  'Week 0': 'complete',
  'Week 1': 'complete',
  'Week 2': 'complete',
  'Week 3': 'complete',
  'Week 4': 'complete',
  'Weeks 5-6': 'active'
};

const statusLabel: Record<WeekStatus, string> = {
  complete: 'done',
  active: 'active now',
  queued: 'queued'
};

function hasWeekCheck(doc: string, week: number) {
  return new RegExp(`^-\\s\\[(x|X)\\]\\sWeek\\s${week}\\b`, 'm').test(doc);
}

async function getWeekStatusSnapshot() {
  try {
    const trackPath = path.join(process.cwd(), 'docs', 'ALPHA_REBUILD_TRACK.md');
    const doc = await readFile(trackPath, 'utf8');
    const activeWeek = doc.match(/## Active week\s*\n([^\n]+)/m)?.[1]?.trim() ?? null;

    const week0Done = hasWeekCheck(doc, 0);
    const week1Done = hasWeekCheck(doc, 1);
    const week2Done = hasWeekCheck(doc, 2);
    const week3Done = hasWeekCheck(doc, 3);
    const week4Done = hasWeekCheck(doc, 4);
    const week5Done = hasWeekCheck(doc, 5);
    const week6Done = hasWeekCheck(doc, 6);

    const statusFor = (done: boolean, label: string): WeekStatus => {
      if (done) return 'complete';
      if (activeWeek === label) return 'active';
      return 'queued';
    };

    const week56: WeekStatus = week6Done
      ? 'complete'
      : activeWeek === 'Week 5' || activeWeek === 'Week 6' || week5Done
        ? 'active'
        : 'queued';

    return {
      activeWeek,
      weekStatus: {
        'Week 0': statusFor(week0Done, 'Week 0'),
        'Week 1': statusFor(week1Done, 'Week 1'),
        'Week 2': statusFor(week2Done, 'Week 2'),
        'Week 3': statusFor(week3Done, 'Week 3'),
        'Week 4': statusFor(week4Done, 'Week 4'),
        'Weeks 5-6': week56
      } satisfies Record<string, WeekStatus>
    };
  } catch {
    return {
      activeWeek: 'Week 6',
      weekStatus: fallbackWeekStatus
    };
  }
}

export default async function HomePage() {
  const { activeWeek, weekStatus } = await getWeekStatusSnapshot();
  const activeHeadline =
    weekStatus['Weeks 5-6'] === 'active'
      ? 'Week 6 launch-readiness is active'
      : activeWeek
        ? `${activeWeek} execution is active`
        : 'Follow the rebuild plan in sequence';

  return (
    <AlphaShell
      title="Alpha rebuild control room"
      eyebrow="Following the original 6-week plan in sequence. Legacy demo is frozen as UX reference only."
    >
      <section className="heroGrid">
        <article className="card stackSm">
          <p className="eyebrow">Current execution rule</p>
          <h2>{activeHeadline}</h2>
          <p className="subtle">
            Keep stage order strict. Legacy demo remains frozen under <code>/public/legacy</code> as reference while rebuilt Next
            routes are the live product surface.
          </p>
          <div className="buttonRow">
            <Link className="button buttonPrimary" href="/markets">
              Open markets lane
            </Link>
            <Link className="button buttonGhost" href="/admin/resolution">
              Open admin closeout
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
