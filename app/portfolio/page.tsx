import { AlphaShell } from '@/components/alpha-shell';
import { PortfolioLivePanel } from '@/components/portfolio-live-panel';

export default async function PortfolioPage() {
  return (
    <AlphaShell title="Portfolio" eyebrow="Wallet, positions, and recent trades">
      <PortfolioLivePanel />
    </AlphaShell>
  );
}
