import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  compact?: boolean;
  tone?: 'brand' | 'white';
}

/** نشان سفربان — مسیر پرواز و نقطه‌ی مقصد */
export function Logo({ className, compact, tone = 'brand' }: LogoProps) {
  const markColor = tone === 'white' ? 'text-white' : 'text-brand-600';
  return (
    <Link to="/" className={cn('flex shrink-0 items-center gap-2.5', className)} aria-label="سفربان">
      <svg viewBox="0 0 40 40" className={cn('h-9 w-9', markColor)} aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="currentColor" />
        <path
          d="M10.5 25.8c5.2 1.9 10.4-1.2 12.7-6.1"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M9.5 17.6h7.8" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="27.2" cy="14.4" r="3.6" fill="white" />
      </svg>
      {!compact && (
        <span className="leading-tight">
          <span className={cn('block text-[1.05rem] font-extrabold', tone === 'white' ? 'text-white' : 'text-ink-900')}>
            سفربان
          </span>
          <span className={cn('block text-[0.6rem]', tone === 'white' ? 'text-white/70' : 'text-ink-400')}>
            رزرو آنلاین سفر
          </span>
        </span>
      )}
    </Link>
  );
}
