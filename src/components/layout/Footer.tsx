import { Link } from 'react-router-dom';
import { Instagram, Mail, MapPin, Phone, Send } from 'lucide-react';
import { toFa } from '../../lib/format';

const COLUMNS = [
  {
    title: 'خدمات مشتریان',
    links: [
      { label: 'پیگیری سفارش', to: '/cart' },
      { label: 'پشتیبانی', to: '/blog' },
      { label: 'بازگشت کالا', to: '/blog' },
      { label: 'سوالات متداول', to: '/blog' },
    ],
  },
  {
    title: 'راهنمای خرید',
    links: [
      { label: 'نحوه ثبت سفارش', to: '/blog' },
      { label: 'روش‌های پرداخت', to: '/blog' },
      { label: 'شرایط ارسال', to: '/blog' },
      { label: 'قوانین و مقررات', to: '/blog' },
    ],
  },
  {
    title: 'دسترسی سریع',
    links: [
      { label: 'خانه', to: '/' },
      { label: 'مردانه', to: '/shop/men' },
      { label: 'زنانه', to: '/shop/women' },
      { label: 'کفش', to: '/shop/shoes' },
      { label: 'اکسسوری', to: '/shop/accessories' },
      { label: 'کیف و کوله', to: '/shop/bags' },
      { label: 'زیبایی', to: '/shop/beauty' },
    ],
  },
];

export default function Footer() {
  const linkClass =
    'inline-block py-1 text-[13px] text-white/70 transition-all duration-300 hover:translate-x-[-4px] hover:text-white hover:underline hover:decoration-teal-300 hover:underline-offset-4';

  return (
    <footer className="mt-16 bg-teal-900 pb-[69px] text-white sm:mt-20 min-[769px]:pb-0">
      <div className="container">
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="lg:col-span-4">
            {/* White lockup on a transparent file, so it sits straight on the dark footer. */}
            <img src="/medora-logo-white.png" alt="مدورا" className="h-9 w-auto" />

            <p className="mt-5 max-w-sm text-[13px] leading-7 text-white/65">
              مدورا، فروشگاه اینترنتی پوشاک و اکسسوری با تمرکز بر کیفیت دوخت، پارچه‌ی درست و
              طراحی امروزی. از میان جدیدترین کالکشن‌ها انتخاب کنید و درب منزل تحویل بگیرید.
            </p>

            <form
              className="mt-6 flex max-w-sm items-center gap-2 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/15"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="footer-email" className="sr-only">
                ایمیل
              </label>
              <input
                id="footer-email"
                type="email"
                dir="ltr"
                placeholder="ایمیل خود را وارد کنید"
                className="h-10 w-full bg-transparent px-3 text-left text-[13px] text-white outline-none placeholder:text-right placeholder:text-white/50"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-lg bg-white px-4 text-[13px] font-medium text-black transition-colors hover:bg-cream"
              >
                عضویت
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2">
              {[
                { Icon: Instagram, label: 'اینستاگرام' },
                { Icon: Send, label: 'تلگرام' },
                { Icon: Mail, label: 'پینترست' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-all duration-300 hover:bg-white hover:text-black"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} className="lg:col-span-2" aria-label={column.title}>
              <h3 className="mb-4 text-sm font-bold text-white">{column.title}</h3>
              <ul className="space-y-0.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-bold text-white">تماس با ما</h3>
            <ul className="space-y-3 text-[13px] text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-teal-300" />
                <span dir="ltr">{toFa('021-9100 2200')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-teal-300" />
                <span dir="ltr">info@medora.ir</span>
              </li>
              <li className="flex items-start gap-2 leading-6">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                تهران، خیابان ولیعصر، پلاک ۱۲۴، طبقه سوم
              </li>
            </ul>

            {/* eNamad trust badge — the artwork carries its own white background, so it keeps a
                white chip; on the dark footer a bare picture would look like a hole. */}
            <a
              href="https://trustseal.enamad.ir/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="نماد اعتماد الکترونیکی"
              className="mt-5 inline-flex rounded-xl bg-white p-2"
            >
              <img src="/enamad.png" alt="نماد اعتماد الکترونیکی" className="h-24 w-auto" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 sm:flex-row">
          <p className="text-[12px] text-white/55">© ۲۰۲۵ مدورا. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-5 text-[12px] text-white/55">
            <Link to="/blog" className="transition-colors hover:text-white">
              حریم خصوصی
            </Link>
            <Link to="/blog" className="transition-colors hover:text-white">
              قوانین و مقررات
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
