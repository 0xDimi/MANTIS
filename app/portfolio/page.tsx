import { AlphaShell } from '@/components/alpha-shell';
import { PortfolioLivePanel } from '@/components/portfolio-live-panel';
import { normalizeLang, tr } from '@/lib/ui-lang';

export default async function PortfolioPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = normalizeLang(params.lang);

  return (
    <AlphaShell title={tr(lang, 'Portfolio', 'Χαρτοφυλάκιο')} eyebrow={tr(lang, 'Wallet, positions, and recent trades', 'Πορτοφόλι, θέσεις και πρόσφατες συναλλαγές')} lang={lang}>
      <PortfolioLivePanel lang={lang} />
    </AlphaShell>
  );
}
