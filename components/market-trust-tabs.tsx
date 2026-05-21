import type { MarketDetailRead } from '@/lib/alpha-read-model';
import { formatCompact, formatDateTime, formatRelativeTime } from '@/lib/format';
import { localizedMarketStatus } from '@/lib/market-copy';
import { tr, type UiLang } from '@/lib/ui-lang';

type MarketTrustTabsProps = {
  lang: UiLang;
  closeTime: string;
  resolutionTime: string | null;
  sourcePrimary: string;
  sourceFallback: string | null;
  voidRule: string;
  description: string | null;
  resolution: MarketDetailRead['resolution'];
  settlement: MarketDetailRead['settlement'];
  status: string;
  updatedAt: string;
  yesLabel: string;
  noLabel: string;
};

type SignalTone = 'good' | 'watch' | 'neutral';

function resolutionOutcomeLabel(outcome: 'yes' | 'no' | 'void', lang: UiLang) {
  if (outcome === 'yes') return tr(lang, 'Yes', 'Ναι');
  if (outcome === 'no') return tr(lang, 'No', 'Όχι');
  return tr(lang, 'Void', 'Άκυρο');
}

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

function resolutionPathLabel(status: string, resolution: MarketDetailRead['resolution'], settlement: MarketDetailRead['settlement'], lang: UiLang) {
  const normalized = status.toLowerCase();

  if (settlement) return tr(lang, 'Settlement complete', 'Ο διακανονισμός ολοκληρώθηκε');
  if (resolution) return tr(lang, 'Resolved from evidence', 'Επιλύθηκε με στοιχεία');
  if (normalized === 'closed') return tr(lang, 'Awaiting operator review', 'Αναμένει έλεγχο operator');
  if (normalized === 'open') return tr(lang, 'Primary source at close', 'Κύρια πηγή στη λήξη');

  return localizedMarketStatus(status, lang, 'long');
}

function signalClass(tone: SignalTone) {
  return tone === 'good' ? 'marketTrustSignal marketTrustSignalGood' : tone === 'watch' ? 'marketTrustSignal marketTrustSignalWatch' : 'marketTrustSignal';
}

export function MarketTrustTabs({
  lang,
  closeTime,
  resolutionTime,
  sourcePrimary,
  sourceFallback,
  voidRule,
  description,
  resolution,
  settlement,
  status,
  updatedAt,
  yesLabel,
  noLabel
}: MarketTrustTabsProps) {
  const freshness = freshnessSignal(updatedAt, lang);
  const hasFallback = Boolean(sourceFallback);
  const sourceStatus = hasFallback
    ? tr(lang, 'Primary + fallback', 'Κύρια + εναλλακτική')
    : tr(lang, 'Primary source only', 'Μόνο κύρια πηγή');
  const pathLabel = resolutionPathLabel(status, resolution, settlement, lang);

  const signals: Array<{ label: string; value: string; tone: SignalTone }> = [
    {
      label: tr(lang, 'Source pack', 'Πακέτο πηγών'),
      value: sourceStatus,
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
      tone: resolution || settlement || status.toLowerCase() === 'open' ? 'good' : 'neutral'
    }
  ];

  return (
    <section className="marketTrustLayer" id="rules-layer" aria-label={tr(lang, 'Market trust details', 'Λεπτομέρειες αξιοπιστίας αγοράς')}>
      <div className="marketTrustHeader">
        <div>
          <p className="eyebrow">{tr(lang, 'Trust layer', 'Επίπεδο εμπιστοσύνης')}</p>
          <h2>{tr(lang, 'How this market is verified', 'Πώς επαληθεύεται αυτή η αγορά')}</h2>
          <p>
            {description ??
              tr(
                lang,
                'This market tracks a public outcome with named sources and a predefined resolution path.',
                'Αυτή η αγορά παρακολουθεί δημόσιο αποτέλεσμα με ονομασμένες πηγές και προκαθορισμένη επίλυση.'
              )}
          </p>
        </div>
        <div className="marketTrustUpdated">
          <span>{tr(lang, 'Last market update', 'Τελευταία ενημέρωση')}</span>
          <strong>{formatDateTime(updatedAt, lang)}</strong>
          <small>{formatRelativeTime(updatedAt, lang)}</small>
        </div>
      </div>

      <div className="marketTrustSignals" aria-label={tr(lang, 'Market quality signals', 'Σήματα ποιότητας αγοράς')}>
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
                'The primary source controls resolution unless it is unavailable or materially ambiguous.',
                'Η κύρια πηγή καθορίζει την επίλυση εκτός αν δεν είναι διαθέσιμη ή είναι ουσιαστικά ασαφής.'
              )}
            </p>
          </div>
        </details>

        <details className="marketTrustDisclosure">
          <summary>
            <span>
              <strong>{tr(lang, 'Resolution rules', 'Κανόνες επίλυσης')}</strong>
              <small>{tr(lang, 'YES, NO, and VOID criteria', 'Κριτήρια ΝΑΙ, ΟΧΙ και ΑΚΥΡΟ')}</small>
            </span>
            <i aria-hidden="true" />
          </summary>
          <div className="marketTrustDisclosureBody">
            <div className="marketTrustRuleGrid">
              <div className="marketTrustRule marketTrustRuleYes">
                <span>{yesLabel}</span>
                <strong>
                  {tr(
                    lang,
                    'Settles YES if the named source confirms the stated outcome by the resolution window.',
                    'Επιλύεται ΝΑΙ αν η ονομασμένη πηγή επιβεβαιώσει το δηλωμένο αποτέλεσμα μέσα στο παράθυρο επίλυσης.'
                  )}
                </strong>
              </div>
              <div className="marketTrustRule marketTrustRuleNo">
                <span>{noLabel}</span>
                <strong>
                  {tr(
                    lang,
                    'Settles NO if the stated outcome is not confirmed by the eligible source window.',
                    'Επιλύεται ΟΧΙ αν το δηλωμένο αποτέλεσμα δεν επιβεβαιωθεί μέσα στο επιλέξιμο παράθυρο πηγών.'
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
              <small>{tr(lang, 'Timing, status, and evidence trail', 'Χρόνος, κατάσταση και στοιχεία')}</small>
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
                <strong>{resolutionTime ? formatDateTime(resolutionTime, lang) : tr(lang, 'After close', 'Μετά τη λήξη')}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Market status', 'Κατάσταση αγοράς')}</span>
                <strong>{localizedMarketStatus(status, lang, 'long')}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Expected path', 'Αναμενόμενη διαδρομή')}</span>
                <strong>{pathLabel}</strong>
              </div>
            </div>

            {resolution ? (
              <div className="marketTrustEvidence">
                <div>
                  <span>{tr(lang, 'Resolved outcome', 'Αποτέλεσμα επίλυσης')}</span>
                  <strong>{resolutionOutcomeLabel(resolution.outcome, lang)}</strong>
                </div>
                <p>{resolution.evidenceSummary}</p>
                {resolution.evidenceUrl ? (
                  <a href={resolution.evidenceUrl} target="_blank" rel="noreferrer">
                    {tr(lang, 'Open evidence', 'Άνοιγμα στοιχείων')}
                  </a>
                ) : null}
                <small>{formatDateTime(resolution.createdAt, lang)}</small>
              </div>
            ) : null}

            {settlement ? (
              <div className="marketTrustEvidence marketTrustSettlement">
                <div>
                  <span>{tr(lang, 'Settlement', 'Διακανονισμός')}</span>
                  <strong>{resolutionOutcomeLabel(settlement.outcome, lang)}</strong>
                </div>
                <p>
                  {tr(lang, 'Payout', 'Πληρωμή')} EUR {formatCompact(settlement.totalPayout, lang)} · {tr(lang, 'Refund', 'Επιστροφή')} EUR{' '}
                  {formatCompact(settlement.totalRefund, lang)}
                </p>
                <small>{formatDateTime(settlement.createdAt, lang)}</small>
              </div>
            ) : null}
          </div>
        </details>
      </div>
    </section>
  );
}
