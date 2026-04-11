import { AlphaShell } from '@/components/alpha-shell';
import { StageCard } from '@/components/stage-card';
import { alphaPlan } from '@/lib/alpha-plan';
import { appConfig, routeMap } from '@/lib/app-config';

export default function HomePage() {
  return (
    <AlphaShell
      title="Operational alpha foundation"
      eyebrow="Kickoff is live. The static demo is now being rebuilt into the real paper-trading alpha spine."
    >
      <section className="heroGrid">
        <article className="card">
          <p className="eyebrow">Current target</p>
          <h2>12 to 15 live markets, 10 to 20 testers, real paper-trading operations.</h2>
          <p>
            This branch is the controlled alpha build path. Front end moves to Next.js,
            state moves to Supabase, and pricing, execution, and settlement stay server-side.
          </p>
          <div className="metricsGrid">
            <div>
              <p className="eyebrow">Timeline</p>
              <p className="metricValue">5–6w</p>
            </div>
            <div>
              <p className="eyebrow">Markets</p>
              <p className="metricValue">{appConfig.alphaScope.marketsTarget}</p>
            </div>
            <div>
              <p className="eyebrow">Tester lane</p>
              <p className="metricValue">{appConfig.alphaScope.testers}</p>
            </div>
          </div>
        </article>

        <article className="card">
          <p className="eyebrow">Week 0 exit</p>
          <div className="statusList">
            <div className="statusRow"><span>alpha branch</span><span className="badgeYes">live</span></div>
            <div className="statusRow"><span>typed app shell</span><span className="badgeYes">started</span></div>
            <div className="statusRow"><span>provider layer</span><span className="badgeYes">ready</span></div>
            <div className="statusRow"><span>AMM v0 spec</span><span className="badgeYes">locked enough</span></div>
          </div>
        </article>
      </section>

      <section className="card" style={{ marginBottom: 16 }}>
        <p className="eyebrow">Route map</p>
        <div className="routeGrid">
          {routeMap.map((route) => (
            <div key={route} className="codeBlock">{route}</div>
          ))}
        </div>
      </section>

      <section className="stageGrid">
        {alphaPlan.map((stage) => (
          <StageCard key={stage.stage} {...stage} />
        ))}
      </section>
    </AlphaShell>
  );
}
