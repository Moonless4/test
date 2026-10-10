import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toFa } from '../../lib/format';

type Props = {
  page: number;
  totalPages: number;
  total: number;
  itemLabel: string;
  onChange: (page: number) => void;
};

/** Pagination for every admin list. RTL: «بعدی» sits on the left, where the next page should be. */
export default function Pagination({ page, totalPages, total, itemLabel, onChange }: Props) {
  if (totalPages <= 1) {
    return (
      <p className="mt-3 text-[12px] text-muted">
        {toFa(total)} {itemLabel}
      </p>
    );
  }

  const button =
    'inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 text-[12.5px] font-medium text-ink transition-colors hover:border-teal-300 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[12px] text-muted">
        {toFa(total)} {itemLabel} — صفحهٔ {toFa(page)} از {toFa(totalPages)}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={button}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronRight className="h-4 w-4" />
          قبلی
        </button>
        <button
          type="button"
          className={button}
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          بعدی
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
