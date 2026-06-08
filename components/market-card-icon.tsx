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
    '--market-card-icon-background': icon.background ?? 'rgba(255, 255, 255, 0.02)',
    '--market-card-icon-padding': `${icon.padding ?? 0}px`
  } as CSSProperties;
  const imageClassName = icon.fit === 'contain' ? 'marketCardIconImage marketCardIconImageContain' : 'marketCardIconImage marketCardIconImageCover';

  return (
    <span className={`marketCardIcon ${className}`.trim()} style={style} aria-hidden="true">
      <span className="marketCardIconSurface">
        {icon.kind === 'pair' ? (
          <span className="marketCardIconPair">
            <span className="marketCardIconPairPane">
              <img
                className="marketCardIconImage marketCardIconImageCover"
                src={icon.leftSrc}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: icon.leftPosition ?? 'center' }}
              />
            </span>
            <span className="marketCardIconPairPane">
              <img
                className="marketCardIconImage marketCardIconImageCover"
                src={icon.rightSrc}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: icon.rightPosition ?? 'center' }}
              />
            </span>
          </span>
        ) : (
          <img
            className={imageClassName}
            src={icon.src}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: icon.position ?? 'center' }}
          />
        )}
      </span>
    </span>
  );
}
