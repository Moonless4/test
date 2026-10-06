import { useEffect, useState } from 'react';
import type { Product } from '../../lib/types';
import DiscountBadge from '../ui/DiscountBadge';
import Img from '../ui/Img';

export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [product.id]);

  const current = product.images[Math.min(active, product.images.length - 1)];

  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-5">
      {/* Main stage */}
      <div className="relative flex-1 overflow-hidden rounded-panel border border-line bg-cream">
        <div className="aspect-square w-full sm:aspect-[4/5]">
          <Img
            key={current}
            src={current}
            alt={product.name}
            width={900}
            height={1125}
            decoding="async"
            className="h-full w-full object-cover motion-safe:animate-fade-in"
          />
        </div>
        {product.discount > 0 ? (
          <div className="absolute top-4 end-4">
            <DiscountBadge value={product.discount} />
          </div>
        ) : null}
      </div>

      {/* Thumbnails: a vertical strip on desktop, a row on mobile. */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto lg:w-[92px] lg:shrink-0 lg:flex-col lg:overflow-visible">
        {product.images.map((image, i) => (
          <button
            key={image}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`تصویر ${i + 1}`}
            aria-current={i === active}
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-cream transition-all duration-300 lg:h-[92px] lg:w-full ${
              i === active
                ? 'border-teal-800 opacity-100'
                : 'border-transparent opacity-65 hover:opacity-100'
            }`}
          >
            <Img
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
