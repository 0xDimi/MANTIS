import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';

const links = [
  ['/admin/markets', 'Lifecycle controls live on rebuilt routes'],
  ['/admin/resolution', 'Resolution queue live, settlement still pending'],
  ['/admin/users', 'Tester lookup and audit view']
] as const;

export default function AdminPage() {
  return (
    <AlphaShell title="Admin console foundation" eyebrow="Week 5 lifecycle and resolution surfaces are now live behind admin access. Settlement remains the next closure step.">
      <section className="card statusList">
        {links.map(([href, label]) => (
          <div className="statusRow" key={href}>
            <Link href={href}>{href}</Link>
            <span className="badgeNeutral">{label}</span>
          </div>
        ))}
      </section>
    </AlphaShell>
  );
}
