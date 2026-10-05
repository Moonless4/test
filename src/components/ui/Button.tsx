import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'outlineLight' | 'outlineDark' | 'ivory' | 'gold'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-500 ease-premium disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-700 hover:shadow-lift',
  outlineLight: 'border border-white/45 text-white hover:border-white hover:bg-white/10',
  outlineDark: 'border border-navy/25 text-navy hover:border-navy hover:bg-navy hover:text-white',
  ivory: 'bg-white text-navy hover:bg-gold hover:text-white',
  gold: 'bg-gold text-white hover:bg-gold-dark',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
}

export interface ButtonProps {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
  icon?: ReactNode
  to?: string
  href?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  ariaExpanded?: boolean
  ariaControls?: string
  title?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  icon,
  to,
  href,
  type = 'button',
  onClick,
  disabled,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  title,
}: ButtonProps) {
  const classes = clsx(base, variants[variant], sizes[size], className)
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} aria-label={ariaLabel} title={title}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel}
        title={title}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      title={title}
    >
      {content}
    </button>
  )
}
