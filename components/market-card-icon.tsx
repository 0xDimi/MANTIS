import type { CSSProperties } from 'react';
import { resolveMarketCardIcon, type MarketCardIconInput } from '@/lib/market-card-icons';

type MarketCardIconProps = {
  item: MarketCardIconInput;
  size?: number;
  className?: string;
};

export function MarketCardIcon({ item, size = 52, className = '' }: MarketCardIconProps) {
  const icon = resolveMarketCardIcon(item);
  const style = {
    '--market-card-icon-size': `${size}px`,
    '--market-card-icon-radius': `${Math.round(size * 0.28)}px`,
    '--market-card-icon-position': icon.position ?? 'center'
  } as CSSProperties;

  return (
    <span className={`marketCardIcon ${className}`.trim()} style={style} aria-hidden="true">
      <img className="marketCardIconImage marketCardIconImageCover" src={icon.src} alt="" draggable={false} loading="lazy" decoding="async" />
    </span>
  );
}
