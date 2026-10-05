import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export default function NotFoundPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center bg-navy pt-24">
      <Container className="py-24 text-center">
        <p className="eyebrow">خطای ۴۰۴</p>
        <h1 className="mx-auto mt-6 max-w-xl text-[clamp(1.8rem,4vw,2.9rem)] font-bold leading-[1.4] text-white">
          این نشانی دیگر در دسترس نیست
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-[1.95] text-white/65">
          صفحه‌ای که دنبال آن بودید جابه‌جا شده یا هرگز وجود نداشته است. مجموعهٔ کنونی ما بهترین
          نقطه برای شروع دوباره است.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button to="/properties" size="lg" variant="ivory">
            مشاهدهٔ املاک
          </Button>
          <Button to="/" size="lg" variant="outlineLight">
            بازگشت به خانه
          </Button>
        </div>
      </Container>
    </section>
  )
}
