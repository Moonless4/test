import { toFa } from '../../lib/format';

/** The red percentage tag shown on discounted products. */
export default function DiscountBadge({
  value,
  size = 'md',
  className = '',
}: {
  value: number;
  size?: 'sm' | 'md';
  className?: string;
}) {
  if (!value) return null;

  const box =
    size === 'sm'
      ? 'h-6 rounded-md px-2 text-[11px]'
      : 'h-7 rounded-lg px-2.5 text-[12px] sm:text-[13px]';

  return (
    <span
      dir="ltr"
      className={`inline-flex items-center bg-sale font-bold text-white shadow-soft ${box} ${className}`}
    >
      -{toFa(value)}٪
    </span>
  );
}
