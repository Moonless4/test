import { useState } from 'react'
import {
  ArrowLeft,
  Clock,
  CreditCard,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Quote,
  Send,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import SectionHeading from './SectionHeading'
import { contactInfo, news, testimonials } from '../data/site'

const contactIcons = { Mail, Phone, Clock, MapPin }

const linkGroups = [
  { title: 'پشتیبانی', links: ['سوالات متداول', 'درخواست پشتیبانی', 'پیگیری سفارش'] },
  { title: 'سفارش', links: ['منوی غذا', 'رزرو میز', 'ارسال سفارش'] },
  { title: 'قوانین', links: ['قوانین و مقررات', 'حریم خصوصی', 'شرایط بازگشت'] },
]

const trustBadges = [
  { icon: ShieldCheck, label: 'پرداخت امن' },
  { icon: Truck, label: 'ارسال سریع' },
  { icon: CreditCard, label: 'درگاه بانکی' },
  { icon: Headphones, label: 'پشتیبانی ۲۴/۷' },
]

function Testimonials() {
  const [active, setActive] = useState(0)
  const current = testimonials[active]

  return (
    <div className="bg-cream py-14 md:py-16">
      <div className="container-page grid items-center gap-8 md:grid-cols-[0.85fr_1.15fr]">
        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-medium text-brand md:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            رضایت مهمانان
          </span>
          <h2 className="text-[21px] font-extrabold text-ink md:text-[28px]">نظرات مشتریان ما</h2>
          <span className="mt-3 block h-1 w-14 rounded-full bg-brand" />
          <p className="mt-4 max-w-sm text-xs leading-6 text-ink-soft md:text-sm md:leading-7">
            بیش از ۱۲ هزار مهمان تجربه غذاخوردن در نوال را به ما سپرده‌اند. چند نظر از آن‌ها را
            بخوانید.
          </p>

          <div className="mt-6 flex items-center gap-2">
            {testimonials.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`نظر ${item.name}`}
                className={`overflow-hidden rounded-full ring-2 transition ${
                  active === index
                    ? 'ring-brand'
                    : 'opacity-60 ring-transparent hover:opacity-100'
                }`}
              >
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-11 w-11 object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <figure className="relative rounded-[26px] bg-white p-6 shadow-[0_26px_50px_-40px_rgba(43,27,20,0.9)] md:p-8">
          <Quote size={34} className="text-gold" />
          <blockquote className="mt-4 text-sm leading-7 text-ink/85 md:text-base md:leading-8">
            {current.quote}
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3 border-t border-dashed border-black/10 pt-4">
            <img
              src={current.avatar}
              alt={current.name}
              className="h-11 w-11 rounded-full object-cover"
              loading="lazy"
            />
            <div>
              <p className="text-sm font-bold text-ink">{current.name}</p>
              <p className="text-[11px] text-ink-soft">{current.role}</p>
            </div>
            <span className="mr-auto text-sm font-black tracking-widest text-gold">★★★★★</span>
          </figcaption>
        </figure>
      </div>
    </div>
  )
}

export default function Footer() {
  return (
    <footer id="contact">
      <div className="border-t border-black/5 bg-white py-10 md:py-12">
        <div className="container-page grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {contactInfo.map((item) => {
            const Icon = contactIcons[item.icon]
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-[20px] bg-canvas/70 px-4 py-4"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-brand shadow-sm">
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 text-right">
                  <p className="text-[10px] text-ink-soft md:text-[11px]">{item.label}</p>
                  <p dir="ltr" className="truncate text-[11px] font-bold text-ink md:text-[13px]">
                    {item.value}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Testimonials />

      <div id="news" className="bg-white py-14 md:py-20">
        <div className="container-page">
          <SectionHeading title="جدیدترین اخبار سایت" action="همه اخبار" actionHref="#news" />

          <div className="grid gap-5 md:grid-cols-3">
            {news.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_18px_40px_-34px_rgba(43,27,20,0.8)] transition hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium text-ink">
                    {post.date}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-bold leading-6 text-ink md:text-[15px]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-6 text-ink-soft md:text-xs">
                    {post.excerpt}
                  </p>
                  <a
                    href="#news"
                    className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-brand md:text-xs"
                  >
                    مطالعه بیشتر
                    <ArrowLeft size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-night text-white">
        <div className="container-page grid gap-8 py-12 md:grid-cols-[1.3fr_repeat(3,0.7fr)] md:gap-10 md:py-14">
          <div>
            <div className="inline-block rounded-[18px] bg-brand px-5 py-2 text-center">
              <span className="block text-[9px] tracking-[0.3em] text-white/70">رستوران</span>
              <span className="block text-lg font-black">نوال</span>
            </div>
            <p className="mt-4 max-w-xs text-[11px] leading-6 text-white/60 md:text-xs md:leading-7">
              رستوران نوال از سال ۱۳۷۸ با هدف سرو غذای اصیل ایرانی و کیفیت پایدار در خدمت
              مهمانان خود است.
            </p>

            <div className="mt-5 flex items-center gap-2">
              <a
                href="#contact"
                aria-label="اینستاگرام"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-brand hover:text-white"
              >
                <Instagram size={16} />
              </a>
              <a
                href="tel:+982122345678"
                aria-label="تماس"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-brand hover:text-white"
              >
                <Phone size={16} />
              </a>
              <a
                href="mailto:info@naval-restaurant.ir"
                aria-label="ایمیل"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-brand hover:text-white"
              >
                <Send size={16} />
              </a>
            </div>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-bold text-white">{group.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#contact"
                      className="text-[11px] text-white/60 transition hover:text-gold md:text-xs"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col items-center gap-5 py-6 md:flex-row md:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {trustBadges.map((badge) => (
                <span
                  key={badge.label}
                  className="flex items-center gap-1.5 text-[10px] text-white/55 md:text-[11px]"
                >
                  <badge.icon size={15} className="text-gold" />
                  {badge.label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a
                href="#contact"
                className="rounded-full bg-gold px-5 py-2.5 text-[11px] font-bold text-ink transition hover:bg-white md:text-xs"
              >
                درخواست پشتیبانی
              </a>
              <p className="text-[10px] text-white/45 md:text-[11px]">
                © ۱۴۰۴ رستوران نوال، تمامی حقوق محفوظ است.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
