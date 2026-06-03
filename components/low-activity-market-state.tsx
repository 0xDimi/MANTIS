import { formatRelativeTime } from '@/lib/format';
import { tr, type UiLang } from '@/lib/ui-lang';

type LowActivityMarketStateProps = {
  lang: UiLang;
  tradeCount: number;
  lastTradeAt?: string | null;
};

function tradeCountLabel(tradeCount: number, lang: UiLang) {
  if (tradeCount <= 0) {
    return tr(lang, 'No confirmed prints in this window', 'Καμία επιβεβαιωμένη συναλλαγή σε αυτό το εύρος');
  }

  if (tradeCount === 1) {
    return tr(lang, '1 confirmed print in this window', '1 επιβεβαιωμένη συναλλαγή σε αυτό το εύρος');
  }

  return lang === 'el'
    ? `${tradeCount} επιβεβαιωμένες συναλλαγές σε αυτό το εύρος`
    : `${tradeCount} confirmed prints in this window`;
}

export function LowActivityMarketState({ lang, tradeCount, lastTradeAt }: LowActivityMarketStateProps) {
  return (
    <div className="lowActivityState" role="note" aria-label={tr(lang, 'Quiet market state', 'Κατάσταση ήρεμης αγοράς')}>
      <div className="lowActivityStateIntro">
        <span className="lowActivityStateEyebrow">{tr(lang, 'Quiet market', 'Ήρεμη αγορά')}</span>
        <p className="lowActivityStateText">
          {tradeCount > 0
            ? tr(
                lang,
                'A few confirmed trades set the tone here. MANTIS holds the last printed level until fresh flow arrives.',
                'Λίγες επιβεβαιωμένες συναλλαγές δίνουν τον τόνο εδώ. Το MANTIS κρατά το τελευταίο εκτυπωμένο επίπεδο μέχρι να μπει νέα ροή.'
              )
            : tr(
                lang,
                'No fresh trades landed in this window. MANTIS holds the last confirmed level instead of inventing motion.',
                'Δεν μπήκαν νέες συναλλαγές σε αυτό το εύρος. Το MANTIS κρατά το τελευταίο επιβεβαιωμένο επίπεδο αντί να επινοεί κίνηση.'
              )}
        </p>
      </div>

      <div className="lowActivityStateMeta">
        <span>{tradeCountLabel(tradeCount, lang)}</span>
        <span>
          {lastTradeAt
            ? `${tr(lang, 'Last trade', 'Τελευταία συναλλαγή')} ${formatRelativeTime(lastTradeAt, lang)}`
            : tr(lang, 'Waiting for the first print', 'Αναμονή για την πρώτη συναλλαγή')}
        </span>
      </div>
    </div>
  );
}
