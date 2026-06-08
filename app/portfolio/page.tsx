import { AlphaShell } from '@/components/alpha-shell';
import { PortfolioV2Panel } from '@/components/portfolio-v2-panel';
import { resolveServerLang } from '@/lib/ui-lang-server';
import { tr } from '@/lib/ui-lang';

export default async function PortfolioPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = await resolveServerLang({ searchParam: params.lang });

  return (
    <AlphaShell
      title={tr(lang, 'Portfolio', 'Χαρτοφυλάκιο')}
      eyebrow={tr(lang, 'Portfolio value, performance, positions and history', 'Αξία, απόδοση, θέσεις και ιστορικό')}
      lang={lang}
      showIntro={false}
    >
      <PortfolioV2Panel lang={lang} />
    </AlphaShell>
  );
}
