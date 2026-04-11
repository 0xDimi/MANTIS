import { AlphaShell } from '@/components/alpha-shell';

export default function ProfilePage() {
  return (
    <AlphaShell title="Profile and access" eyebrow="Auth, tester invites, and role checks start in Week 1.">
      <section className="card">
        <ul>
          <li>sign in / sign up</li>
          <li>tester profile creation</li>
          <li>role-aware access for tester, admin, and super-admin</li>
          <li>invite-only alpha gating</li>
        </ul>
      </section>
    </AlphaShell>
  );
}
