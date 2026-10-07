import { formatPrice } from '../../lib/format';

type Props = {
  price: number;
  originalPrice: number;
  size?: 'sm' | 'md' | 'lg';
  align?: 'start' | 'center' | 'end';
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
        <span className={`${originalSize} text-muted line-through decoration-sale/50 decoration-[1.5px]`}>
          {formatPrice(originalPrice)}
        </span>
      ) : null}
      <span
        className={`${currentSize} font-bold ${
          discounted ? 'text-teal-800' : 'text-ink'
        }`}
      >
        {formatPrice(price)}
      </span>
    </div>
  );
}
