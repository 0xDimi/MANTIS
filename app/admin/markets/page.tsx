import { AlphaShell } from '@/components/alpha-shell';

export default function AdminMarketsPage() {
  return (
    <AlphaShell title="Admin markets" eyebrow="Create, edit, open, pause, and close controls land here.">
      <section className="card">
        <ul>
          <li>market create/edit form</li>
          <li>status transitions</li>
          <li>seed liquidity + initial probability controls</li>
          <li>audit trail writes</li>
        </ul>
      </section>
    </AlphaShell>
  );
}
