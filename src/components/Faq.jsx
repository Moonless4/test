import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqs } from '../data/site'

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="bg-canvas/60 py-14 md:py-20">
      <div className="container-page grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-medium text-brand md:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            پرسش و پاسخ
          </span>
          <h2 className="text-[21px] font-extrabold text-ink md:text-[30px]">سوالات متداول</h2>
          <span className="mt-3 block h-1 w-14 rounded-full bg-brand" />
          <p className="mt-5 max-w-sm text-xs leading-6 text-ink-soft md:text-sm md:leading-7">
            اگر پاسخ سوال خود را پیدا نکردید، تیم پشتیبانی ما همه روزه از ۸ صبح تا ۵ عصر آماده
            پاسخگویی به شماست.
          </p>
          <a
            href="#contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark md:text-sm"
          >
            درخواست پشتیبانی
          </a>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((item, index) => {
            const isOpen = open === index
            return (
              <div
                key={item.q}
                className={`overflow-hidden rounded-[18px] border bg-white transition ${
                  isOpen ? 'border-brand/25 shadow-[0_18px_40px_-34px_rgba(43,27,20,0.8)]' : 'border-black/5'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-right md:px-5"
                >
                  <span className={`text-[13px] font-bold md:text-sm ${isOpen ? 'text-brand' : 'text-ink'}`}>
                    {item.q}
                  </span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
                      isOpen ? 'rotate-180 bg-brand text-white' : 'bg-canvas text-ink-soft'
                    }`}
                  >
                    <ChevronDown size={15} />
                  </span>
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-[11px] leading-6 text-ink-soft md:px-5 md:text-xs md:leading-7">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
