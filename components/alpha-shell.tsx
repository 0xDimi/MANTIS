import type { ReactNode } from 'react';
import { loadNotificationsFeed } from '@/lib/notifications';
import { loadHeaderSummary } from '@/lib/header-summary';
import { type UiLang } from '@/lib/ui-lang';
import { MantisHeader } from '@/components/mantis-header';

export async function AlphaShell({
  title,
  eyebrow,
  lang = 'en',
  showIntro = true,
  children
}: {
  title: string;
  eyebrow?: string;
  lang?: UiLang;
  showIntro?: boolean;
  children: ReactNode;
}) {
  const [summary, notifications] = await Promise.all([loadHeaderSummary(), loadNotificationsFeed()]);

  return (
    <div className="shell">
      <MantisHeader lang={lang} summary={summary} notifications={notifications} />

      {showIntro ? (
        <section className="pageIntro pageIntroCompact">
          <h1>{title}</h1>
          {eyebrow ? <p className="subtle">{eyebrow}</p> : null}
        </section>
      ) : null}

      {children}
    </div>
  );
}
