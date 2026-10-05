import clsx from 'clsx'
import { Container } from '@/components/ui/Container'
import { photo } from '@/lib/images'

interface PageHeroProps {
  label: string
  title: string
  description?: string
  imageId?: string
  className?: string
}

export function PageHero({ label, title, description, imageId, className }: PageHeroProps) {
  return (
    <section className={clsx('relative isolate overflow-hidden bg-navy', className)}>
      {imageId ? (
        <>
          <img
            src={photo(imageId, 2000)}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/92 via-navy/85 to-navy"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(80%_120%_at_85%_0%,rgba(197,160,105,0.16),transparent_60%)]"
        />
      )}

      <Container className="pb-14 pt-32 sm:pb-16 sm:pt-40 lg:pb-20 lg:pt-44">
        <p className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
          {label}
        </p>
        <h1 className="mt-5 max-w-3xl text-[clamp(2.1rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-white [animation-delay:120ms] animate-fade-up">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-white/70 [animation-delay:220ms] animate-fade-up">
            {description}
          </p>
        ) : null}
      </Container>
    </section>
  )
}
