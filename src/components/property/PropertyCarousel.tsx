import clsx from 'clsx'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { PropertyCard } from '@/components/property/PropertyCard'
import type { Property } from '@/types'

interface PropertyCarouselProps {
  properties: Property[]
  label?: string
  className?: string
  eagerFirst?: boolean
}

export function PropertyCarousel({
  properties,
  label = 'املاک ویژه',
  className,
  eagerFirst = false,
}: PropertyCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const [edges, setEdges] = useState({ atStart: true, atEnd: false })
  const [progress, setProgress] = useState(0)

  // In RTL the scroll origin sits at the right, so scrollLeft runs 0 → −max.
  // Normalising with Math.abs keeps the edge detection independent of sign.
  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const position = Math.abs(el.scrollLeft)
    setEdges({
      atStart: position <= 6,
      atEnd: position >= max - 6,
    })
    setProgress(max > 0 ? Math.min(position / max, 1) : 0)
  }, [])

  useEffect(() => {
    updateScrollState()
    window.addEventListener('resize', updateScrollState)
    return () => window.removeEventListener('resize', updateScrollState)
  }, [updateScrollState])

  const step = () => {
    const el = scrollerRef.current
    const card = el?.querySelector<HTMLElement>('[data-card]')
    return card ? card.offsetWidth + 24 : 340
  }

  // direction 1 = next item (visually leftwards in RTL), -1 = previous.
  const go = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const position = Math.abs(el.scrollLeft)

    if (direction === 1 && position >= max - 6) {
      el.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }
    if (direction === -1 && position <= 6) {
      el.scrollTo({ left: -max, behavior: 'smooth' })
      return
    }
    el.scrollBy({ left: -step() * direction, behavior: 'smooth' })
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const el = scrollerRef.current
    if (!el) return
    drag.current = { active: true, startX: event.clientX, startScroll: el.scrollLeft, moved: false }
    el.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return
    const el = scrollerRef.current
    if (!el) return
    const delta = event.clientX - drag.current.startX
    if (Math.abs(delta) > 4) drag.current.moved = true
    // RTL: dragging right reveals earlier cards, so scrollLeft moves toward 0.
    el.scrollLeft = drag.current.startScroll + delta
  }

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const el = scrollerRef.current
    if (drag.current.active && el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }
    if (drag.current.active) {
      drag.current.active = false
      updateScrollState()
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(-1)
    }
  }

  const arrowClasses = (disabled: boolean) =>
    clsx(
      'absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white text-navy shadow-[0_16px_40px_-18px_rgba(10,25,47,0.45)] transition-all duration-500 ease-premium hover:bg-navy hover:text-white sm:grid',
      disabled ? 'cursor-default opacity-40 hover:bg-white hover:text-navy' : 'hover:scale-105',
    )

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={scrollerRef}
        role="group"
        aria-label={`${label} — گالری قابل مرور`}
        tabIndex={0}
        onScroll={updateScrollState}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault()
            event.stopPropagation()
            drag.current.moved = false
          }
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-1"
      >
        {properties.map((property, index) => (
          <div
            key={property.id}
            data-card
            className="w-[86%] shrink-0 snap-start sm:w-[58%] lg:w-[40%] xl:w-[31.5%]"
          >
            <PropertyCard
              property={property}
              eager={eagerFirst && index === 0}
              sizes="(min-width: 1280px) 32vw, (min-width: 1024px) 40vw, (min-width: 640px) 58vw, 86vw"
            />
          </div>
        ))}
      </div>

      {/* RTL mirrors the controls: previous sits on the right, next on the left. */}
      <button
        type="button"
        onClick={() => go(-1)}
        className={clsx(arrowClasses(edges.atStart), '-right-6')}
        aria-label="املاک قبلی"
      >
        <ArrowRight className="h-[18px] w-[18px]" strokeWidth={1.7} />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className={clsx(arrowClasses(edges.atEnd), '-left-6')}
        aria-label="املاک بعدی"
      >
        <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.7} />
      </button>

      <div className="mt-9 flex items-center gap-4">
        <div dir="ltr" className="h-px w-full max-w-[220px] bg-line">
          <div
            className="h-px bg-navy transition-[transform] duration-300 ease-out"
            style={{ width: '32%', transform: `translateX(-${progress * 212}%)` }}
          />
        </div>
        <span className="text-[12px] text-muted/70">برای دیدن بیشتر بکشید</span>
      </div>
    </div>
  )
}
