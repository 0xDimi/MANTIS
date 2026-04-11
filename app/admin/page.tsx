import Link from 'next/link';
import { AlphaShell } from '@/components/alpha-shell';

const links = [
  ['/admin/markets', 'Market CRUD and lifecycle'],
  ['/admin/resolution', 'Resolution and settlement queue'],
  ['/admin/users', 'Tester lookup and audit view']
] as const;

export default function AdminPage() {
  return (
    <AlphaShell title="Admin console foundation" eyebrow="Week 5 and Week 6 operationalize the market lifecycle, resolution, and tester oversight.">
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
