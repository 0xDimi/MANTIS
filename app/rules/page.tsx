import { AlphaShell } from '@/components/alpha-shell';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

export default async function RulesPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = await resolveServerLang({ searchParam: params.lang });

  return (
    <AlphaShell title={tr(lang, 'Rules and resolution', 'Κανόνες και επίλυση')} eyebrow={tr(lang, 'Source hierarchy and clear outcomes', 'Ιεραρχία πηγών και καθαρά αποτελέσματα')} lang={lang}>
      <section className="card">
        <ul>
          <li>{tr(lang, 'market source hierarchy', 'ιεραρχία πηγών αγοράς')}</li>
          <li>{tr(lang, 'close time and resolution timing', 'χρόνος λήξης και χρόνος επίλυσης')}</li>
          <li>{tr(lang, 'YES / NO / VOID logic', 'λογική YES / NO / VOID')}</li>
          <li>{tr(lang, 'manual-admin safeguards and audit logging', 'χειροκίνητες δικλίδες admin και audit logs')}</li>
        </ul>
      </section>
    </AlphaShell>
  );
}
