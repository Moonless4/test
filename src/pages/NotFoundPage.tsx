import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export default function NotFoundPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center bg-navy pt-24">
      <Container className="py-24 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
          Error 404
        </p>
        <h1 className="mx-auto mt-6 max-w-xl text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white">
          This address is no longer available
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/65">
          The page you were looking for has moved or never existed. Our current portfolio is the
          best place to start again.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to="/properties" size="lg" variant="ivory">
            View properties
          </Button>
          <Button to="/" size="lg" variant="outlineLight">
            Back to home
          </Button>
        </div>
      </Container>
    </section>
  )
}
