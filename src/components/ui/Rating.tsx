import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import { faDigits } from '@/lib/jalali';

export function Stars({ count, className, size = 12 }: { count: number; className?: string; size?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} title={`${count} ستاره`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Icon
          key={index}
          name="star"
          filled={index < count}
          size={size}
          className={index < count ? 'text-accent-400' : 'text-ink-300'}
          strokeWidth={1.2}
        />
      ))}
    </span>
  );
}

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 9
      ? 'bg-success-600'
      : score >= 8
        ? 'bg-brand-600'
        : score >= 7
          ? 'bg-warning-500'
          : 'bg-ink-500';
  return (
    <span
      className={cn(
        'num inline-flex h-7 min-w-[2.4rem] items-center justify-center rounded-md px-2 text-xs font-bold text-white',
        tone,
        className,
      )}
    >
      {faDigits(score.toFixed(1))}
    </span>
  );
}

export function scoreLabel(score: number): string {
  if (score >= 9) return 'استثنایی';
  if (score >= 8.5) return 'عالی';
  if (score >= 8) return 'خیلی خوب';
  if (score >= 7) return 'خوب';
  return 'قابل قبول';
}
