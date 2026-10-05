import clsx from 'clsx'
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { PropertyImage } from '@/types'
import { photo, photoSrcSet } from '@/lib/images'

interface PropertyGalleryProps {
  images: PropertyImage[]
  className?: string
}

export function PropertyGallery({ images, className }: PropertyGalleryProps) {
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const total = images.length

  const move = useCallback(
    (direction: 1 | -1) => setIndex((current) => (current + direction + total) % total),
    [total],
  )

  useEffect(() => {
    if (!lightbox) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false)
      if (event.key === 'ArrowRight') move(1)
      if (event.key === 'ArrowLeft') move(-1)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [lightbox, move])

  const active = images[index]

  return (
    <div className={className}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Open image in full screen"
          className="group block w-full overflow-hidden rounded-card bg-mist"
        >
          <img
            key={active.id}
            src={photo(active.id, 1800)}
            srcSet={photoSrcSet(active.id, [640, 1024, 1600, 2000])}
            sizes="(min-width: 1024px) 62vw, 100vw"
            alt={active.alt}
            className="animate-fade-in aspect-[16/11] w-full object-cover transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.02]"
            decoding="async"
          />
          <span className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-navy backdrop-blur-sm">
            <Expand className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
            View full screen
          </span>
        </button>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {images.map((image, imageIndex) => (
          <button
            key={`${image.id}-${imageIndex}`}
            type="button"
            onClick={() => setIndex(imageIndex)}
            aria-label={`Show image ${imageIndex + 1} of ${total}`}
            aria-current={imageIndex === index}
            className={clsx(
              'relative h-20 w-28 shrink-0 overflow-hidden rounded-[12px] transition-all duration-500 ease-premium sm:h-24 sm:w-32',
              imageIndex === index
                ? 'ring-2 ring-gold ring-offset-2 ring-offset-white'
                : 'opacity-70 hover:opacity-100',
            )}
          >
            <img
              src={photo(image.id, 320)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Property image viewer"
          className="fixed inset-0 z-[70] flex flex-col bg-navy/97 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-5 py-5 sm:px-8">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-white/70">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              autoFocus
              aria-label="Close image viewer"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center px-4 pb-8 sm:px-10">
            <img
              key={active.id}
              src={photo(active.id, 2000)}
              alt={active.alt}
              className="animate-fade-in max-h-[76vh] w-auto max-w-full rounded-[12px] object-contain"
              decoding="async"
            />
          </div>

          <div className="flex items-center justify-center gap-4 pb-8">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous image"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next image"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors duration-300 hover:border-gold hover:text-gold"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
