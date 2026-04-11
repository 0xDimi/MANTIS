import { AlphaShell } from '@/components/alpha-shell';

export default function AdminResolutionPage() {
  return (
    <AlphaShell title="Admin resolution" eyebrow="YES / NO / VOID resolution and settlement orchestration land here.">
      <section className="card">
        <ul>
          <li>source evidence check</li>
          <li>manual resolution form</li>
          <li>settlement trigger</li>
          <li>tester-visible settled state</li>
        </ul>
      </section>
    </AlphaShell>
  );
}
