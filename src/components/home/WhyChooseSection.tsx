import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { stats, values } from '@/data/site'
import { toPersianDigits } from '@/lib/format'

export function WhyChooseSection() {
  return (
    <section className="bg-navy py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              tone="light"
              label="چرا افق"
              title="چرا افق را انتخاب کنید"
              description="بیست سال مشاوره به خریداران و فروشندگان خانه‌های شاخص، روشی از کار را شکل داده است: آرام، دقیق و کاملاً در خدمت مشتری."
              className="max-w-lg"
            />
          </Reveal>

          <div>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
              {values.map((value, index) => (
                <Reveal key={value.title} delay={index * 90}>
                  <div className="border-t border-white/15 pt-6">
                    <span className="text-[13px] font-semibold text-gold">
                      {toPersianDigits(String(index + 1).padStart(2, '0'))}
                    </span>
                    <h3 className="mt-4 text-[17px] font-bold text-white">{value.title}</h3>
                    <p className="mt-3 text-sm leading-[1.95] text-white/65">
                      {value.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={140}>
              <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-white/15 pt-10 sm:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dd className="text-[23px] font-bold text-gold">{stat.value}</dd>
                    <dt className="mt-2 text-[12px] text-white/55">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  )
}
