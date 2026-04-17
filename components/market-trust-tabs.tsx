'use client';

import { useMemo, useState } from 'react';
import type { MarketDetailRead } from '@/lib/alpha-read-model';
import { formatCompact, formatDateTime } from '@/lib/format';
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
};

type TrustTab = 'rules' | 'context' | 'resolution';

function resolutionOutcomeLabel(outcome: 'yes' | 'no' | 'void', lang: UiLang) {
  if (outcome === 'yes') return tr(lang, 'Yes', 'Ναι');
  if (outcome === 'no') return tr(lang, 'No', 'Όχι');
  return tr(lang, 'Void', 'Άκυρο');
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
  status
}: MarketTrustTabsProps) {
  const [activeTab, setActiveTab] = useState<TrustTab>('rules');

  const tabs = useMemo(
    () => [
      { key: 'rules' as const, label: tr(lang, 'Rules', 'Κανόνες') },
      { key: 'context' as const, label: tr(lang, 'Market Context', 'Πλαίσιο Αγοράς') },
      { key: 'resolution' as const, label: tr(lang, 'Resolution', 'Επίλυση') }
    ],
    [lang]
  );

  return (
    <section className="marketTrustLayer" id="rules-layer" aria-label={tr(lang, 'Market trust details', 'Λεπτομέρειες αξιοπιστίας αγοράς')}>
      <div className="marketTrustTabs" role="tablist" aria-label={tr(lang, 'Market detail tabs', 'Καρτέλες λεπτομερειών αγοράς')}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? 'marketTrustTab marketTrustTabActive' : 'marketTrustTab'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="marketTrustContent" role="tabpanel">
        {activeTab === 'rules' ? (
          <div className="marketTrustSection stackSm">
            <p className="marketTrustLead">{tr(lang, 'Core rules and void conditions for this market.', 'Βασικοί κανόνες και όροι ακύρωσης για αυτή την αγορά.')}</p>
            <p>{voidRule}</p>
          </div>
        ) : null}

        {activeTab === 'context' ? (
          <div className="marketTrustSection stackSm">
            <p>{description ?? tr(lang, 'This market tracks a live public outcome with measurable data updates until close.', 'Αυτή η αγορά παρακολουθεί ένα δημόσιο αποτέλεσμα με μετρήσιμες ενημερώσεις μέχρι τη λήξη.')}</p>
            <p>
              {tr(lang, 'Primary source', 'Κύρια πηγή')}: <strong>{sourcePrimary}</strong>
            </p>
            <p>
              {tr(lang, 'Fallback source', 'Εναλλακτική πηγή')}: <strong>{sourceFallback ?? tr(lang, 'No fallback source provided.', 'Δεν υπάρχει εναλλακτική πηγή.')}</strong>
            </p>
          </div>
        ) : null}

        {activeTab === 'resolution' ? (
          <div className="marketTrustSection stackSm">
            <div className="marketTrustResolutionGrid">
              <div>
                <span>{tr(lang, 'Trading closes', 'Λήξη διαπραγμάτευσης')}</span>
                <strong>{formatDateTime(closeTime, lang)}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Resolution target', 'Στόχος επίλυσης')}</span>
                <strong>{resolutionTime ? formatDateTime(resolutionTime, lang) : '—'}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Market status', 'Κατάσταση αγοράς')}</span>
                <strong>{localizedMarketStatus(status, lang, 'long')}</strong>
              </div>
              <div>
                <span>{tr(lang, 'Source hierarchy', 'Ιεραρχία πηγών')}</span>
                <strong>{sourceFallback ? tr(lang, 'Primary + fallback', 'Κύρια + εναλλακτική') : tr(lang, 'Primary source only', 'Μόνο κύρια πηγή')}</strong>
              </div>
            </div>

            {resolution ? (
              <div className="marketTrustSubSection">
                <p>
                  {tr(lang, 'Outcome', 'Αποτέλεσμα')}: <strong>{resolutionOutcomeLabel(resolution.outcome, lang)}</strong>
                </p>
                <p>{resolution.evidenceSummary}</p>
                <p>{formatDateTime(resolution.createdAt, lang)}</p>
              </div>
            ) : null}

            {settlement ? (
              <div className="marketTrustSubSection">
                <p>
                  {tr(lang, 'Payout', 'Πληρωμή')} €{formatCompact(settlement.totalPayout, lang)} · {tr(lang, 'Refund', 'Επιστροφή')} €{formatCompact(settlement.totalRefund, lang)}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
