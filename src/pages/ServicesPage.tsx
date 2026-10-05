import { ArrowUpLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CtaBanner } from '@/components/home/CtaBanner'
import { PageHero } from '@/components/layout/PageHero'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { services, servicesImageId } from '@/data/site'
import { toPersianDigits } from '@/lib/format'
import { photo, photoSrcSet } from '@/lib/images'

const process = [
  {
    title: 'آشنایی',
    description: 'گفت‌وگویی دربارهٔ خواسته، بودجه و زندگی‌ای که ملک باید از آن پشتیبانی کند.',
  },
  {
    title: 'فهرست کوتاه',
    description: 'گزیده‌ای سنجیده، همراه با خانه‌های خارج از نمایش عمومی که هرگز به پورتال عمومی نمی‌رسند.',
  },
  {
    title: 'بازدیدهای خصوصی',
    description: 'دسترسی همراهی‌شده در زمان دلخواه شما، با ارزیابی صادقانه از هر خانه.',
  },
  {
    title: 'مذاکره',
    description: 'تحلیل املاک قابل مقایسه و راهبرد روشن مذاکره، به دست مشاور شما.',
  },
  {
    title: 'نهایی‌سازی',
    description: 'هماهنگی امور حقوقی، کارشناسی و جابه‌جایی تا خودِ اسباب‌کشی بی‌دغدغه پیش برود.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageHero
        imageId={servicesImageId}
        label="خدمات"
        title="مشاوره، بازاریابی و خرید برای املاک ممتاز"
        description="خدمتی کامل برای خریداران، فروشندگان و سرمایه‌گذاران — از نخستین گفت‌وگو تا پایان کار، با یک مشاور پاسخگو."
      />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              label="کار ما"
              title="شش تخصص، یک تیم"
              description="هر همکاری از توان کامل مجموعه بهره می‌برد، نه یک مشاور که تنها کار می‌کند."
            />
          </Reveal>

          <div className="mt-14 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Reveal key={service.title} delay={index * 70}>
                <article className="flex h-full flex-col border-t border-line pt-7">
                  <span className="text-[13px] font-semibold text-gold">
                    {toPersianDigits(String(index + 1).padStart(2, '0'))}
                  </span>
                  <h3 className="mt-5 text-[18px] font-bold text-ink">{service.title}</h3>
                  <p className="mt-3.5 flex-1 text-sm leading-[1.95] text-muted">
                    {service.description}
                  </p>
                  <Link
                    to="/contact"
                    className="group mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-navy transition-colors duration-300 hover:text-gold"
                  >
                    دربارهٔ این خدمت گفت‌وگو کنیم
                    <ArrowUpLeft
                      className="h-3.5 w-3.5 transition-transform duration-500 ease-premium group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy py-20 sm:py-24 lg:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              tone="light"
              label="روش کار ما"
              title="فرایندی ساخته‌شده بر رازداری"
              description="پنج مرحله، هرکدام با نتیجه‌ای روشن — تا همیشه بدانید مرحلهٔ بعد چیست."
            />
          </Reveal>

          <ol className="mt-14 grid gap-x-8 gap-y-10 border-t border-white/15 pt-10 sm:grid-cols-2 lg:grid-cols-5">
            {process.map((step, index) => (
              <Reveal key={step.title} delay={index * 70}>
                <li>
                  <span className="text-[13px] font-semibold text-gold">
                    {toPersianDigits(String(index + 1).padStart(2, '0'))}
                  </span>
                  <h3 className="mt-4 text-[16px] font-bold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-[1.95] text-white/65">{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="overflow-hidden rounded-card bg-mist">
                <img
                  src={photo('photo-1600573472550-8090b5e0745e', 1200)}
                  srcSet={photoSrcSet('photo-1600573472550-8090b5e0745e', [640, 960, 1280])}
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  alt="فضای داخلی که از میان دیوار شیشه‌ای به تراس استخر باز می‌شود"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <SectionHeading
                label="بازاریابی"
                title="ارائه‌ای هم‌تراز با معماری"
                description="عکاسی ادیتوریال، فیلم معماری، نقشه‌های طبقات و کمپین هدفمند — خصوصی یا در بازار آزاد، بسته به سفارش."
              />
              <ul className="mt-9 grid gap-x-8 gap-y-5 border-t border-line pt-9 sm:grid-cols-2">
                {[
                  'عکاسی معماری',
                  'فیلم و تصویربرداری هوایی',
                  'نقشهٔ طبقات و تور سه‌بعدی',
                  'شبکهٔ خریداران خصوصی',
                  'انتشار در پورتال‌ها و مطبوعات',
                  'گزارش عملکرد',
                ].map((item) => (
                  <li key={item} className="text-sm text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBanner
        title="مطمئن نیستید کدام خدمت را لازم دارید؟"
        description="خواسته‌تان را برای ما بفرستید تا صادقانه بگوییم این همکاری باید چگونه باشد."
      />
    </>
  )
}
