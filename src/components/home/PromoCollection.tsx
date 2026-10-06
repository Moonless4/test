import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { promoArt } from '../../lib/data';
import Img from '../ui/Img';
import Reveal from '../ui/Reveal';

export default function PromoCollection() {
  return (
    <section className="container mt-12 sm:mt-16" aria-label="پیشنهاد ویژه">
      <Reveal>
        <div className="relative flex min-h-[280px] items-center overflow-hidden rounded-panel bg-teal-800 p-7 shadow-soft sm:min-h-[320px] sm:p-10 lg:min-h-[340px] lg:p-14">
          <Img
            src={promoArt.collection}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-teal-950 via-teal-900/85 to-teal-900/20" />

          <div className="relative z-10 max-w-[520px]">
            <span className="text-[11px] font-medium tracking-wide text-teal-200 sm:text-xs">
              پیشنهادهای خرید
            </span>
            <h2 className="mt-3 text-[24px] font-black leading-snug text-white sm:text-[32px] lg:text-[36px]">
              تخفیف‌های ویژه برای خریدهای بیشتر
            </h2>
            <p className="mt-4 max-w-[420px] text-[13px] leading-7 text-white/75 sm:text-sm">
              با انتخاب از میان پوشاک تخفیف‌دار، از هر خرید خود بیشترین بهره را ببرید. ارسال رایگان
              برای سفارش‌های بالای ۵٫۰۰۰٫۰۰۰ تومان.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/shop?discount=true"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[13px] font-bold text-teal-900 transition-all duration-300 hover:bg-cream sm:text-sm"
              >
                مشاهده پیشنهادها
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
              <Link
                to="/shop"
                className="inline-flex h-12 items-center rounded-xl border border-white/30 px-5 text-[13px] font-medium text-white transition-colors hover:bg-white/10 sm:text-sm"
              >
                همه محصولات
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
