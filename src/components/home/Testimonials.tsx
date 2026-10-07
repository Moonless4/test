import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { promoArt, testimonials } from '../../lib/data';
import { useDragScroll } from '../../hooks/useDragScroll';
import Img from '../ui/Img';
import Rating from '../ui/Rating';
import Reveal from '../ui/Reveal';

export default function Testimonials() {
  const railRef = useRef<HTMLDivElement>(null);
  const railDrag = useDragScroll(railRef);

  return (
    <section className="mt-12 bg-white py-12 sm:mt-16 sm:py-16" aria-label="نظرات مشتریان">
      <div className="container">
        {/* grid-cols-1 keeps the auto track from stretching to the review carousel's
            max-content width on phones, which widened the whole document. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-4">
            <span className="text-xs font-medium tracking-wide text-black sm:text-[13px]">
              رضایت شما
            </span>
            <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl lg:text-[28px]">
              نظرات مشتریان
            </h2>
            <span className="mt-3 block h-1 w-12 rounded-full bg-teal-800" />
            <p className="mt-5 max-w-[380px] text-[13px] leading-7 text-muted sm:text-sm sm:leading-8">
              بیش از ۱۲٬۰۰۰ مشتری تا امروز از استایل آن خرید کرده‌اند. اینها بخشی از نظرات ثبت‌شده
              در مورد کیفیت کالا و تجربه خرید است.
            </p>

            <div className="mt-7 hidden overflow-hidden rounded-panel lg:block">
              <Img
                src={promoArt.testimonials}
                alt=""
                loading="lazy"
                className="h-[230px] w-full object-cover"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <div
              ref={railRef}
              {...railDrag}
              className="no-scrollbar -mx-4 flex cursor-grab snap-x snap-mandatory select-none gap-4 overflow-x-auto px-4 pb-2 active:cursor-grabbing sm:mx-0 sm:cursor-auto sm:grid sm:select-text sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0"
            >
              {testimonials.map((item, i) => (
                <Reveal
                  key={item.name}
                  delay={i * 90}
                  className="w-[80%] shrink-0 snap-start sm:w-auto"
                >
                  <figure className="flex h-full flex-col gap-4 rounded-panel border border-line bg-white p-5 shadow-soft sm:p-6">
                    <div className="flex items-center justify-between">
                      <Rating value={item.rating} size="md" />
                      <Quote className="h-6 w-6 text-teal-100" />
                    </div>
                    <blockquote className="text-[13px] leading-7 text-ink/85 sm:text-sm sm:leading-8">
                      «{item.text}»
                    </blockquote>
                    <figcaption className="mt-auto flex items-center gap-3 border-t border-line pt-4">
                      <Img
                        src={item.avatar}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-cream"
                      />
                      <span className="text-[13px] font-bold text-ink">{item.name}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
