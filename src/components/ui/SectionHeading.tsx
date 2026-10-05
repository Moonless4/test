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
        align === 'center' ? 'mx-auto text-center' : 'text-start',
        className,
      )}
    >
      {label ? <p className="mb-4 eyebrow">{label}</p> : null}
      <h2
        className={clsx(
          'text-[clamp(1.7rem,3.6vw,2.6rem)] font-bold leading-[1.45]',
          tone === 'light' ? 'text-white' : 'text-ink',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={clsx(
            'mt-5 text-[15px] leading-[1.95]',
            tone === 'light' ? 'text-white/70' : 'text-muted',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
