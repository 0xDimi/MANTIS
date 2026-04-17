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
    <AlphaShell title={tr(lang, 'More', 'Περισσότερα')} eyebrow={tr(lang, 'How MANTIS works', 'Πώς λειτουργεί το MANTIS')} lang={lang}>
      <section className="stackMd">
        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'What is MANTIS', 'Τι είναι το MANTIS')}</p>
          <p className="panelText">
            {tr(
              lang,
              'MANTIS is a probability-first prediction market app. You express conviction by trading YES or NO shares on real-world questions.',
              'Το MANTIS είναι εφαρμογή αγορών πρόβλεψης με έμφαση στην πιθανότητα. Εκφράζεις άποψη αγοράζοντας μετοχές YES ή NO σε πραγματικά ερωτήματα.'
            )}
          </p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'How to trade', 'Πώς να κάνεις συναλλαγή')}</p>
          <ul>
            <li>{tr(lang, 'Open a market and read the rules + source section first.', 'Άνοιξε μια αγορά και διάβασε πρώτα την ενότητα κανόνων και πηγών.')}</li>
            <li>{tr(lang, 'Choose BUY or SELL and then YES or NO.', 'Επίλεξε ΑΓΟΡΑ ή ΠΩΛΗΣΗ και μετά YES ή NO.')}</li>
            <li>{tr(lang, 'Enter amount, check the inline summary, then execute with one CTA.', 'Συμπλήρωσε ποσό, δες τη σύνοψη και εκτέλεσε με ένα CTA.')}</li>
            <li>{tr(lang, 'Track position, cash, and updates from Portfolio and Notifications.', 'Παρακολούθησε θέση, μετρητά και ενημερώσεις από Χαρτοφυλάκιο και Ειδοποιήσεις.')}</li>
          </ul>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'What odds/probability mean', 'Τι σημαίνουν αποδόσεις/πιθανότητα')}</p>
          <p className="panelText">
            {tr(
              lang,
              'Displayed probability is the market-implied chance for YES. Example: 64% means the current market is pricing roughly a 64% chance of YES and 36% for NO.',
              'Η εμφανιζόμενη πιθανότητα είναι η πιθανότητα YES που αποτιμά η αγορά. Παράδειγμα: 64% σημαίνει ότι η αγορά τιμολογεί περίπου 64% πιθανότητα για YES και 36% για NO.'
            )}
          </p>
          <p className="panelText">
            {tr(
              lang,
              'Probabilities move as people trade. They are signals, not guarantees.',
              'Οι πιθανότητες κινούνται καθώς γίνονται συναλλαγές. Είναι σήματα, όχι εγγυήσεις.'
            )}
          </p>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'How markets resolve', 'Πώς επιλύονται οι αγορές')}</p>
          <ul>
            <li>{tr(lang, 'Each market has a primary source and fallback source.', 'Κάθε αγορά έχει κύρια και εναλλακτική πηγή.')}</li>
            <li>{tr(lang, 'At close, trading stops. Then outcome is resolved as YES, NO, or VOID.', 'Στη λήξη σταματά η διαπραγμάτευση. Μετά το αποτέλεσμα επιλύεται ως YES, NO ή VOID.')}</li>
            <li>{tr(lang, 'Settlement applies payouts/refunds based on the final outcome.', 'Ο διακανονισμός εφαρμόζει πληρωμές/επιστροφές βάσει του τελικού αποτελέσματος.')}</li>
            <li>{tr(lang, 'Resolution evidence is visible in market detail for transparency.', 'Τα στοιχεία επίλυσης εμφανίζονται στις λεπτομέρειες αγοράς για διαφάνεια.')}</li>
          </ul>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'Risk notes', 'Σημειώσεις ρίσκου')}</p>
          <ul>
            <li>{tr(lang, 'Use position sizing. Do not over-concentrate in one market.', 'Χρησιμοποίησε σωστό position sizing. Μην υπερσυγκεντρώνεις σε μία αγορά.')}</li>
            <li>{tr(lang, 'Requote when price impact is high or quote expires.', 'Ζήτα νέο quote όταν το price impact είναι υψηλό ή το quote λήξει.')}</li>
            <li>{tr(lang, 'Read void rules before entering size.', 'Διάβασε τους κανόνες VOID πριν βάλεις μέγεθος.')}</li>
          </ul>
        </article>

        <article className="card stackSm">
          <p className="eyebrow">{tr(lang, 'About this environment', 'Σχετικά με αυτό το περιβάλλον')}</p>
          <p className="panelText">
            {tr(
              lang,
              'This is a paper-trading alpha environment for product testing and UX validation. No real-money transfer is performed in this mode.',
              'Αυτό είναι περιβάλλον alpha με paper-trading για δοκιμές προϊόντος και επικύρωση UX. Δεν γίνεται μεταφορά πραγματικών χρημάτων σε αυτό το mode.'
            )}
          </p>
        </article>
      </section>
    </AlphaShell>
  );
}
