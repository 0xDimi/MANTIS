import { formatDateTime, formatRelativeTime } from '@/lib/format';
import { localizedMarketStatus } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type EventTrustPanelProps = {
  lang: UiLang;
  closeTime: string;
  determinationTime: string | null;
  sourcePrimary: string;
  sourceFallback: string | null;
  resolutionRule: string;
  voidRule: string;
  description: string | null;
  educationCopy: string;
  status: string;
  childCount: number;
  updatedAt: string;
};

type SignalTone = 'good' | 'watch' | 'neutral';

function freshnessSignal(updatedAt: string, lang: UiLang): { label: string; value: string; tone: SignalTone } {
  const updatedMs = new Date(updatedAt).getTime();

  if (Number.isNaN(updatedMs)) {
    return {
      label: tr(lang, 'Freshness', 'Φρεσκάδα'),
      value: tr(lang, 'Review needed', 'Χρειάζεται έλεγχος'),
      tone: 'watch'
    };
  }

  const ageHours = Math.max(0, (Date.now() - updatedMs) / (1000 * 60 * 60));

  if (ageHours <= 72) {
    return {
      label: tr(lang, 'Freshness', 'Φρεσκάδα'),
      value: tr(lang, 'Recently checked', 'Πρόσφατος έλεγχος'),
      tone: 'good'
    };
  }

  if (ageHours <= 168) {
    return {
      label: tr(lang, 'Freshness', 'Φρεσκάδα'),
      value: tr(lang, 'Needs a light review', 'Θέλει σύντομο έλεγχο'),
      tone: 'neutral'
    };
  }

  return {
    label: tr(lang, 'Freshness', 'Φρεσκάδα'),
    value: tr(lang, 'Review before launch', 'Έλεγχος πριν το launch'),
    tone: 'watch'
  };
}

function signalClass(tone: SignalTone) {
  return tone === 'good' ? 'marketTrustSignal marketTrustSignalGood' : tone === 'watch' ? 'marketTrustSignal marketTrustSignalWatch' : 'marketTrustSignal';
}

function eventResolutionPathLabel(status: string, lang: UiLang) {
  const normalized = status.toLowerCase();

  if (normalized === 'settled') return tr(lang, 'Child settlements complete', 'Ο διακανονισμός των επιμέρους αγορών ολοκληρώθηκε');
  if (normalized === 'resolved') return tr(lang, 'Child markets resolved from evidence', 'Οι επιμέρους αγορές επιλύθηκαν με στοιχεία');
  if (normalized === 'under_review' || normalized === 'closed') {
    return tr(lang, 'Awaiting child-market review', 'Αναμένει έλεγχο επιμέρους αγορών');
  }
  if (normalized === 'open') return tr(lang, 'Each child resolves independently', 'Κάθε επιμέρους αγορά επιλύεται ανεξάρτητα');

  return localizedMarketStatus(status, lang, 'long');
}

export function EventTrustPanel({
  lang,
  closeTime,
  determinationTime,
  sourcePrimary,
  sourceFallback,
  resolutionRule,
  voidRule,
  description,
  educationCopy,
  status,
  childCount,
  updatedAt
}: EventTrustPanelProps) {
  const hasFallback = Boolean(sourceFallback);
  const freshness = freshnessSignal(updatedAt, lang);
  const pathLabel = eventResolutionPathLabel(status, lang);

  const signals: Array<{ label: string; value: string; tone: SignalTone }> = [
    {
      label: tr(lang, 'Source pack', 'Πακέτο πηγών'),
      value: hasFallback ? tr(lang, 'Primary + fallback', 'Κύρια + εναλλακτική') : tr(lang, 'Primary source only', 'Μόνο κύρια πηγή'),
      tone: hasFallback ? 'good' : 'neutral'
    },
    {
      label: tr(lang, 'Operator review', 'Έλεγχος operator'),
      value: tr(lang, 'Reviewed', 'Ελεγμένη'),
      tone: 'good'
    },
    freshness,
    {
      label: tr(lang, 'Resolution path', 'Διαδρομή επίλυσης'),
      value: pathLabel,
      tone: status.toLowerCase() === 'void' ? 'neutral' : 'good'
    }
  ];

  return (
    <section className="marketTrustLayer" id="rules-layer" aria-label={tr(lang, 'Grouped event trust details', 'Λεπτομέρειες αξιοπιστίας γεγονότος')}>
      <div className="marketTrustHeader">
        <div>
          <p className="eyebrow">{tr(lang, 'Trust layer', 'Επίπεδο εμπιστοσύνης')}</p>
          <h2>{tr(lang, 'How this grouped event is verified', 'Πώς επαληθεύεται αυτό το γεγονός')}</h2>
          <p>
            {description ??
              tr(
                lang,
                'This grouped event bundles independent YES/NO markets under one source pack and one resolution policy.',
                'Αυτό το ομαδοποιημένο γεγονός συγκεντρώνει ανεξάρτητες αγορές ΝΑΙ/ΟΧΙ κάτω από ένα πακέτο πηγών και μία πολιτική επίλυσης.'
              )}
          </p>
        </div>
        <div className="marketTrustUpdated">
          <span>{tr(lang, 'Last event update', 'Τελευταία ενημέρωση γεγονότος')}</span>
          <strong>{formatDateTime(updatedAt, lang)}</strong>
          <small>{formatRelativeTime(updatedAt, lang)}</small>
        </div>
      </div>

      <div className="marketTrustSignals" aria-label={tr(lang, 'Grouped event quality signals', 'Σήματα ποιότητας γεγονότος')}>
        {signals.map((signal) => (
          <div key={signal.label} className={signalClass(signal.tone)}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
          </div>
        ))}
      </div>

      <div className="marketTrustDisclosureStack">
        <details className="marketTrustDisclosure" open>
          <summary>
            <span>
              <strong>{tr(lang, 'Source pack', 'Πακέτο πηγών')}</strong>
              <small>{tr(lang, 'Hierarchy and fallback evidence', 'Ιεραρχία και εναλλακτικά στοιχεία')}</small>
            </span>
            <i aria-hidden="true" />
          </summary>
          <div className="marketTrustDisclosureBody">
            <div className="marketTrustSourceGrid">
              <div className="marketTrustSource marketTrustSourcePrimary">
                <span>{tr(lang, 'Primary source', 'Κύρια πηγή')}</span>
                <strong>{sourcePrimary}</strong>
              </div>
              <div className="marketTrustSource">
                <span>{tr(lang, 'Fallback source', 'Εναλλακτική πηγή')}</span>
                <strong>{sourceFallback ?? tr(lang, 'No fallback source listed', 'Δεν έχει οριστεί εναλλακτική πηγή')}</strong>
              </div>
            </div>
            <p className="marketTrustQuietLine">
              {tr(
                lang,
                'The same source hierarchy governs every child market inside this grouped event.',
                'Η ίδια ιεραρχία πηγών ισχύει για κάθε επιμέρους αγορά μέσα σε αυτό το ομαδοποιημένο γεγονός.'
              )}
            </p>
          </div>
        </details>

        <details className="marketTrustDisclosure">
          <summary>
            <span>
              <strong>{tr(lang, 'Resolution rules', 'Κανόνες επίλυσης')}</strong>
              <small>{tr(lang, 'Independent child-market criteria', 'Κριτήρια ανά ανεξάρτητη επιμέρους αγορά')}</small>
            </span>
            <i aria-hidden="true" />
          </summary>
          <div className="marketTrustDisclosureBody">
            <p className="marketTrustQuietLine">{educationCopy}</p>
            <div className="marketTrustRuleGrid">
              <div className="marketTrustRule marketTrustRuleYes">
                <span>{tr(lang, 'Yes', 'Ναι')}</span>
                <strong>{resolutionRule}</strong>
              </div>
              <div className="marketTrustRule marketTrustRuleNo">
                <span>{tr(lang, 'No', 'Όχι')}</span>
                <strong>
                  {tr(
                    lang,
                    'A child market settles NO if its named outcome is not confirmed by the eligible source window.',
                    'Μια επιμέρους αγορά επιλύεται ΟΧΙ αν το ονομασμένο αποτέλεσμά της δεν επιβεβαιωθεί μέσα στο επιλέξιμο παράθυρο πηγών.'
                  )}
                </strong>
              </div>
              <div className="marketTrustRule marketTrustRuleVoid">
                <span>{tr(lang, 'Void', 'Άκυρο')}</span>
                <strong>{voidRule}</strong>
              </div>
            </div>
          </div>
        </details>

        <details className="marketTrustDisclosure">
          <summary>
            <span>
              <strong>{tr(lang, 'Review status', 'Κατάσταση ελέγχου')}</strong>
              <small>{tr(lang, 'Timing, status, and child-market coverage', 'Χρόνος, κατάσταση και κάλυψη επιμέρους αγορών')}</small>
            </span>
            <i aria-hidden="true" />
          </summary>
          <div className="marketTrustDisclosureBody">
            <div className="marketTrustResolutionGrid">
              <div>
                <span>{tr(lang, 'Trading closes', 'Λήξη διαπραγμάτευσης')}</span>
                <strong>{formatDateTime(closeTime, lang)}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Resolution target', 'Στόχος επίλυσης')}</span>
                <strong>{determinationTime ? formatDateTime(determinationTime, lang) : tr(lang, 'After close', 'Μετά τη λήξη')}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Event status', 'Κατάσταση γεγονότος')}</span>
                <strong>{localizedMarketStatus(status, lang, 'long')}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Child markets', 'Επιμέρους αγορές')}</span>
                <strong>{childCount}</strong>
              </div>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
