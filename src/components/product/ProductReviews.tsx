import type { Product } from '../../lib/types';
import { toFa } from '../../lib/format';
import { useReviews } from '../../hooks/useReviews';
import SectionHeader from '../ui/SectionHeader';
import Rating from '../ui/Rating';
import ReviewForm from './ReviewForm';

export default function ProductReviews({ product }: { product: Product }) {
  const { reviews, addReview } = useReviews(product.id);

  // Customer reviews add up to the rating that comes with the catalog data.
  const total = product.reviewCount + reviews.length;
  const average =
    total === 0
      ? product.rating
      : (product.rating * product.reviewCount +
          reviews.reduce((sum, review) => sum + review.rating, 0)) /
        total;

  const list = [...reviews, ...product.reviews];

  return (
    <section id="product-reviews" className="mt-12 scroll-mt-24 sm:mt-16">
      <SectionHeader eyebrow="تجربه خریداران" title="نظرات مشتریان" />

      {/* The catalogue has no rating yet, so the summary appears only once a review exists — a
          block reading «۰ از ۰» would say less than the empty note below it. */}
      <div
        className={`flex-wrap items-center gap-x-8 gap-y-4 rounded-panel border border-line bg-cream p-5 sm:p-6 ${
          total === 0 ? 'hidden' : 'flex'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-black">{toFa(average.toFixed(1))}</span>
          <div>
            <Rating value={average} size="md" />
            <p className="mt-1 text-[12px] text-muted">از {toFa(total)} نظر ثبت‌شده</p>
          </div>
        </div>
        <p className="max-w-md text-[12px] leading-6 text-muted">
          نظرات زیر از سوی خریداران این محصول ثبت شده است. تجربه شما هم می‌تواند به انتخاب دیگران
          کمک کند.
        </p>
      </div>

      <div className="mt-6">
        <ReviewForm productName={product.name} onSubmit={addReview} />
      </div>

      {list.length === 0 ? (
        <p className="mt-8 text-[13px] text-muted">
          هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید!
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((review, index) => (
            <figure
              key={`${review.name}-${index}`}
              className="flex h-full flex-col rounded-panel border border-line p-5"
            >
              <div className="flex items-center gap-3">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[15px] font-bold text-black"
                  >
                    {review.name.trim().charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <figcaption className="truncate text-[13px] font-bold text-ink">
                    {review.name}
                  </figcaption>
                  <span className="text-[11px] text-muted">{review.date}</span>
                </div>
                {index < reviews.length ? (
                  <span className="ms-auto shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-black">
                    نظر شما
                  </span>
                ) : null}
              </div>

              <Rating value={review.rating} className="mt-3" />

              <blockquote className="mt-3 text-[13px] leading-7 text-ink/85">
                {review.text}
              </blockquote>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
