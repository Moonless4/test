import { Loader2, RotateCcw, WifiOff } from 'lucide-react';
import type { ApiError } from '../../lib/api/client';

/**
 * The two states a section shows while it waits for the API.
 *
 * They exist so that no screen has to invent its own wording, and so that the store says the same
 * thing about a slow request wherever the shopper meets it. Both reserve the height the loaded
 * content will take, so a rail does not push the page around when it arrives.
 */

export function SectionLoading({ label = 'در حال دریافت از فروشگاه…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-[180px] items-center justify-center gap-2.5 rounded-panel bg-cream/40 text-[13px] text-muted"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function SectionError({
  error,
  onRetry,
  className = '',
}: {
  error: ApiError;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-line bg-cream/40 px-6 py-10 text-center ${className}`}
      role="alert"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-soft">
        <WifiOff className="h-5 w-5" />
      </span>
      <p className="max-w-sm text-[13px] leading-7 text-muted">{error.message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[12.5px] font-medium text-ink transition-colors hover:border-teal-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          تلاش دوباره
        </button>
      ) : null}
    </div>
  );
}
