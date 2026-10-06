import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { promoArt } from '../../lib/data';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';

const BANNERS = [
  {
    id: 'men',
    image: promoArt.men,
    eyebrow: 'فصل جدید استایل',
    title: 'کالکشن مردانه‌ی پاییز',
    text: 'جدیدترین مدل‌های بهار و تابستان با تخفیف ویژه',
    badge: '۴۰٪ تخفیف',
    to: '/shop/men',
    tone: 'teal' as const,
  },
  {
    id: 'women',
    image: promoArt.women,
    eyebrow: 'استایل زنانه',
    title: 'ظرافت در هر جزئیات',
    text: 'ترکیب راحتی و جذابیت در هر موقعیت',
    badge: null,
    to: '/shop/women',
    tone: 'beige' as const,
  },
];

export default function PromoBanners() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهادهای فصلی">
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {BANNERS.map((banner, i) => (
          <Reveal key={banner.id} delay={i * 100}>
            <Link
              to={banner.to}
              className="group relative flex min-h-[340px] items-center overflow-hidden rounded-panel p-6 shadow-soft transition-shadow duration-500 hover:shadow-lift sm:min-h-[380px] sm:p-8 lg:min-h-[420px]"
            >
              <Img
                src={banner.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
              />
              <div
                className={`absolute inset-0 ${
                  banner.tone === 'teal'
                    ? 'bg-gradient-to-l from-teal-900 via-teal-900/85 to-teal-900/25'
                    : 'bg-gradient-to-l from-[#3b2f24]/92 via-[#4a3b2c]/70 to-transparent'
                }`}
              />

              <div className="relative z-10 max-w-[320px]">
                <span className="text-[11px] font-medium tracking-wide text-white/70 sm:text-xs">
                  {banner.eyebrow}
                </span>
                <h3 className="mt-3 text-[26px] font-black leading-snug text-white sm:text-[34px]">
                  {banner.title}
                </h3>
                <p className="mt-3 text-[13px] leading-7 text-white/75 sm:text-sm">{banner.text}</p>

                {banner.badge ? (
                  <span className="mt-5 inline-flex items-center rounded-lg bg-sale px-3 py-1.5 text-[13px] font-bold text-white shadow-soft">
                    {banner.badge}
                  </span>
                ) : null}

                <span className="mt-6 flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-5 text-[13px] font-bold text-teal-900 transition-all duration-300 hover:bg-cream sm:h-12 sm:px-6 sm:text-sm">
                  مشاهده کالکشن
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
