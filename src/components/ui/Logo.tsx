import clsx from 'clsx'
import { Link } from 'react-router-dom'

interface LogoProps {
  tone?: 'light' | 'dark'
  className?: string
}

export function Logo({ tone = 'light', className }: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="Horizon Properties — home"
      className={clsx('group flex items-center gap-3', className)}
    >
      <span
        className={clsx(
          'grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border transition-colors duration-500 ease-premium',
          tone === 'light'
            ? 'border-white/20 bg-white/5 group-hover:border-gold/60'
            : 'border-navy/15 bg-navy group-hover:border-gold/60',
        )}
      >
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className="h-[19px] w-[19px] text-gold"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 27V9l6.5-4.2V27" />
          <path d="M19 27V14.6L25.5 10.4V27" />
          <path d="M3.5 27h25" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={clsx(
            'text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors duration-500',
            tone === 'light' ? 'text-white' : 'text-ink',
          )}
        >
          Horizon
        </span>
        <span
          className={clsx(
            'mt-1 text-[9px] font-medium uppercase tracking-[0.34em]',
            tone === 'light' ? 'text-white/60' : 'text-muted',
          )}
        >
          Properties
        </span>
      </span>
    </Link>
  )
}
