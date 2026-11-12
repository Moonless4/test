import CampaignBanner from './CampaignBanner';
import Reveal from '../ui/Reveal';

/** The sale banner near the foot of the page, drawn at the artwork's own 1920×364 ratio. */
export default function PromoCollection() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهاد ویژه">
      <Reveal>
        <CampaignBanner
          to="/shop/men"
          label="پیشنهادهای ویژه"
          avif="/promo/men-rack.avif"
          webp="/promo/men-rack.webp"
        />
      </Reveal>
    </section>
  );
}
