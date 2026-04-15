import { AlphaShell } from '@/components/alpha-shell';

export default function MorePage() {
  return (
    <AlphaShell title="More" eyebrow="MANTIS quick guide">
      <section className="stackMd">
        <article className="card stackSm">
          <p className="eyebrow">What is MANTIS</p>
          <p className="panelText">
            MANTIS is a prediction market app where users trade YES or NO shares on real-world outcomes.
          </p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">How prediction markets work</p>
          <ul>
            <li>Pick a market and buy YES or NO.</li>
            <li>Prices move with trading activity and reflect implied probability.</li>
            <li>When the market resolves, winning shares settle and balances update automatically.</li>
          </ul>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">About this demo</p>
          <p className="panelText">
            This environment uses paper balances for testing the full experience from first trade to settlement.
          </p>
        </article>
      </section>
    </AlphaShell>
  );
}
