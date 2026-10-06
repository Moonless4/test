import { Star } from 'lucide-react';
import { toFa } from '../../lib/format';

type Props = {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
};

export default function Rating({
  value,
  count,
  size = 'sm',
  showValue = false,
  className = '',
}: Props) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`امتیاز ${toFa(value)} از ۵`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i <= Math.round(value)
                ? 'fill-gold text-gold'
                : 'fill-transparent text-line'
            }`}
            strokeWidth={1.6}
            aria-hidden="true"
          />
        ))}
      </div>

      {showValue ? (
        <span className="text-xs font-medium text-ink">{toFa(value)}</span>
      ) : null}

      {count != null ? (
        <span className="text-[11px] text-muted sm:text-xs">({toFa(count)} نظر)</span>
      ) : null}
    </div>
  );
}
