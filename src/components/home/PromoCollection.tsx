import { Link } from 'react-router-dom';
import Reveal from '../ui/Reveal';

/**
 * The sale banner near the foot of the page.
 *
 * Unlike the seasonal tiles it is finished campaign artwork with its own headline and CTA drawn
 * into it, so it takes the banner's own 1920×364 shape — a fixed tile height cropped the copy —
 * and carries no colour wash or hover zoom over that copy.
 */
export default function PromoCollection() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهاد ویژه">
      <Reveal>
        <Link
          to="/shop?discount=true"
          aria-label="پیشنهادهای ویژه"
          className="block overflow-hidden rounded-lg bg-[#2C483A]"
        >
          <picture>
            <source type="image/avif" srcSet="/promo/men-rack.avif" />
            <img
              src="/promo/men-rack.webp"
              alt=""
              width={1920}
              height={364}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </picture>
        </Link>
      </Reveal>
    </section>
  );
}
