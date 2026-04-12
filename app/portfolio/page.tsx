import { AlphaShell } from '@/components/alpha-shell';
import { PortfolioLivePanel } from '@/components/portfolio-live-panel';

export default async function PortfolioPage() {
  return (
    <AlphaShell title="Portfolio lane" eyebrow="Week 4: execution, ledger reflection, and live portfolio updates on rebuilt routes.">
      <PortfolioLivePanel />
    </AlphaShell>
  );
}
