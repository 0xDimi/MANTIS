import type { BoardMarket, FeaturedMarketNews } from '@/lib/alpha-read-model';
import type { UiLang } from '@/lib/ui-lang';

type FeaturedMarketNewsCopy = {
  headline: Record<UiLang, string>;
  summary: Record<UiLang, string>;
  publishedAt: string;
};

const featuredNewsBySlug: Record<string, FeaturedMarketNewsCopy> = {
  'gre-politics-tsipras-new-party-may15': {
    headline: {
      en: 'Tsipras sets May 26 event for new political movement',
      el: 'Ο Τσίπρας ορίζει εκδήλωση στις 26 Μαΐου για νέο πολιτικό φορέα'
    },
    summary: {
      en: 'The market now has a clear date to watch, with the launch window moving from speculation to a scheduled public event.',
      el: 'Η αγορά έχει πλέον καθαρή ημερομηνία παρακολούθησης, καθώς το ενδεχόμενο περνά από τη φημολογία σε προγραμματισμένη δημόσια εκδήλωση.'
    },
    publishedAt: '2026-05-23T11:30:00+03:00'
  },
  'gre-politics-tsipras-new-party-before-jun1': {
    headline: {
      en: 'Tsipras sets May 26 event for new political movement',
      el: 'Ο Τσίπρας ορίζει εκδήλωση στις 26 Μαΐου για νέο πολιτικό φορέα'
    },
    summary: {
      en: 'The market now has a clear date to watch, with the launch window moving from speculation to a scheduled public event.',
      el: 'Η αγορά έχει πλέον καθαρή ημερομηνία παρακολούθησης, καθώς το ενδεχόμενο περνά από τη φημολογία σε προγραμματισμένη δημόσια εκδήλωση.'
    },
    publishedAt: '2026-05-23T11:30:00+03:00'
  },
  'gre-economy-cpi-above-5-may2026': {
    headline: {
      en: 'May inflation print remains on the June 10 calendar',
      el: 'Η μέτρηση πληθωρισμού Μαΐου παραμένει στο ημερολόγιο για 10 Ιουνίου'
    },
    summary: {
      en: 'The next relevant catalyst is the scheduled May CPI release, which will decide whether the 5.0% threshold stays live.',
      el: 'Ο επόμενος βασικός καταλύτης είναι η προγραμματισμένη ανακοίνωση ΔΤΚ Μαΐου, που θα κρίνει αν το όριο του 5,0% παραμένει ενεργό.'
    },
    publishedAt: '2026-05-23T10:45:00+03:00'
  }
};

export function getFeaturedMarketNews(slug: string, lang: UiLang): FeaturedMarketNews | null {
  const news = featuredNewsBySlug[slug];

  if (!news) return null;

  return {
    headline: news.headline[lang],
    summary: news.summary[lang],
    publishedAt: news.publishedAt
  };
}

export function withFeaturedMarketNews<T extends BoardMarket>(market: T, lang: UiLang): T {
  return {
    ...market,
    featuredNews: getFeaturedMarketNews(market.slug, lang)
  };
}
