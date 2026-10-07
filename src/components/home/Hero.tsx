import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../../lib/data';
import { toFa } from '../../lib/format';
import Img from '../ui/Img';

const SLIDE_MS = 7000;

/** Full-bleed editorial image slider — photos only, arrows on the sides. */
export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % heroSlides.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  const move = (step: number) =>
    setIndex((i) => (i + step + heroSlides.length) % heroSlides.length);

  const arrow =
    'absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-cocoa transition-colors hover:bg-cream lg:flex';

  return (
    <section className="pt-3 sm:pt-4" aria-label="بنر اصلی">
      <div className="relative overflow-hidden bg-beige">
        {/* Phones and tablets share one height; only desktop grows. */}
        <div className="relative min-h-[420px] lg:min-h-[520px]">
          {heroSlides.map((slide, i) => (
            <div
              key={slide.eyebrow}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={i !== index}
            >
              <Img
                src={slide.image}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className="h-full w-full object-cover object-center"
              />
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
