import { AlphaShell } from '@/components/alpha-shell';
import { DiscoverBoard } from '@/components/discover-board';
import { normalizeLang, tr } from '@/lib/ui-lang';

export default async function MarketsPage({
  searchParams
}: {
  searchParams?: Promise<{ lang?: string; view?: string; cat?: string; q?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const lang = normalizeLang(params.lang);
  const view = (params.view as 'trending' | 'new' | 'liquid' | 'ending' | undefined) ?? 'trending';

  return (
    <AlphaShell title={tr(lang, 'Markets', 'Αγορές')} eyebrow={tr(lang, 'Probability-first discover board', 'Discover board με έμφαση στην πιθανότητα')} lang={lang}>
      <DiscoverBoard lang={lang} view={view} category={params.cat ?? null} query={params.q ?? null} />
    </AlphaShell>
  );
}
