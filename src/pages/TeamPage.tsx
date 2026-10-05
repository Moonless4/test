import { Mail, Phone } from 'lucide-react'
import { CtaBanner } from '@/components/home/CtaBanner'
import { PageHero } from '@/components/layout/PageHero'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { agents } from '@/data/team'
import { telHref } from '@/lib/format'
import { photo, portraitSrcSet } from '@/lib/images'

const specialties: Record<string, string> = {
  'arash-rostegar': 'املاک ممتاز، فروش خارج از نمایش عمومی، خریداران بین‌المللی',
  'negar-tehrani': 'خانه‌های لوکس، فروش مجدد شاخص‌های معماری، بازدیدهای خصوصی',
  'kaveh-amini': 'خریدهای سرمایه‌گذاری، تحلیل بازدهی، راهبرد پرتفوی',
  'sara-bahrami': 'خانه‌های خانوادگی، جابه‌جایی، مشاورهٔ محله',
}

export default function TeamPage() {
  return (
    <>
      <PageHero
        label="تیم ما"
        title="مشاورانی که خیابان‌های خود را می‌شناسند"
        description="چهار متخصص ارشد، هرکدام پاسخگوی همهٔ مراحل یک معامله — بدون مرکز تماس و بدون واسپاری."
      />

      <section className="bg-white py-20 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading
              label="رهبری"
              title="با تیم آشنا شوید"
              description="به هر مشاور مستقیماً دسترسی دارید — تماس‌ها را خودشان پاسخ می‌دهند، نه یک میز کار."
            />
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent, index) => (
              <Reveal key={agent.id} delay={index * 80}>
                <article className="group">
                  <div className="overflow-hidden rounded-card bg-mist">
                    <img
                      src={photo(agent.photoId, 640)}
                      srcSet={portraitSrcSet(agent.photoId)}
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                      alt={`${agent.name}، ${agent.role} در املاک افق`}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-[1.04]"
                    />
                  </div>

                  <h3 className="mt-5 text-[17px] font-bold text-ink">{agent.name}</h3>
                  <p className="mt-1 text-[13px] text-gold">{agent.role}</p>
                  <p className="mt-4 text-sm leading-[1.95] text-muted">{specialties[agent.id]}</p>

                  <div className="mt-5 flex flex-col gap-2 border-t border-line pt-5 text-[13px]">
                    <a
                      href={telHref(agent.phone)}
                      className="flex items-center gap-2.5 text-muted transition-colors duration-300 hover:text-navy"
                      dir="ltr"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.phone}
                    </a>
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center gap-2.5 break-all text-muted transition-colors duration-300 hover:text-navy"
                      dir="ltr"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.8} aria-hidden="true" />
                      {agent.email}
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBanner
        title="با مشاور منطقهٔ خود گفت‌وگو کنید"
        description="بگویید به دنبال چه هستید تا متخصص مناسب را معرفی کنیم."
      />
    </>
  )
}
