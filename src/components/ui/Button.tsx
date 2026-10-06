import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'light' | 'outline' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  children: ReactNode;
  to?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  fullWidth?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>;

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-teal-800 text-white hover:bg-teal-700 shadow-soft hover:shadow-card',
  light: 'bg-white text-teal-800 hover:bg-cream shadow-soft hover:shadow-card',
  outline:
    'border border-teal-800/25 text-teal-800 hover:bg-teal-800 hover:text-white hover:border-teal-800',
  ghost: 'text-teal-800 hover:bg-teal-50',
  dark: 'bg-teal-900 text-white hover:bg-teal-800',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-5 text-sm sm:text-[15px]',
  lg: 'h-12 px-6 text-[15px] sm:h-[52px] sm:px-7 sm:text-base',
};

export default function Button({
  children,
  to,
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth,
  ...rest
}: Props) {
  const base = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
    'transition-all duration-300 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
    SIZES[size],
    VARIANTS[variant],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={base} {...rest}>
      {children}
    </button>
  );
}
