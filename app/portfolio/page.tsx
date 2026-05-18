import { AlphaShell } from '@/components/alpha-shell';
import { PortfolioLivePanel } from '@/components/portfolio-live-panel';
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
    <AlphaShell title={tr(lang, 'Portfolio', 'Χαρτοφυλάκιο')} eyebrow={tr(lang, 'Wallet, performance, positions, and history', 'Πορτοφόλι, απόδοση, θέσεις και ιστορικό')} lang={lang}>
      <PortfolioLivePanel lang={lang} />
    </AlphaShell>
  );
}
