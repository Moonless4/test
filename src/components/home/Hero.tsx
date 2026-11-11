import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../../lib/data';
import { toFa } from '../../lib/format';
import Img from '../ui/Img';

const SLIDE_MS = 7000;

/** Full-bleed editorial image slider — photos only, arrows on the sides. */
export default function Hero() {
  const [index, setIndex] = useState(0);
  // The wide desktop crop inside a phone-height box zooms in ~2.6×, so phones take their own
  // crop, shaped like the box they fill.
  const [phone] = useState(() => window.matchMedia('(max-width: 639px)').matches);
  // Only the first slide is on screen at load, and it is the page's LCP image: the two that
  // rotate in are fetched once the browser is idle, so they cannot compete with it for
  // bandwidth. The timeout keeps that from ever being later than the first rotation.
  const [followers, setFollowers] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % heroSlides.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const idle = window.requestIdleCallback(
      () => setFollowers(true),
      { timeout: SLIDE_MS - 2000 },
    );
    return () => window.cancelIdleCallback(idle);
  }, []);

  const move = (step: number) =>
    setIndex((i) => (i + step + heroSlides.length) % heroSlides.length);

  const arrow =
    'absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-cocoa transition-colors hover:bg-cream lg:flex';

  return (
    <section className="pt-3 sm:pt-4" aria-label="بنر اصلی">
      <div className="relative overflow-hidden bg-beige">
        {/* The banners carry their copy baked into the artwork, so the box takes each crop's own
            shape — 640×501 on a phone, 1920×465 above it — and nothing is cropped away. The old
            fixed heights would have cut the headlines and the CTA button off these wide banners. */}
        <div className="relative aspect-[640/501] sm:aspect-[1920/465]">
          {heroSlides.map((slide, i) => (
            <div
              key={slide.eyebrow}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={i !== index}
            >
              {/* The first slide is the page's LCP image; the other two sit inside the viewport as
                  well, so without a low priority they would compete with it. */}
              {i === 0 || followers ? (
                <picture className="block h-full w-full">
                  {/* AVIF is ~45% smaller than the WebP fallback and is what the LCP preload in
                      `index.html` names; the WebP is what a browser without AVIF renders. */}
                  <source type="image/avif" srcSet={phone ? slide.imagePhoneAvif : slide.imageAvif} />
                  <Img
                    src={phone ? slide.imagePhone : slide.image}
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    priority={i === 0 ? 'high' : 'low'}
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </picture>
              ) : null}
            </div>
          ))}

          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="اسلاید قبلی"
            className={`${arrow} start-4`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="اسلاید بعدی"
            className={`${arrow} end-4`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.eyebrow}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`اسلاید ${toFa(i + 1)}`}
                aria-current={i === index}
                className={`h-2.5 w-2.5 rounded-full ring-1 ring-cocoa/10 transition-all duration-300 ${
                  i === index ? 'bg-white' : 'bg-white/60 hover:bg-white/85'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
