import { CtaBanner } from '@/components/home/CtaBanner'
import { TeamSection } from '@/components/home/TeamSection'
import { WhyChooseSection } from '@/components/home/WhyChooseSection'
import { PageHero } from '@/components/layout/PageHero'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { aboutImageIds, stats } from '@/data/site'
import { photo, photoSrcSet } from '@/lib/images'

export default function AboutPage() {
  return (
    <>
      <PageHero
        imageId={aboutImageIds.main}
        label="درباره ما"
        title="آژانسی بوتیک برای خانه‌های شاخص معماری"
        description="املاک افق هر سال به شماری محدود از مشتریان، در خرید، فروش و نگهداری املاک مسکونی استثنایی مشاوره می‌دهد."
      />

      <section className="bg-white py-20 sm:py-24 lg:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            <Reveal>
              <p className="eyebrow">ما کی هستیم</p>
              <h2 className="mt-5 text-[clamp(1.6rem,3.2vw,2.4rem)] font-bold leading-[1.45] text-ink">
                پیوندی آرام میان مردم و خانه‌های استثنایی
              </h2>
              <div className="mt-7 space-y-5 text-[15px] leading-[1.95] text-muted">
                <p>
                  املاک افق بر یک باور ساده بنا شد: بهترین خانه‌ها فروخته نمی‌شوند، واگذار
                  می‌شوند. کار ما این است که یک بنا، خیابانی که در آن نشسته و زندگی‌ای که برایش
                  خریداری می‌شود را بشناسیم — و سپس خریداری را بیابیم که بیشترین ارزش را برای آن
                  قائل است.
                </p>
                <p>
                  آگاهانه پرتفویی کوچک را نمایندگی می‌کنیم. هر سفارش را مشاوری ارشد پیش می‌برد که
                  بازار، املاک قابل مقایسه و پیشینهٔ مذاکره را می‌شناسد؛ نه اینکه کار را در زنجیره‌ای
                  به پایین بسپارد.
                </p>
                <p>
                  برای خریداران نیز همان نظم، در جهت معکوس کار می‌کند: مشاوره‌ای صبورانه و آگاهانه
                  دربارهٔ اینکه ارزش کجاست، نگهداری یک ملک چه هزینه‌ای دارد و کجا باید از معامله
                  گذشت.
                </p>
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-10 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-[25px] font-bold text-navy">{stat.value}</dd>
                    <dt className="mt-2 text-[12px] text-muted">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={120}>
              <div className="grid gap-4 sm:gap-5">
                <div className="overflow-hidden rounded-card bg-mist">
                  <img
                    src={photo(aboutImageIds.main, 1200)}
                    srcSet={photoSrcSet(aboutImageIds.main, [640, 960, 1280])}
                    sizes="(min-width: 1024px) 42vw, 90vw"
                    alt="اقامتگاهی مدرن با نمای چوبی و باغی محوطه‌سازی‌شده"
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/11] w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  <div className="overflow-hidden rounded-card bg-mist">
                    <img
                      src={photo(aboutImageIds.secondary, 800)}
                      srcSet={photoSrcSet(aboutImageIds.secondary, [420, 640, 900])}
                      sizes="(min-width: 1024px) 20vw, 45vw"
                      alt="نمای تیره و پانل‌دار که در غروب از درون روشن است"
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div className="overflow-hidden rounded-card bg-mist">
                    <img
                      src={photo('photo-1600585154340-be6161a56a0c', 800)}
                      srcSet={photoSrcSet('photo-1600585154340-be6161a56a0c', [420, 640, 900])}
                      sizes="(min-width: 1024px) 20vw, 45vw"
                      alt="خانه‌ای مدرن در ساعت آبی با شیشه‌های تمام‌قد"
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <WhyChooseSection />
      <TeamSection />
      <CtaBanner />
    </>
  )
}
