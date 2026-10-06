import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { heroSlides, promoArt } from '../../lib/data';
import { toFa } from '../../lib/format';
import Img from '../ui/Img';

const SLIDE_MS = 7000;

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % heroSlides.length),
      SLIDE_MS,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="container pt-5 sm:pt-7" aria-label="بنر اصلی">
      <div className="relative overflow-hidden rounded-panel bg-teal-800">
        <div className="relative min-h-[520px] sm:min-h-[540px] lg:min-h-[590px]">
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
              {/* Readability scrim: opaque towards the text side (right in RTL). */}
              <div className="absolute inset-0 bg-gradient-to-l from-teal-900 via-teal-900/80 to-teal-900/10 sm:via-teal-900/55 sm:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-950/60 via-transparent to-transparent lg:from-transparent" />
            </div>
          ))}

          <div className="relative flex h-full flex-col justify-center px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
            <div className="max-w-[600px]">
              {heroSlides.map((slide, i) =>
                i === index ? (
                  <div key={slide.eyebrow} className="motion-safe:animate-fade-up">
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-[11px] font-medium text-teal-100 ring-1 ring-white/20 backdrop-blur sm:text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                      {slide.eyebrow}
                    </span>

                    <h1 className="text-[32px] font-black leading-[1.25] text-white sm:text-[44px] sm:leading-[1.2] lg:text-[54px] lg:leading-[1.16]">
                      {slide.title[0]}
                      <span className="mt-1 block text-teal-200">{slide.title[1]}</span>
                    </h1>

                    <p className="mt-5 max-w-[440px] text-[13px] leading-7 text-white/75 sm:text-[15px] sm:leading-8 lg:ms-auto">
                      {slide.text}
                    </p>

                    <div className="mt-7 flex flex-wrap items-center gap-3 lg:justify-end">
                      <Link
                        to={slide.cta.to}
                        className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-teal-900 shadow-lift transition-all duration-300 hover:bg-cream sm:h-[52px] sm:px-7 sm:text-[15px]"
                      >
                        {slide.cta.label}
                        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                      </Link>
                      <Link
                        to="/shop?discount=true"
                        className="inline-flex h-12 items-center rounded-xl border border-white/30 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:h-[52px]"
                      >
                        تخفیف‌های ویژه
                      </Link>
                    </div>
                  </div>
                ) : null,
              )}

              <div className="mt-8 flex items-center gap-2 lg:justify-end">
                {heroSlides.map((slide, i) => (
                  <button
                    key={slide.eyebrow}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`اسلاید ${toFa(i + 1)}`}
                    aria-current={i === index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === index ? 'w-7 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Floating product cut-outs + script label (desktop only). */}
          <div className="pointer-events-none absolute bottom-8 left-10 hidden items-end gap-3 lg:flex">
            <Img
              src={promoArt.floatingOne}
              alt=""
              loading="lazy"
              className="h-36 w-28 rounded-2xl object-cover shadow-lift ring-4 ring-white/85"
            />
            <div className="flex flex-col items-start gap-1">
              <Img
                src={promoArt.floatingTwo}
                alt=""
                loading="lazy"
                className="h-24 w-20 -translate-y-3 rounded-2xl object-cover shadow-lift ring-4 ring-white/85"
              />
              <span className="font-script text-2xl text-white/90">New Collection</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
