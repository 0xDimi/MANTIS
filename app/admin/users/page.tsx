import { AlphaShell } from '@/components/alpha-shell';

export default function AdminUsersPage() {
  return (
    <AlphaShell title="Admin users" eyebrow="Tester lookup, access state, and trade inspection land here.">
      <section className="card">
        <ul>
          <li>tester list</li>
          <li>wallet and position lookup</li>
          <li>trade inspection</li>
          <li>operator audit view</li>
        </ul>
      </section>
    </AlphaShell>
  );
}
