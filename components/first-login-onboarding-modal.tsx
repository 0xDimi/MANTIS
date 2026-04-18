'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { captureEvent } from '@/lib/client-telemetry';
import { tr, type UiLang } from '@/lib/ui-lang';

type FirstLoginOnboardingModalProps = {
  lang: UiLang;
  userId: string;
  authStatus: string | undefined;
  inviteOpened: boolean;
  showOnboarding: boolean;
  walletVisible: boolean;
};

export function FirstLoginOnboardingModal({
  lang,
  userId,
  authStatus,
  inviteOpened,
  showOnboarding,
  walletVisible
}: FirstLoginOnboardingModalProps) {
  const [open, setOpen] = useState(false);

  const trackedInvite = useRef(false);
  const trackedSignup = useRef(false);
  const trackedWallet = useRef(false);

  const storageKey = useMemo(() => `mantis_onboarding_seen:${userId}`, [userId]);

  useEffect(() => {
    if (!showOnboarding) {
      setOpen(false);
      return;
    }

    try {
      const seen = window.localStorage.getItem(storageKey) === '1';
      setOpen(!seen);
    } catch {
      setOpen(true);
    }
  }, [showOnboarding, storageKey]);

  useEffect(() => {
    if (inviteOpened && !trackedInvite.current) {
      trackedInvite.current = true;
      captureEvent('invite opened');
    }
  }, [inviteOpened]);

  useEffect(() => {
    if (authStatus === 'ok' && open && !trackedSignup.current) {
      trackedSignup.current = true;
      captureEvent('signup completed');
    }
  }, [authStatus, open]);

  useEffect(() => {
    if (open && walletVisible && !trackedWallet.current) {
      trackedWallet.current = true;
      captureEvent('wallet seeded');
      captureEvent('wallet visible');
    }
  }, [open, walletVisible]);

  const onboardingSteps = useMemo(
    () => [
      tr(lang, 'Choose a market.', 'Διάλεξε μια αγορά.'),
      tr(lang, 'Buy YES or NO.', 'Αγόρασε YES ή NO.'),
      tr(lang, 'Check your position in Portfolio.', 'Δες τη θέση σου στο Χαρτοφυλάκιο.')
    ],
    [lang]
  );

  function dismissOnboarding() {
    try {
      window.localStorage.setItem(storageKey, '1');
    } catch {
      // ignore storage errors
    }

    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="alphaModalOverlay" role="dialog" aria-modal="true" aria-labelledby="mantis-onboarding-title">
      <div className="card alphaModalCard stackSm">
        <p className="eyebrow">MANTIS alpha</p>
        <h2 id="mantis-onboarding-title">{tr(lang, 'Welcome to MANTIS.', 'Καλώς ήρθες στο MANTIS.')}</h2>
        <p className="panelText">
          {tr(
            lang,
            'This is a closed alpha using paper money. You can browse markets, buy or sell YES/NO, track your portfolio, and give feedback. No real-money deposits or withdrawals are involved.',
            'Αυτό είναι κλειστό alpha με paper money. Μπορείς να δεις αγορές, να αγοράσεις ή να πουλήσεις YES/NO, να παρακολουθείς το χαρτοφυλάκιό σου και να δίνεις feedback. Δεν υπάρχουν καταθέσεις ή αναλήψεις πραγματικών χρημάτων.'
          )}
        </p>

        <ol className="stackXs alphaOnboardingSteps">
          {onboardingSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <button className="button buttonPrimary" type="button" onClick={dismissOnboarding}>
          {tr(lang, 'Got it, start testing', 'Το κατάλαβα, ξεκινάω δοκιμές')}
        </button>
      </div>
    </div>
  );
}
