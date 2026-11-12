import CampaignBanner from './CampaignBanner';
import Reveal from '../ui/Reveal';

/** A single full-width campaign tile, drawn at the artwork's own ratio like the sale banner below. */
export default function PromoBanners() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهادهای فصلی">
      <Reveal>
        <CampaignBanner
          to="/shop/women"
          label="پوشاک اقتصادی زنانه"
          avif="/promo/women-rack.avif"
          webp="/promo/women-rack.webp"
        />
      </Reveal>
    </section>
  );
}
