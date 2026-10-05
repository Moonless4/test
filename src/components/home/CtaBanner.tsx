import { ArrowLeft, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Reveal } from '@/components/ui/Reveal'

interface CtaBannerProps {
  title?: string
  description?: string
  className?: string
}

export function CtaBanner({
  title = 'آماده‌اید ملک مناسب خود را پیدا کنید؟',
  description = 'بگذارید کارشناسان ما شما را به خانه یا سرمایه‌گذاری درست راهنمایی کنند.',
  className = 'bg-white',
}: CtaBannerProps) {
  return (
    <section className={`py-20 sm:py-24 ${className}`}>
      <Container>
        <Reveal>
          <div className="flex flex-col items-start gap-9 rounded-[24px] bg-mist px-8 py-11 sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy text-gold">
                <KeyRound className="h-6 w-6" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[clamp(1.25rem,2.4vw,1.8rem)] font-bold leading-[1.5] text-ink">
                  {title}
                </h2>
                <p className="mt-2.5 max-w-md text-sm leading-[1.95] text-muted">{description}</p>
              </div>
            </div>

            <Button
              to="/contact"
              size="lg"
              className="shrink-0"
              icon={<ArrowLeft className="h-4 w-4" strokeWidth={1.8} />}
            >
              تماس بگیرید
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
