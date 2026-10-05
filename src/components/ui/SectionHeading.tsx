import clsx from 'clsx'

interface SectionHeadingProps {
  label?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  className?: string
  titleClassName?: string
}

export function SectionHeading({
  label,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={clsx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {label ? (
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">
          {label}
        </p>
      ) : null}
      <h2
        className={clsx(
          'text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.02em]',
          tone === 'light' ? 'text-white' : 'text-ink',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={clsx(
            'mt-5 text-[15px] leading-relaxed sm:text-base',
            tone === 'light' ? 'text-white/70' : 'text-muted',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
