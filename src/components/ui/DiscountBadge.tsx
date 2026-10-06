import { toFa } from '../../lib/format';

/** The red percentage tag shown on discounted products. */
export default function DiscountBadge({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  if (!value) return null;
  return (
    <span
      dir="ltr"
      className={`inline-flex h-7 items-center rounded-lg bg-sale px-2.5 text-[12px] font-bold text-white shadow-soft sm:text-[13px] ${className}`}
    >
      -{toFa(value)}٪
    </span>
  );
}
