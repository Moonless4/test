import { promoArt } from '../../lib/data';
import Reveal from '../ui/Reveal';
import BannerTile from './BannerTile';

const BANNERS = [
  { id: 'men', image: promoArt.men, label: 'کالکشن مردانه', to: '/shop/men' },
  { id: 'women', image: promoArt.women, label: 'کالکشن زنانه', to: '/shop/women' },
];

export default function PromoBanners() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهادهای فصلی">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {BANNERS.map((banner, i) => (
          <Reveal key={banner.id} delay={i * 100}>
            <BannerTile to={banner.to} image={banner.image} label={banner.label} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
