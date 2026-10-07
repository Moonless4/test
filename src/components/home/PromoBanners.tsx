import { Link } from 'react-router-dom';
import { promoArt } from '../../lib/data';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';

const BANNERS = [
  { id: 'men', image: promoArt.men, title: 'کالکشن مردانه', to: '/shop/men' },
  { id: 'women', image: promoArt.women, title: 'کالکشن زنانه', to: '/shop/women' },
];

/** Compact olive promo tiles — photo only, no copy. */
export default function PromoBanners() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهادهای فصلی">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {BANNERS.map((banner, i) => (
          <Reveal key={banner.id} delay={i * 100}>
            <Link
              to={banner.to}
              aria-label={banner.title}
              className="group relative block h-[150px] overflow-hidden bg-[#3F4635] sm:h-[170px] lg:h-[190px]"
            >
              <Img
                src={banner.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
              />
              {/* Muted olive wash that ties both tiles to one tone. */}
              <div className="absolute inset-0 bg-[#3F4635]/30" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
