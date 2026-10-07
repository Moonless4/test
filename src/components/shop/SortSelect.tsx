import { ChevronLeft } from 'lucide-react';
import { sortOptions } from '../../lib/data';

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

/** Ordering dropdown shared by the shop and the search results. */
export default function SortSelect({ value, onChange, id = 'sort' }: Props) {
  return (
    <div className="relative flex-1 sm:flex-none">
      <label htmlFor={id} className="sr-only">
        ترتیب نمایش
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-line bg-white ps-4 pe-9 text-[13px] font-medium text-ink outline-none transition-colors hover:border-teal-300 sm:w-[190px]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronLeft className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 -rotate-90 text-muted" />
    </div>
  );
}
