import { useCallback, useEffect, useState } from 'react';
import type { ProductReview } from '../lib/types';

const STORAGE_KEY = 'styleon.reviews';

type ReviewsByProduct = Record<string, ProductReview[]>;

const readStorage = (): ReviewsByProduct => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReviewsByProduct) : {};
  } catch {
    return {};
  }
};

/** Reviews submitted by customers in this browser, kept per product. */
export function useReviews(productId: string) {
  const [reviews, setReviews] = useState<ReviewsByProduct>(readStorage);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const addReview = useCallback(
    (review: ProductReview) => {
      setReviews((prev) => ({
        ...prev,
        [productId]: [review, ...(prev[productId] ?? [])],
      }));
    },
    [productId],
  );

  return { reviews: reviews[productId] ?? [], addReview };
}
