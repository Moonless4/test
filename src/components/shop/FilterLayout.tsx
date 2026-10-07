import { useState, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { toFa } from '../../lib/format';
import type { Filters } from '../../lib/filters';
import FilterSidebar from './FilterSidebar';

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
  children: ReactNode;
};

/**
 * Desktop filter sidebar plus the mobile filter drawer, shared by the shop and
 * the search results page.
 */
export default function FilterLayout({ filters, onChange, resultCount, children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white text-[13px] font-medium text-ink transition-colors hover:border-teal-300 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        فیلترها
      </button>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7.5rem)] overflow-y-auto rounded-panel border border-line bg-white p-5">
            <FilterSidebar filters={filters} onChange={onChange} resultCount={resultCount} />
          </div>
        </aside>

        <div>{children}</div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <button
            type="button"
            aria-label="بستن فیلترها"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 h-full w-full bg-teal-950/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-panel bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-base font-bold text-ink">فیلترها</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="بستن"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-cream"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5">
              <FilterSidebar filters={filters} onChange={onChange} resultCount={resultCount} />
            </div>
            <footer className="border-t border-line p-4">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="h-12 w-full rounded-xl bg-teal-800 text-sm font-bold text-white transition-colors hover:bg-teal-700"
              >
                نمایش {toFa(resultCount)} کالا
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
