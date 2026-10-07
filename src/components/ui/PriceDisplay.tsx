import type { ReactNode } from 'react';
import { formatNumber } from '../../lib/format';
import Price from './Price';

type Props = {
  price: number;
  originalPrice: number;
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end';
  /** Small tag shown next to the struck-through original price. */
  tag?: ReactNode;
  className?: string;
};

/**
 * Price rule: whenever a product is discounted, the original price stays
 * visible with a strikethrough directly above the discounted price.
 */
export default function PriceDisplay({
  price,
  originalPrice,
  size = 'md',
  align = 'start',
  tag,
  className = '',
}: Props) {
  const discounted = originalPrice > price;

  const currentSize =
    size === 'lg' ? 'text-xl sm:text-2xl' : size === 'sm' ? 'text-sm' : 'text-[15px] sm:text-base';
  const originalSize = size === 'lg' ? 'text-sm sm:text-base' : 'text-[11px] sm:text-xs';

  return (
    <div
      className={`flex flex-col gap-1 ${
        align === 'center'
          ? 'items-center text-center'
          : align === 'end'
            ? 'items-end text-end'
            : 'items-start'
      } ${className}`}
    >
      {discounted ? (
        <span className="flex items-center gap-1.5">
          {tag}
          {/* The struck original price carries no currency glyph — plain digits under a pale red line. */}
          <span
            className={`${originalSize} text-muted line-through decoration-sale/50 decoration-[1.5px]`}
          >
            {formatNumber(originalPrice)}
          </span>
        </span>
      ) : null}
      <span className={`${currentSize} font-bold ${discounted ? 'text-black' : 'text-ink'}`}>
        <Price value={price} />
      </span>
    </div>
  );
}
