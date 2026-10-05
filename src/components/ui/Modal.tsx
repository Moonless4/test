import clsx from 'clsx'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-navy/60 px-4 py-6 backdrop-blur-sm sm:items-center">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 h-full w-full cursor-pointer"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={clsx(
          'relative z-10 w-full animate-fade-up rounded-card bg-white p-7 shadow-lift outline-none sm:p-9',
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
        )}
      >
        {/* Close sits on the logical end edge, so it mirrors to the left in RTL. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن پنجره"
          className="absolute end-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-navy/12 text-navy transition-colors duration-300 hover:border-navy hover:bg-navy hover:text-white"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <h2 className="pe-12 text-[21px] font-semibold leading-snug text-ink">{title}</h2>
        {description ? <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p> : null}

        <div className="mt-7">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
