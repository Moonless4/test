import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { heroSlides } from '../../lib/data';
import { toFa } from '../../lib/format';
import Img from '../ui/Img';

const SLIDE_MS = 7000;

/** Editorial banner slider: beige canvas, photo centre, dark-brown CTA and round arrows. */
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
        <div className="relative flex min-h-[420px] items-center sm:min-h-[470px] lg:min-h-[520px]">
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
              {/* Beige scrim that keeps the copy legible over the photo. */}
              <div className="absolute inset-0 bg-[linear-gradient(to_left,rgba(233,222,208,0.97)_0%,rgba(233,222,208,0.93)_34%,rgba(233,222,208,0.55)_62%,rgba(233,222,208,0)_100%)]" />
            </div>
          ))}

          <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-center gap-7 px-6 pb-16 pt-10 sm:px-10 sm:pb-16 sm:pt-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-20 lg:py-14">
            <div className="max-w-[520px]">
              {heroSlides.map((slide, i) =>
                i === index ? (
                  <div key={slide.eyebrow} className="motion-safe:animate-fade-up">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-[11px] font-medium text-cocoa ring-1 ring-cocoa/10 backdrop-blur sm:text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-wine" />
                      {slide.eyebrow}
                    </span>

                    <h1 className="mt-4 text-[30px] font-black leading-[1.3] text-cocoa sm:text-[42px] sm:leading-[1.22] lg:text-[52px] lg:leading-[1.16]">
                      {slide.title[0]}
                      <span className="mt-1 block">{slide.title[1]}</span>
                    </h1>

                    <p className="mt-4 max-w-[430px] text-[13px] leading-7 text-cocoa/75 sm:text-[15px] sm:leading-8">
                      {slide.text}
                    </p>
                  </div>
                ) : null,
              )}
            </div>

            <div className="shrink-0">
              {heroSlides.map((slide, i) =>
                i === index ? (
                  <div
                    key={slide.eyebrow}
                    className="motion-safe:animate-fade-up flex flex-col items-start gap-3"
                  >
                    <Link
                      to={slide.cta.to}
                      className="inline-flex h-12 items-center rounded-full bg-cocoa px-7 text-[13px] font-bold text-white shadow-lift transition-all duration-300 hover:bg-cocoa/90 sm:h-[52px] sm:text-sm"
                    >
                      {slide.cta.label}
                    </Link>
                    <Link
                      to="/shop?discount=true"
                      className="text-[12px] font-medium text-cocoa/70 underline-offset-4 transition-colors hover:text-cocoa hover:underline sm:text-[13px]"
                    >
                      تخفیف‌های ویژه
                    </Link>
                  </div>
                ) : null,
              )}
            </div>
          </div>

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
