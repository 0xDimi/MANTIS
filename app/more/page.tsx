import { AlphaShell } from '@/components/alpha-shell';
import { normalizeLang, tr } from '@/lib/ui-lang';

export default async function MorePage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = normalizeLang(params.lang);

  return (
    <AlphaShell title={tr(lang, 'More', 'Περισσότερα')} eyebrow={tr(lang, 'MANTIS quick guide', 'Σύντομος οδηγός MANTIS')} lang={lang}>
      <section className="stackMd">
        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'What is MANTIS', 'Τι είναι το MANTIS')}</p>
          <p className="panelText">
            {tr(
              lang,
              'MANTIS is a prediction market app where users trade YES or NO shares on real-world outcomes.',
              'Το MANTIS είναι εφαρμογή αγορών πρόβλεψης όπου οι χρήστες διαπραγματεύονται μετοχές YES ή NO σε πραγματικά γεγονότα.'
            )}
          </p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'How prediction markets work', 'Πώς λειτουργούν οι αγορές πρόβλεψης')}</p>
          <ul>
            <li>{tr(lang, 'Pick a market and buy YES or NO.', 'Επίλεξε αγορά και αγόρασε YES ή NO.')}</li>
            <li>{tr(lang, 'Prices move with trading activity and reflect implied probability.', 'Οι τιμές κινούνται με βάση τη δραστηριότητα και αποτυπώνουν την υπονοούμενη πιθανότητα.')}</li>
            <li>{tr(lang, 'When the market resolves, winning shares settle and balances update automatically.', 'Όταν η αγορά λυθεί, οι κερδισμένες μετοχές διακανονίζονται και τα υπόλοιπα ενημερώνονται αυτόματα.')}</li>
          </ul>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'About this demo', 'Σχετικά με αυτό το demo')}</p>
          <p className="panelText">
            {tr(
              lang,
              'This environment uses paper balances for testing the full experience from first trade to settlement.',
              'Αυτό το περιβάλλον χρησιμοποιεί paper balances για δοκιμή όλης της εμπειρίας, από την πρώτη συναλλαγή έως τον διακανονισμό.'
            )}
          </p>
        </article>
      </section>
    </AlphaShell>
  );
}
