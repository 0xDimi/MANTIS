import { AlphaShell } from '@/components/alpha-shell';

export default function RulesPage() {
  return (
    <AlphaShell title="Rules and resolution" eyebrow="Source hierarchy and clear outcomes">
      <section className="card">
        <ul>
          <li>market source hierarchy</li>
          <li>close time and resolution timing</li>
          <li>YES / NO / VOID logic</li>
          <li>manual-admin safeguards and audit logging</li>
        </ul>
      </section>
    </AlphaShell>
  );
}
