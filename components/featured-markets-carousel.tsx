'use client';

import { useRef } from 'react';
import type { BoardMarket } from '@/lib/alpha-read-model';
import { tr } from '@/lib/ui-lang';
import type { UiLang } from '@/lib/ui-lang';
import { FeaturedMarketCard } from '@/components/featured-market-card';

type FeaturedMarketsCarouselProps = {
  markets: BoardMarket[];
  lang: UiLang;
};

export function FeaturedMarketsCarousel({ markets, lang }: FeaturedMarketsCarouselProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  function scrollByDirection(direction: 'prev' | 'next') {
    if (!railRef.current) return;

    const width = railRef.current.clientWidth;
    railRef.current.scrollBy({ left: direction === 'next' ? width * 0.9 : -width * 0.9, behavior: 'smooth' });
  }

  return (
    <section className="featuredCarouselWrap" aria-label={tr(lang, 'Featured markets', 'Προτεινόμενες αγορές')}>
      <button className="featuredNavButton" type="button" onClick={() => scrollByDirection('prev')} aria-label={tr(lang, 'Previous featured market', 'Προηγούμενη προτεινόμενη αγορά')}>
        ‹
      </button>

      <div className="featuredSwipe featuredSwipeLarge" ref={railRef}>
        {markets.map((market, index) => (
          <FeaturedMarketCard key={market.id} market={market} lang={lang} lead={index === 0} />
        ))}
      </div>

      <button className="featuredNavButton" type="button" onClick={() => scrollByDirection('next')} aria-label={tr(lang, 'Next featured market', 'Επόμενη προτεινόμενη αγορά')}>
        ›
      </button>
    </section>
  );
}
